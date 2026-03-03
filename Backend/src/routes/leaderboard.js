const router = require('express').Router();
const prisma = require('../lib/prisma');
const authenticate = require('../middleware/auth');

// GET /api/v1/subjects/:subjectId/leaderboard?mode=total|unit&unitId=&limit=50
router.get('/subjects/:subjectId/leaderboard', authenticate, async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const { mode = 'total', unitId, limit = 50 } = req.query;
    const take = parseInt(limit);

    let rows;

    if (mode === 'unit' && unitId) {
      const unit = await prisma.unit.findFirst({
        where: { OR: [{ unitKey: unitId }, { id: unitId }] },
        select: { id: true },
      });
      if (!unit) return res.status(404).json({ error: 'Unit not found' });

      rows = await prisma.$queryRaw`
        WITH ranked AS (
          SELECT
            uus.user_id,
            uus.points        AS score,
            uus.quizzes_taken,
            0                 AS streak_days,
            NULL::text        AS badge,
            u.name,
            u.avatar,
            ROW_NUMBER() OVER (ORDER BY uus.points DESC) AS rank
          FROM user_unit_stats uus
          JOIN users u ON u.id = uus.user_id
          WHERE uus.unit_id = ${unit.id}::uuid
          LIMIT ${take}
        )
        SELECT *, (user_id::text = ${req.userId}) AS is_current_user FROM ranked
      `;
    } else {
      rows = await prisma.$queryRaw`
        WITH ranked AS (
          SELECT
            uss.user_id,
            uss.total_points  AS score,
            uss.quizzes_taken,
            uss.streak_days,
            uss.badge,
            u.name,
            u.avatar,
            ROW_NUMBER() OVER (ORDER BY uss.total_points DESC) AS rank
          FROM user_subject_stats uss
          JOIN users u ON u.id = uss.user_id
          WHERE uss.subject_id = ${subjectId}
          LIMIT ${take}
        )
        SELECT *, (user_id::text = ${req.userId}) AS is_current_user FROM ranked
      `;
    }

    res.json(rows.map(r => ({
      rank: Number(r.rank),
      name: r.name,
      avatar: r.avatar,
      badge: r.badge,
      score: Number(r.score),
      quizzesTaken: Number(r.quizzes_taken),
      streak: Number(r.streak_days),
      isCurrentUser: r.is_current_user,
    })));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
