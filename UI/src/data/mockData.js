


const SEMESTERS_MAP_INTERNAL = {
  1: [
    { id: 'stat101', name: 'Statistics', code: 'ST101' },
  ],
};

export const SEMESTERS_MAP = SEMESTERS_MAP_INTERNAL;

export const SEMESTERS = Object.entries(SEMESTERS_MAP).map(([semester, subjects]) => ({
  semester: Number(semester),
  label: `Semester ${semester}`,
  subjects,
}));

export const SEMESTER_OPTIONS = SEMESTERS.map((entry) => entry.semester);

export const UNITS_BY_SUBJECT = {};
export const MATERIALS_BY_SUBJECT = {};
export const THREADS_BY_SUBJECT = {};
export const QUIZZES_BY_SUBJECT = {};

export const LEADERBOARD_BY_SUBJECT = {
  stat101: {
    total: [],
    byUnit: {},
  }
};

export const CURRENT_USER = {
  name: 'You',
  avatar: 'YO',
  role: 'Student',
  streak: 3,
};

export const AI_QUICK_PROMPTS = [
  'Summarize this unit in 5 bullet points',
  'Give me a 30-minute revision plan',
  'Generate 5 likely exam questions',
  'Explain this topic with a simple analogy',
];

export const AI_RESPONSES = {
  general: [],
  units: {},
  bySubject: {},
  quizTips: [],
};

export const HOME_HIGHLIGHTS = [];
