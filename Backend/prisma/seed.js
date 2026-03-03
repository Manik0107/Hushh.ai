require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...\n');

  // ── Semesters ──────────────────────────────────────────────────────────────
  console.log('Seeding semesters...');
  await prisma.semester.createMany({
    data: Array.from({ length: 8 }, (_, i) => ({ id: i + 1, label: `Semester ${i + 1}` })),
    skipDuplicates: true,
  });

  // ── Subjects ───────────────────────────────────────────────────────────────
  console.log('Seeding subjects...');
  await prisma.subject.createMany({
    data: [
      { id: 'cs101', semesterId: 1, code: 'MA101', name: 'Engineering Mathematics I' },
      { id: 'cs102', semesterId: 1, code: 'PH101', name: 'Physics I' },
      { id: 'cs103', semesterId: 1, code: 'CS101', name: 'Programming Fundamentals' },
      { id: 'cs201', semesterId: 2, code: 'MA201', name: 'Engineering Mathematics II' },
      { id: 'cs202', semesterId: 2, code: 'CS201', name: 'Data Structures' },
    ],
    skipDuplicates: true,
  });

  // ── Users ──────────────────────────────────────────────────────────────────
  console.log('Seeding users...');
  const pass    = bcrypt.hashSync('student123', 10);
  const faculty = bcrypt.hashSync('faculty123', 10);
  const admin   = bcrypt.hashSync('admin123', 10);

  const userDefs = [
    { name: 'Admin',            avatar: 'AD', email: 'admin@study.com',  role: 'admin',   hash: admin,   semester: null },
    { name: 'Arjun Mehta',      avatar: 'AM', email: 'arjun@study.com',  role: 'student', hash: pass,    semester: 1 },
    { name: 'Sneha Patel',      avatar: 'SP', email: 'sneha@study.com',  role: 'student', hash: pass,    semester: 1 },
    { name: 'Rahul Sharma',     avatar: 'RS', email: 'rahul@study.com',  role: 'student', hash: pass,    semester: 1 },
    { name: 'Kavya Nair',       avatar: 'KN', email: 'kavya@study.com',  role: 'student', hash: pass,    semester: 1 },
    { name: 'Dr. Priya Sharma', avatar: 'PS', email: 'priya@study.com',  role: 'faculty', hash: faculty, semester: null },
  ];

  const ids = {};
  for (const u of userDefs) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      create: { name: u.name, avatar: u.avatar, email: u.email, passwordHash: u.hash, role: u.role, currentSemester: u.semester },
      update: { name: u.name },
    });
    ids[u.email] = user.id;
  }
  const { 'arjun@study.com': arjunId, 'sneha@study.com': snehaId, 'rahul@study.com': rahulId,
          'kavya@study.com': kavyaId, 'priya@study.com': priyaId } = ids;

  // ── Units for cs101 ────────────────────────────────────────────────────────
  console.log('Seeding units...');
  const unitDefs = [
    { subjectId: 'cs101', unitKey: 'u1', number: 1, name: 'Differential Calculus',   teacherName: 'Dr. Priya Sharma', sortOrder: 1 },
    { subjectId: 'cs101', unitKey: 'u2', number: 2, name: 'Integral Calculus',        teacherName: 'Dr. Priya Sharma', sortOrder: 2 },
    { subjectId: 'cs101', unitKey: 'u3', number: 3, name: 'Differential Equations',   teacherName: 'Dr. Rajesh Kumar', sortOrder: 3 },
    { subjectId: 'cs101', unitKey: 'u4', number: 4, name: 'Vector Calculus',           teacherName: 'Dr. Rajesh Kumar', sortOrder: 4 },
    { subjectId: 'cs101', unitKey: 'u5', number: 5, name: 'Laplace Transforms',        teacherName: 'Dr. Priya Sharma', sortOrder: 5 },
    { subjectId: 'cs102', unitKey: 'p1', number: 1, name: 'Mechanics',                 teacherName: 'Dr. Amit Verma',   sortOrder: 1 },
    { subjectId: 'cs102', unitKey: 'p2', number: 2, name: 'Thermodynamics',            teacherName: 'Dr. Amit Verma',   sortOrder: 2 },
    { subjectId: 'cs102', unitKey: 'p3', number: 3, name: 'Electromagnetism',          teacherName: 'Dr. Sunita Rao',   sortOrder: 3 },
  ];

  const unitIds = {};
  for (const u of unitDefs) {
    const existing = await prisma.unit.findFirst({ where: { subjectId: u.subjectId, unitKey: u.unitKey } });
    const unit = existing
      ? existing
      : await prisma.unit.create({ data: u });
    unitIds[u.unitKey] = unit.id;
  }

  // ── User unit progress ─────────────────────────────────────────────────────
  console.log('Seeding progress...');
  const progressData = [
    { userId: arjunId, unitKey: 'u1', pct: 100 }, { userId: arjunId, unitKey: 'u2', pct: 75 },
    { userId: arjunId, unitKey: 'u3', pct: 30 },
    { userId: snehaId, unitKey: 'u1', pct: 100 }, { userId: snehaId, unitKey: 'u2', pct: 100 },
    { userId: snehaId, unitKey: 'u3', pct: 80 },
    { userId: rahulId, unitKey: 'u1', pct: 60 },  { userId: rahulId, unitKey: 'u2', pct: 20 },
    { userId: kavyaId, unitKey: 'u1', pct: 88 },  { userId: kavyaId, unitKey: 'u2', pct: 45 },
  ];
  for (const p of progressData) {
    await prisma.userUnitProgress.upsert({
      where: { userId_unitId: { userId: p.userId, unitId: unitIds[p.unitKey] } },
      create: { userId: p.userId, unitId: unitIds[p.unitKey], progressPercent: p.pct },
      update: { progressPercent: p.pct },
    });
  }

  // ── Materials ──────────────────────────────────────────────────────────────
  console.log('Seeding materials...');
  const materialDefs = [
    { unitKey: 'u1', name: 'Limits and Continuity Notes.pdf',      type: 'pdf',  sizeBytes: BigInt(2516582) },
    { unitKey: 'u1', name: 'Practice Problems Set 1.pdf',           type: 'pdf',  sizeBytes: BigInt(1258291) },
    { unitKey: 'u1', name: 'Lecture Slides - Introduction.pdf',     type: 'pdf',  sizeBytes: BigInt(3984302) },
    { unitKey: 'u1', name: 'Derivative Rules Cheat Sheet.pdf',      type: 'pdf',  sizeBytes: BigInt(524288)  },
    { unitKey: 'u1', name: 'Calculus Reference Wiki',               type: 'link', externalUrl: 'https://en.wikipedia.org/wiki/Calculus' },
    { unitKey: 'u2', name: 'Integration Techniques.pdf',            type: 'pdf',  sizeBytes: BigInt(1887436) },
    { unitKey: 'u2', name: 'Definite Integrals Slides.pdf',         type: 'pdf',  sizeBytes: BigInt(2097152) },
    { unitKey: 'u2', name: 'Practice Problems Set 2.pdf',           type: 'pdf',  sizeBytes: BigInt(1048576) },
    { unitKey: 'u3', name: 'ODE Introduction.pdf',                  type: 'pdf',  sizeBytes: BigInt(1572864) },
    { unitKey: 'u3', name: 'First Order Equations Notes.pdf',       type: 'pdf',  sizeBytes: BigInt(2097152) },
  ];
  for (const m of materialDefs) {
    await prisma.material.create({
      data: {
        subjectId: 'cs101',
        unitId: unitIds[m.unitKey],
        name: m.name,
        type: m.type,
        sizeBytes: m.sizeBytes || null,
        externalUrl: m.externalUrl || null,
        teacherName: 'Dr. Priya Sharma',
        uploadedBy: priyaId,
      },
    });
  }

  // ── Tags ───────────────────────────────────────────────────────────────────
  console.log('Seeding tags...');
  const tagNames = ['Unit 1', 'Unit 2', 'Unit 3', 'Differentiation', 'Integration', 'Help', 'Exam Prep', 'Assignment', 'Doubt', 'Theory'];
  const tagIds = {};
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({ where: { name }, create: { name }, update: {} });
    tagIds[name] = tag.id;
  }

  // ── Threads ────────────────────────────────────────────────────────────────
  console.log('Seeding threads...');
  const threadDefs = [
    {
      unitKey: 'u1', authorId: arjunId,
      title: "How do I solve limits with L'Hôpital's rule?",
      description: "I get stuck when the limit results in 0/0 form. Can someone explain when and how to apply L'Hôpital's rule? Also, are there cases where it doesn't work?",
      upvotesCount: 28, downvotesCount: 2,
      tags: ['Unit 1', 'Differentiation', 'Help'],
    },
    {
      unitKey: 'u2', authorId: snehaId,
      title: 'Integration by parts vs substitution — how to choose?',
      description: 'I always struggle to decide which technique to use. Is there a quick rule of thumb to identify which method works better for a given integral?',
      upvotesCount: 15, downvotesCount: 0,
      tags: ['Unit 2', 'Integration'],
    },
    {
      unitKey: 'u1', authorId: rahulId,
      title: 'Exam pattern for Unit 1 — any insights?',
      description: "Has anyone seen last year's question paper? I want to know which topics are weighted more for the mid-term.",
      upvotesCount: 9, downvotesCount: 1,
      tags: ['Unit 1', 'Exam Prep'],
    },
    {
      unitKey: 'u3', authorId: kavyaId,
      title: 'Difference between particular and general solution in ODEs',
      description: 'Can someone clarify when we use particular vs general solution? The textbook explanation is not very clear to me.',
      upvotesCount: 12, downvotesCount: 0,
      tags: ['Unit 3', 'Theory', 'Doubt'],
    },
  ];

  const threadIds = {};
  for (const td of threadDefs) {
    const thread = await prisma.thread.create({
      data: {
        subjectId: 'cs101',
        unitId: unitIds[td.unitKey],
        title: td.title,
        description: td.description,
        authorId: td.authorId,
        upvotesCount: td.upvotesCount,
        downvotesCount: td.downvotesCount,
        threadTags: { create: td.tags.map(name => ({ tagId: tagIds[name] })) },
      },
    });
    threadIds[td.title] = thread.id;
  }

  // Add comments to first thread
  const firstThreadId = threadIds["How do I solve limits with L'Hôpital's rule?"];
  if (firstThreadId) {
    await prisma.threadComment.createMany({
      data: [
        { threadId: firstThreadId, authorId: snehaId, text: "L'Hôpital's rule applies when you get 0/0 or ∞/∞. Take the derivative of numerator and denominator separately, then re-evaluate the limit." },
        { threadId: firstThreadId, authorId: rahulId, text: "Be careful — it doesn't apply for 0×∞ directly. You need to rewrite it as 0/0 or ∞/∞ first." },
      ],
    });
    await prisma.thread.update({ where: { id: firstThreadId }, data: { commentsCount: 2 } });
  }

  // ── Quizzes ────────────────────────────────────────────────────────────────
  console.log('Seeding quizzes...');
  const quizDefs = [
    { unitKey: 'u1', unitLabel: 'Unit 1', name: 'Limits and Continuity Basics', difficulty: 'Easy',   timeLimitMin: 15 },
    { unitKey: 'u1', unitLabel: 'Unit 1', name: 'Differentiation Rules',        difficulty: 'Medium', timeLimitMin: 20 },
    { unitKey: 'u2', unitLabel: 'Unit 2', name: 'Integration Techniques',       difficulty: 'Hard',   timeLimitMin: 25 },
    { unitKey: 'u3', unitLabel: 'Unit 3', name: 'First Order ODEs',             difficulty: 'Medium', timeLimitMin: 20 },
  ];

  const quizIds = {};
  for (const qd of quizDefs) {
    const quiz = await prisma.quiz.create({
      data: {
        subjectId: 'cs101',
        unitId: unitIds[qd.unitKey],
        unitLabel: qd.unitLabel,
        name: qd.name,
        difficulty: qd.difficulty,
        timeLimitMin: qd.timeLimitMin,
        isPublished: true,
        createdBy: priyaId,
      },
    });
    quizIds[qd.name] = quiz.id;
  }

  // Questions for Quiz 1 — Limits and Continuity Basics
  await prisma.quizQuestion.createMany({
    data: [
      { quizId: quizIds['Limits and Continuity Basics'], sortOrder: 1,  questionText: "What is lim(x→0) sin(x)/x?",                                    options: JSON.stringify(['0', '1', '∞', 'undefined']),                                                           correctOptionIndex: 1 },
      { quizId: quizIds['Limits and Continuity Basics'], sortOrder: 2,  questionText: "Which function is continuous everywhere?",                        options: JSON.stringify(['f(x) = 1/x', 'f(x) = |x|', 'f(x) = tan(x)', 'f(x) = ln(x)']),                        correctOptionIndex: 1 },
      { quizId: quizIds['Limits and Continuity Basics'], sortOrder: 3,  questionText: "lim(x→∞) (1 + 1/x)^x equals?",                                   options: JSON.stringify(['1', '0', 'e', '∞']),                                                                  correctOptionIndex: 2 },
      { quizId: quizIds['Limits and Continuity Basics'], sortOrder: 4,  questionText: "A function f is continuous at x=a if?",                           options: JSON.stringify(['f(a) exists only', 'lim f(x) exists only', 'f(a) = lim f(x) as x→a', 'f is differentiable at a']), correctOptionIndex: 2 },
      { quizId: quizIds['Limits and Continuity Basics'], sortOrder: 5,  questionText: "What is lim(x→0) (e^x - 1)/x?",                                   options: JSON.stringify(['0', '1', 'e', 'undefined']),                                                           correctOptionIndex: 1 },
      { quizId: quizIds['Limits and Continuity Basics'], sortOrder: 6,  questionText: "lim(x→2) (x² - 4)/(x - 2) equals?",                              options: JSON.stringify(['0', '2', '4', 'undefined']),                                                           correctOptionIndex: 2 },
      { quizId: quizIds['Limits and Continuity Basics'], sortOrder: 7,  questionText: "Which has a removable discontinuity at x=1?",                     options: JSON.stringify(['f(x) = 1/(x-1)', 'f(x) = (x²-1)/(x-1)', 'f(x) = |x-1|', 'f(x) = sin(x-1)']),       correctOptionIndex: 1 },
      { quizId: quizIds['Limits and Continuity Basics'], sortOrder: 8,  questionText: "lim(x→0⁺) ln(x) equals?",                                         options: JSON.stringify(['0', '1', '-∞', '∞']),                                                                 correctOptionIndex: 2 },
      { quizId: quizIds['Limits and Continuity Basics'], sortOrder: 9,  questionText: "If lim f(x)=L and lim g(x)=M, then lim[f(x)·g(x)] equals?",       options: JSON.stringify(['L+M', 'L/M', 'L·M', 'L^M']),                                                         correctOptionIndex: 2 },
      { quizId: quizIds['Limits and Continuity Basics'], sortOrder: 10, questionText: "The Squeeze Theorem: if h≤f≤g and lim h=lim g=L, then lim f=?",   options: JSON.stringify(['0', 'L', 'undefined', 'L/2']),                                                         correctOptionIndex: 1 },
    ],
  });

  // Questions for Quiz 2 — Differentiation Rules
  await prisma.quizQuestion.createMany({
    data: [
      { quizId: quizIds['Differentiation Rules'], sortOrder: 1, questionText: "The derivative of sin(x) is?",                       options: JSON.stringify(['cos(x)', '-cos(x)', 'sin(x)', '-sin(x)']),    correctOptionIndex: 0 },
      { quizId: quizIds['Differentiation Rules'], sortOrder: 2, questionText: "Using the chain rule, d/dx[sin(x²)] equals?",         options: JSON.stringify(['cos(x²)', '2x·cos(x²)', 'sin(2x)', 'cos(2x)']), correctOptionIndex: 1 },
      { quizId: quizIds['Differentiation Rules'], sortOrder: 3, questionText: "The derivative of e^(3x) is?",                        options: JSON.stringify(['e^(3x)', '3e^(3x)', 'e^x', '3e^x']),          correctOptionIndex: 1 },
      { quizId: quizIds['Differentiation Rules'], sortOrder: 4, questionText: "What is d/dx[x^n]?",                                  options: JSON.stringify(['x^(n-1)', 'nx', 'n·x^(n-1)', '(n-1)·x^n']),   correctOptionIndex: 2 },
      { quizId: quizIds['Differentiation Rules'], sortOrder: 5, questionText: "Product rule: d/dx[u·v] equals?",                     options: JSON.stringify(["u'v - uv'", "u'v'", "u'v + uv'", "u/v'"]),     correctOptionIndex: 2 },
      { quizId: quizIds['Differentiation Rules'], sortOrder: 6, questionText: "Quotient rule: d/dx[u/v] equals?",                    options: JSON.stringify(["(u'v + uv')/v²", "(u'v - uv')/v²", "u'v'", "u'/v'"]), correctOptionIndex: 1 },
      { quizId: quizIds['Differentiation Rules'], sortOrder: 7, questionText: "The derivative of ln(x) is?",                         options: JSON.stringify(['ln(x)', '1/x', 'x', 'e^x']),                   correctOptionIndex: 1 },
      { quizId: quizIds['Differentiation Rules'], sortOrder: 8, questionText: "d/dx[cos(x)] equals?",                                options: JSON.stringify(['sin(x)', '-sin(x)', 'cos(x)', '-cos(x)']),     correctOptionIndex: 1 },
    ],
  });

  // ── Historical quiz attempts ───────────────────────────────────────────────
  console.log('Seeding quiz attempts...');
  const q1Id = quizIds['Limits and Continuity Basics'];
  await prisma.quizAttempt.createMany({
    data: [
      { quizId: q1Id, userId: snehaId, startedAt: new Date(Date.now() - 2*86400000), submittedAt: new Date(Date.now() - 2*86400000 + 720000), scorePercent: 90, correctAnswers: 9, totalQuestions: 10 },
      { quizId: q1Id, userId: arjunId, startedAt: new Date(Date.now() - 1*86400000), submittedAt: new Date(Date.now() - 1*86400000 + 780000), scorePercent: 80, correctAnswers: 8, totalQuestions: 10 },
      { quizId: q1Id, userId: rahulId, startedAt: new Date(Date.now() - 3*86400000), submittedAt: new Date(Date.now() - 3*86400000 + 840000), scorePercent: 60, correctAnswers: 6, totalQuestions: 10 },
    ],
  });

  // ── Leaderboard stats ──────────────────────────────────────────────────────
  console.log('Seeding leaderboard stats...');
  const subjectStats = [
    { userId: snehaId, totalPoints: 2840, quizzesTaken: 18, streakDays: 14, badge: 'Platinum Scholar' },
    { userId: arjunId, totalPoints: 2200, quizzesTaken: 15, streakDays: 10, badge: 'Platinum Scholar' },
    { userId: kavyaId, totalPoints: 1650, quizzesTaken: 12, streakDays:  7, badge: 'Gold Scholar'     },
    { userId: rahulId, totalPoints:  950, quizzesTaken:  8, streakDays:  5, badge: 'Silver Scholar'   },
  ];
  for (const s of subjectStats) {
    await prisma.userSubjectStats.upsert({
      where: { userId_subjectId: { userId: s.userId, subjectId: 'cs101' } },
      create: { userId: s.userId, subjectId: 'cs101', ...s },
      update: s,
    });
  }

  const unitStats = [
    { userId: snehaId, points: 920, quizzesTaken: 6 },
    { userId: arjunId, points: 780, quizzesTaken: 5 },
    { userId: kavyaId, points: 640, quizzesTaken: 4 },
    { userId: rahulId, points: 380, quizzesTaken: 3 },
  ];
  for (const s of unitStats) {
    await prisma.userUnitStats.upsert({
      where: { userId_unitId: { userId: s.userId, unitId: unitIds['u1'] } },
      create: { userId: s.userId, unitId: unitIds['u1'], ...s },
      update: s,
    });
  }

  console.log('\n✅ Seed complete.\n');
  console.log('Test credentials:');
  console.log('  Student  →  arjun@study.com / student123');
  console.log('  Student  →  sneha@study.com / student123');
  console.log('  Faculty  →  priya@study.com / faculty123');
  console.log('  Admin    →  admin@study.com  / admin123');
}

seed()
  .catch(err => { console.error('Seed failed:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
