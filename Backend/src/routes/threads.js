const router = require('express').Router();
const prisma = require('../lib/prisma');
const authenticate = require('../middleware/auth');
const timeAgo = require('../utils/timeAgo');

function formatThread(t) {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    tags: t.threadTags?.map(tt => tt.tag.name) ?? [],
    author: { name: t.author.name, avatar: t.author.avatar },
    upvotes: t.upvotesCount,
    downvotes: t.downvotesCount,
    commentCount: t.commentsCount,
    timeAgo: timeAgo(t.createdAt),
  };
}

// GET /api/v1/subjects/:subjectId/threads?q=&tag=&unitId=&page=1&limit=20
router.get('/subjects/:subjectId/threads', authenticate, async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const { q, tag, unitId, page = 1, limit = 20 } = req.query;

    let resolvedUnitId;
    if (unitId) {
      const unit = await prisma.unit.findFirst({
        where: { OR: [{ unitKey: unitId }, { id: unitId }] },
      });
      resolvedUnitId = unit?.id;
    }

    const threads = await prisma.thread.findMany({
      where: {
        subjectId,
        ...(resolvedUnitId && { unitId: resolvedUnitId }),
        ...(q && {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        }),
        ...(tag && {
          threadTags: { some: { tag: { name: { equals: tag, mode: 'insensitive' } } } },
        }),
      },
      include: {
        author: { select: { name: true, avatar: true } },
        threadTags: { include: { tag: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    });

    res.json(threads.map(formatThread));
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/subjects/:subjectId/threads
router.post('/subjects/:subjectId/threads', authenticate, async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const { title, description, unitId, tags = [] } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'title and description are required' });
    }

    let resolvedUnitId = null;
    if (unitId) {
      const unit = await prisma.unit.findFirst({
        where: { OR: [{ unitKey: unitId }, { id: unitId }] },
      });
      resolvedUnitId = unit?.id || null;
    }

    // Upsert all tags first
    const tagRecords = await Promise.all(
      tags.map(name =>
        prisma.tag.upsert({ where: { name }, create: { name }, update: {} })
      )
    );

    const thread = await prisma.thread.create({
      data: {
        subjectId,
        unitId: resolvedUnitId,
        title,
        description,
        authorId: req.userId,
        threadTags: {
          create: tagRecords.map(t => ({ tagId: t.id })),
        },
      },
      select: { id: true, createdAt: true },
    });

    res.status(201).json({ id: thread.id, createdAt: thread.createdAt });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/threads/:threadId
router.get('/threads/:threadId', authenticate, async (req, res, next) => {
  try {
    const { threadId } = req.params;

    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        author: { select: { name: true, avatar: true } },
        threadTags: { include: { tag: { select: { name: true } } } },
        comments: {
          include: { author: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
        votes: { where: { userId: req.userId } },
      },
    });
    if (!thread) return res.status(404).json({ error: 'Thread not found' });

    res.json({
      ...formatThread(thread),
      myVote: thread.votes[0]?.vote ?? 0,
      comments: thread.comments.map(c => ({
        id: c.id,
        text: c.text,
        upvotes: c.upvotesCount,
        timeAgo: timeAgo(c.createdAt),
        author: { name: c.author.name, avatar: c.author.avatar },
      })),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/threads/:threadId/comments
router.post('/threads/:threadId/comments', authenticate, async (req, res, next) => {
  try {
    const { threadId } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });

    const exists = await prisma.thread.findUnique({ where: { id: threadId }, select: { id: true } });
    if (!exists) return res.status(404).json({ error: 'Thread not found' });

    const [comment] = await prisma.$transaction([
      prisma.threadComment.create({
        data: { threadId, authorId: req.userId, text },
        select: { id: true, createdAt: true },
      }),
      prisma.thread.update({
        where: { id: threadId },
        data: { commentsCount: { increment: 1 } },
      }),
    ]);

    res.status(201).json({ id: comment.id, createdAt: comment.createdAt });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/threads/:threadId/vote  — body: { vote: 1 | -1 | 0 }
router.put('/threads/:threadId/vote', authenticate, async (req, res, next) => {
  try {
    const { threadId } = req.params;
    const { vote } = req.body;
    if (![1, -1, 0].includes(vote)) {
      return res.status(400).json({ error: 'vote must be 1, -1, or 0' });
    }

    const exists = await prisma.thread.findUnique({ where: { id: threadId }, select: { id: true } });
    if (!exists) return res.status(404).json({ error: 'Thread not found' });

    const existing = await prisma.threadVote.findUnique({
      where: { threadId_userId: { threadId, userId: req.userId } },
    });
    const oldVote = existing?.vote ?? 0;

    if (vote === 0) {
      if (existing) {
        await prisma.threadVote.delete({
          where: { threadId_userId: { threadId, userId: req.userId } },
        });
      }
    } else {
      await prisma.threadVote.upsert({
        where: { threadId_userId: { threadId, userId: req.userId } },
        create: { threadId, userId: req.userId, vote },
        update: { vote },
      });
    }

    const upDelta   = (vote === 1  ? 1 : 0) - (oldVote === 1  ? 1 : 0);
    const downDelta = (vote === -1 ? 1 : 0) - (oldVote === -1 ? 1 : 0);

    const updated = await prisma.thread.update({
      where: { id: threadId },
      data: {
        upvotesCount:   { increment: upDelta },
        downvotesCount: { increment: downDelta },
      },
      select: { upvotesCount: true, downvotesCount: true },
    });

    res.json({ upvotes: updated.upvotesCount, downvotes: updated.downvotesCount, myVote: vote });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
