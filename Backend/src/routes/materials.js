const router = require('express').Router();
const multer = require('multer');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../lib/prisma');
const authenticate = require('../middleware/auth');
const formatBytes = require('../utils/formatBytes');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

function getS3Client() {
  if (!process.env.AWS_BUCKET_NAME) return null;
  return new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

// GET /api/v1/subjects/:subjectId/materials?type=all|pdf|image|link&q=&unitId=
router.get('/subjects/:subjectId/materials', authenticate, async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const { type, q, unitId } = req.query;

    // Resolve unitId (unit_key or UUID) to internal UUID if provided
    let resolvedUnitId;
    if (unitId) {
      const unit = await prisma.unit.findFirst({
        where: { OR: [{ unitKey: unitId }, { id: unitId }] },
      });
      resolvedUnitId = unit?.id;
    }

    const materials = await prisma.material.findMany({
      where: {
        subjectId,
        ...(type && type !== 'all' && { type }),
        ...(q && { name: { contains: q, mode: 'insensitive' } }),
        ...(resolvedUnitId && { unitId: resolvedUnitId }),
      },
      include: { unit: true },
      orderBy: [{ unit: { sortOrder: 'asc' } }, { createdAt: 'desc' }],
    });

    // Group by unit
    const grouped = new Map();
    for (const m of materials) {
      const key = m.unit.unitKey || m.unit.id;
      if (!grouped.has(key)) {
        grouped.set(key, { unitId: key, unitName: m.unit.name, files: [] });
      }
      grouped.get(key).files.push({
        id: m.id,
        name: m.name,
        type: m.type,
        date: m.createdAt,
        teacher: m.teacherName,
        size: formatBytes(m.sizeBytes ? Number(m.sizeBytes) : null),
        url: m.externalUrl || m.fileUrl || null,
      });
    }

    res.json([...grouped.values()]);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/materials
router.post('/materials', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    const { subjectId, unitId, name, type, externalUrl, teacherName } = req.body;
    if (!subjectId || !unitId || !name || !type) {
      return res.status(400).json({ error: 'subjectId, unitId, name and type are required' });
    }

    const unit = await prisma.unit.findFirst({
      where: { OR: [{ unitKey: unitId }, { id: unitId }] },
    });
    if (!unit) return res.status(404).json({ error: 'Unit not found' });

    let fileUrl = null;
    let sizeBytes = null;

    if (req.file) {
      const s3 = getS3Client();
      if (!s3) return res.status(503).json({ error: 'File storage not configured' });

      const key = `materials/${uuidv4()}-${req.file.originalname}`;
      await s3.send(new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      }));
      fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
      sizeBytes = BigInt(req.file.size);
    }

    const material = await prisma.material.create({
      data: {
        subjectId,
        unitId: unit.id,
        name,
        type,
        fileUrl,
        externalUrl: externalUrl || null,
        sizeBytes,
        teacherName: teacherName || null,
        uploadedBy: req.userId,
      },
    });

    res.status(201).json({ ...material, sizeBytes: material.sizeBytes ? Number(material.sizeBytes) : null });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/materials/:materialId/download
router.get('/materials/:materialId/download', authenticate, async (req, res, next) => {
  try {
    const material = await prisma.material.findUnique({
      where: { id: req.params.materialId },
      select: { type: true, fileUrl: true, externalUrl: true },
    });
    if (!material) return res.status(404).json({ error: 'Material not found' });

    if (material.type === 'link') {
      return res.json({ url: material.externalUrl });
    }

    const s3 = getS3Client();
    if (!s3 || !material.fileUrl) {
      return res.json({ url: material.fileUrl });
    }

    const urlObj = new URL(material.fileUrl);
    const key = urlObj.pathname.slice(1);
    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: key }),
      { expiresIn: 3600 }
    );

    res.json({ url: signedUrl });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
