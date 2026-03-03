const router = require('express').Router();
const prisma = require('../lib/prisma');
const authenticate = require('../middleware/auth');

// GET /api/v1/semesters
router.get('/semesters', authenticate, async (_req, res, next) => {
  try {
    const semesters = await prisma.semester.findMany({ orderBy: { id: 'asc' } });
    res.json(semesters);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/semesters/:semesterId/subjects
router.get('/semesters/:semesterId/subjects', authenticate, async (req, res, next) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: { semesterId: parseInt(req.params.semesterId), isActive: true },
      select: { id: true, code: true, name: true },
      orderBy: { code: 'asc' },
    });
    res.json(subjects);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/subjects/:subjectId/units
router.get('/subjects/:subjectId/units', authenticate, async (req, res, next) => {
  try {
    const { subjectId } = req.params;

    const units = await prisma.unit.findMany({
      where: { subjectId },
      include: {
        _count: { select: { materials: true } },
        unitProgress: { where: { userId: req.userId } },
      },
      orderBy: [{ sortOrder: 'asc' }, { number: 'asc' }],
    });

    res.json(units.map(u => ({
      id: u.unitKey || u.id,
      number: u.number,
      name: u.name,
      teacher: u.teacherName,
      materialCount: u._count.materials,
      progress: u.unitProgress[0]?.progressPercent ?? 0,
    })));
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/subjects/:subjectId/home-summary
router.get('/subjects/:subjectId/home-summary', authenticate, async (req, res, next) => {
  try {
    const { subjectId } = req.params;

    const units = await prisma.unit.findMany({
      where: { subjectId },
      include: { unitProgress: { where: { userId: req.userId } } },
    });

    let completed = 0, inProgress = 0, notStarted = 0, totalProgress = 0;
    for (const u of units) {
      const pct = u.unitProgress[0]?.progressPercent ?? 0;
      totalProgress += pct;
      if (pct === 100) completed++;
      else if (pct > 0) inProgress++;
      else notStarted++;
    }

    const totalMaterials = await prisma.material.count({ where: { subjectId } });

    res.json({
      completedCount: completed,
      inProgressCount: inProgress,
      notStartedCount: notStarted,
      totalMaterials,
      averageProgress: units.length ? Math.round(totalProgress / units.length) : 0,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
