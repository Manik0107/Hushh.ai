import { useEffect, useMemo, useState } from 'react';
import AIAssistant from './components/ai/AIAssistant';
import DiscussionTab from './components/discussion/DiscussionTab';
import HomeTab from './components/home/HomeTab';
import Layout from './components/layout/Layout';
import LeaderboardTab from './components/leaderboard/LeaderboardTab';
import MaterialsTab from './components/materials/MaterialsTab';
import QuizTab from './components/quiz/QuizTab';
import { SEMESTER_OPTIONS, SEMESTERS_MAP, UNITS_BY_SUBJECT } from './data/mockData';
import { fetchMaterials } from './api';

function getFirstSubjectId(semester) {
  return SEMESTERS_MAP[semester]?.[0]?.id || null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedSemester, setSelectedSemester] = useState(SEMESTER_OPTIONS[0]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(getFirstSubjectId(SEMESTER_OPTIONS[0]));
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [realMaterials, setRealMaterials] = useState({});

  useEffect(() => {
    fetchMaterials()
      .then((data) => setRealMaterials(data.materials || {}))
      .catch((err) => console.error('Failed to fetch materials:', err));
  }, []);

  const subjects = useMemo(() => SEMESTERS_MAP[selectedSemester] || [], [selectedSemester]);

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.id === selectedSubjectId) || subjects[0] || null,
    [subjects, selectedSubjectId],
  );

  const units = selectedSubject ? UNITS_BY_SUBJECT[selectedSubject.id] || [] : [];
  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches) {
      setDesktopSidebarOpen((open) => !open);
      return;
    }

    setMobileSidebarOpen((open) => !open);
  };

  const renderActiveTab = () => {
    const subjectKey = selectedSubject?.id || 'none';
    const subjectRealMaterials = selectedSubject ? realMaterials[selectedSubject.name] : null;

    switch (activeTab) {
      case 'materials':
        return <MaterialsTab key={`materials-${subjectKey}`} selectedSubject={selectedSubject} realMaterials={subjectRealMaterials} />;
      case 'discussion':
        return <DiscussionTab key={`discussion-${subjectKey}`} selectedSubject={selectedSubject} />;
      case 'quiz':
        return <QuizTab key={`quiz-${subjectKey}`} selectedSubject={selectedSubject} realMaterials={subjectRealMaterials} />;
      case 'leaderboard':
        return <LeaderboardTab key={`leaderboard-${subjectKey}`} selectedSubject={selectedSubject} />;
      case 'home':
      default:
        return (
          <HomeTab
            key={`home-${subjectKey}`}
            selectedSubject={selectedSubject}
            selectedSemester={selectedSemester}
            onGoToMaterials={() => setActiveTab('materials')}
            realMaterials={subjectRealMaterials}
          />
        );
    }
  };

  return (
    <>
      <Layout
        navbarProps={{
          semesterOptions: SEMESTER_OPTIONS,
          selectedSemester,
          onSemesterChange: (semester) => {
            setSelectedSemester(semester);
            const firstSubjectId = getFirstSubjectId(semester);
            setSelectedSubjectId(firstSubjectId);
          },
          subjects,
          selectedSubjectId: selectedSubject?.id || '',
          onSubjectChange: setSelectedSubjectId,
          selectedSubject,
          onToggleSidebar: handleToggleSidebar,
          onToggleAssistant: () => setAssistantOpen((open) => !open),
          assistantOpen,
        }}
        sidebarProps={{
          activeTab,
          onTabChange: (tabId) => {
            setActiveTab(tabId);
            setMobileSidebarOpen(false);
          },
          isDesktopOpen: desktopSidebarOpen,
          isMobileOpen: mobileSidebarOpen,
          onCloseMobile: () => setMobileSidebarOpen(false),
        }}
      >
        {renderActiveTab()}
      </Layout>

      <AIAssistant
        key={selectedSubject?.id || 'ai-none'}
        open={assistantOpen}
        onOpenChange={setAssistantOpen}
        selectedSubject={selectedSubject}
        realMaterials={selectedSubject ? realMaterials[selectedSubject.name] : null}
        units={units}
      />
    </>
  );
}
