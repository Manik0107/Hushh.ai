const router = require('express').Router();
const prisma = require('../lib/prisma');
const authenticate = require('../middleware/auth');

function getBadge(totalPoints) {
  if (totalPoints >= 2000) return 'Platinum Scholar';
  if (totalPoints >= 1500) return 'Gold Scholar';
  if (totalPoints >= 500)  return 'Silver Scholar';
  if (totalPoints >= 100)  return 'Bronze Learner';
  return null;
}

// GET /api/v1/subjects/:subjectId/quizzes?difficulty=All|Easy|Medium|Hard&q=
router.get('/subjects/:subjectId/quizzes', authenticate, async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const { difficulty, q } = req.query;

    const quizzes = await prisma.quiz.findMany({
      where: {
        subjectId,
        isPublished: true,
        ...(difficulty && difficulty !== 'All' && { difficulty }),
        ...(q && { name: { contains: q, mode: 'insensitive' } }),
      },
      include: {
        _count: { select: { questions: true } },
        unit: { select: { unitKey: true } },
        attempts: {
          where: { userId: req.userId, submittedAt: { not: null } },
          orderBy: { submittedAt: 'desc' },
          take: 1,
          select: { scorePercent: true, correctAnswers: true, totalQuestions: true, submittedAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(quizzes.map(qz => {
      const last = qz.attempts[0];
      return {
        id: qz.id,
        unitId: qz.unit.unitKey || qz.unitId,
        unitName: qz.unitLabel,
        name: qz.name,
        questionCount: qz._count.questions,
        timeLimit: qz.timeLimitMin,
        difficulty: qz.difficulty,
        lastAttempt: last ? {
          scorePercent: last.scorePercent,
          correctAnswers: last.correctAnswers,
          totalQuestions: last.totalQuestions,
          completedAt: new Date(last.submittedAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          }),
        } : null,
      };
    }));
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/quizzes/attempts/:attemptId/submit  — must be BEFORE /:quizId route
router.post('/quizzes/attempts/:attemptId/submit', authenticate, async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { answers = [], timeLeftSeconds = 0 } = req.body;

    const attempt = await prisma.quizAttempt.findFirst({
      where: { id: attemptId, userId: req.userId },
      include: { quiz: { select: { subjectId: true, unitId: true } } },
    });
    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
    if (attempt.submittedAt) return res.status(400).json({ error: 'Attempt already submitted' });

    const questions = await prisma.quizQuestion.findMany({
      where: { quizId: attempt.quizId },
      select: { id: true, correctOptionIndex: true },
    });
    const correctMap = Object.fromEntries(questions.map(q => [q.id, q.correctOptionIndex]));

    let correctCount = 0;
    const answerData = answers.map(ans => {
      const isCorrect = correctMap[ans.questionId] === ans.selectedOptionIndex;
      if (isCorrect) correctCount++;
      return {
        attemptId,
        questionId: ans.questionId,
        selectedOptionIndex: ans.selectedOptionIndex,
        isCorrect,
      };
    });

    const total = questions.length;
    const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const submittedAt = new Date();
    const { subjectId, unitId } = attempt.quiz;

    await prisma.$transaction(async (tx) => {
      await tx.quizAttempt.update({
        where: { id: attemptId },
        data: { submittedAt, scorePercent, correctAnswers: correctCount, totalQuestions: total, timeLeftSeconds },
      });

      if (answerData.length > 0) {
        await tx.quizAttemptAnswer.createMany({ data: answerData, skipDuplicates: true });
      }

      // Upsert subject-level stats
      await tx.userSubjectStats.upsert({
        where: { userId_subjectId: { userId: req.userId, subjectId } },
        create: { userId: req.userId, subjectId, totalPoints: scorePercent, quizzesTaken: 1 },
        update: { totalPoints: { increment: scorePercent }, quizzesTaken: { increment: 1 } },
      });

      // Upsert unit-level stats
      await tx.userUnitStats.upsert({
        where: { userId_unitId: { userId: req.userId, unitId } },
        create: { userId: req.userId, unitId, points: scorePercent, quizzesTaken: 1 },
        update: { points: { increment: scorePercent }, quizzesTaken: { increment: 1 } },
      });
    });

    // Update badge after transaction
    const stats = await prisma.userSubjectStats.findUnique({
      where: { userId_subjectId: { userId: req.userId, subjectId } },
      select: { totalPoints: true },
    });
    await prisma.userSubjectStats.update({
      where: { userId_subjectId: { userId: req.userId, subjectId } },
      data: { badge: getBadge(stats?.totalPoints ?? 0) },
    });

    res.json({ scorePercent, correctAnswers: correctCount, totalQuestions: total, completedAt: submittedAt.toISOString() });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/quizzes/:quizId/attempts/start
router.post('/quizzes/:quizId/attempts/start', authenticate, async (req, res, next) => {
  try {
    const { quizId } = req.params;

    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId, isPublished: true },
      select: { id: true, name: true, timeLimitMin: true },
    });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const [attempt, questions] = await Promise.all([
      prisma.quizAttempt.create({
        data: { quizId, userId: req.userId },
        select: { id: true },
      }),
      prisma.quizQuestion.findMany({
        where: { quizId },
        select: { id: true, questionText: true, options: true },
        orderBy: { sortOrder: 'asc' },
      }),
    ]);

    res.status(201).json({
      attemptId: attempt.id,
      quiz: { id: quiz.id, name: quiz.name, timeLimitMin: quiz.timeLimitMin },
      questions: questions.map(q => ({
        id: q.id,
        questionText: q.questionText,
        options: q.options,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/users/me/quiz-attempts?subjectId=&quizId=
router.get('/users/me/quiz-attempts', authenticate, async (req, res, next) => {
  try {
    const { subjectId, quizId } = req.query;

    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId: req.userId,
        submittedAt: { not: null },
        ...(quizId && { quizId }),
        ...(subjectId && { quiz: { subjectId } }),
      },
      select: {
        id: true, quizId: true, scorePercent: true,
        correctAnswers: true, totalQuestions: true,
        submittedAt: true, timeLeftSeconds: true,
      },
      orderBy: { submittedAt: 'desc' },
    });

    res.json(attempts);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
