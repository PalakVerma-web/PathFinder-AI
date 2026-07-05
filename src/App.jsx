import React, { useState, useEffect } from 'react';
import LandingView from './components/LandingView';
import FormView from './components/FormView';
import LoadingView from './components/LoadingView';
import ResultsView from './components/ResultsView';
import DetailView from './components/DetailView';
import { Compass, GraduationCap, Sparkles } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [formData, setFormData] = useState({
    skills: [],
    experienceLevel: 'Intermediate',
    preferences: {
      workStyle: 'mixed',
      environment: 'either',
      location: 'either'
    },
    additionalContext: ''
  });
  
  const [results, setResults] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [comparePaths, setComparePaths] = useState([]);
  const [isComparing, setIsComparing] = useState(false);

  // Restore session from localStorage if available
  useEffect(() => {
    const savedResults = localStorage.getItem('pathfinder_results');
    const savedFormData = localStorage.getItem('pathfinder_form_data');
    if (savedResults && savedFormData) {
      try {
        setResults(JSON.parse(savedResults));
        setFormData(JSON.parse(savedFormData));
      } catch (e) {
        console.error('Failed to load cached session', e);
      }
    }
  }, []);

  const handleStartAnalysis = () => {
    setCurrentView('form');
  };

  const handleFormSubmit = async (data) => {
    setFormData(data);
    localStorage.setItem('pathfinder_form_data', JSON.stringify(data));
    setCurrentView('loading');
    
    try {
      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Analysis failed');
      const resultData = await response.json();
      
      setResults(resultData);
      localStorage.setItem('pathfinder_results', JSON.stringify(resultData));
      
      // Simulate delay for smooth animation transition
      setTimeout(() => {
        setCurrentView('results');
      }, 3000);
    } catch (error) {
      console.error('Error conducting career analysis:', error);
      // Fallback is handled by the backend server, but in case the backend server itself is completely down
      // we'll load static mock data client-side for safety
      try {
        console.log('[Frontend] Backend request failed. Loading client-side fallback.');
        const fallbackRes = await fetch('/data/sample3.json');
        const fallbackData = await fallbackRes.json();
        setResults(fallbackData);
        setTimeout(() => {
          setCurrentView('results');
        }, 3000);
      } catch (e) {
        alert('Could not connect to the analysis server. Please run npm start on the server.');
        setCurrentView('form');
      }
    }
  };

  const handleSelectDemoProfile = async (profileNumber) => {
    setCurrentView('loading');
    try {
      // Simulate loading for the demo feel
      const sampleFile = `/data/sample${profileNumber}.json`;
      const response = await fetch(sampleFile);
      if (!response.ok) throw new Error('Failed to load demo profile');
      const data = await response.json();
      
      // Pre-fill form data for the demo view
      let mockForm = {
        skills: ["React", "CSS", "Design"],
        experienceLevel: "Intermediate",
        preferences: { workStyle: "mixed", environment: "either", location: "remote" },
        additionalContext: "Demo Profile: Design & Web focus"
      };
      if (profileNumber === 1) {
        mockForm = {
          skills: ["Python", "SQL", "Excel", "Data Analysis"],
          experienceLevel: "Intermediate",
          preferences: { workStyle: "building", environment: "corporate", location: "either" },
          additionalContext: "Demo Profile: Data & AI focus"
        };
      } else if (profileNumber === 3) {
        mockForm = {
          skills: ["Public Speaking", "Writing", "Excel", "Project Management"],
          experienceLevel: "Advanced",
          preferences: { workStyle: "people-facing", environment: "startup", location: "office" },
          additionalContext: "Demo Profile: Business & Product focus"
        };
      }
      
      setFormData(mockForm);
      localStorage.setItem('pathfinder_form_data', JSON.stringify(mockForm));
      setResults(data);
      localStorage.setItem('pathfinder_results', JSON.stringify(data));
      
      setTimeout(() => {
        setCurrentView('results');
      }, 3000);
    } catch (err) {
      console.error('Demo load error:', err);
      setCurrentView('landing');
    }
  };

  const handleReset = () => {
    localStorage.removeItem('pathfinder_results');
    localStorage.removeItem('pathfinder_form_data');
    setResults(null);
    setSelectedPath(null);
    setComparePaths([]);
    setIsComparing(false);
    setCurrentView('landing');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Dynamic Ambient Orbs for visual polish */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square rounded-full bg-primaryViolet/5 blur-[120px] animate-orb-1 pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-primaryIndigo/5 blur-[120px] animate-orb-2 pointer-events-none -z-10"></div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0F1115]/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 cursor-pointer select-none" onClick={handleReset}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primaryViolet to-primaryIndigo text-white shadow-lg shadow-primaryViolet/20">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-white">PathFinder</span>
              <span className="ml-1 text-xs font-semibold px-1.5 py-0.5 rounded bg-white/[0.08] text-primaryViolet">AI</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {results && currentView !== 'landing' && (
              <button 
                onClick={() => {
                  setCurrentView('results');
                  setSelectedPath(null);
                  setIsComparing(false);
                }}
                className="text-sm font-medium text-secondaryGray hover:text-white transition-colors"
              >
                Dashboard
              </button>
            )}
            {currentView !== 'landing' && (
              <button 
                onClick={handleReset}
                className="text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05] transition-all"
              >
                New Assessment
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col justify-center">
        {currentView === 'landing' && (
          <LandingView 
            onStart={handleStartAnalysis} 
            onSelectDemo={handleSelectDemoProfile}
          />
        )}
        {currentView === 'form' && (
          <FormView 
            onSubmit={handleFormSubmit}
            onBack={() => setCurrentView('landing')}
          />
        )}
        {currentView === 'loading' && (
          <LoadingView />
        )}
        {currentView === 'results' && (
          <ResultsView 
            results={results} 
            formData={formData}
            onSelectPath={(path) => {
              setSelectedPath(path);
              setCurrentView('detail');
            }}
            comparePaths={comparePaths}
            setComparePaths={setComparePaths}
            isComparing={isComparing}
            setIsComparing={setIsComparing}
          />
        )}
        {currentView === 'detail' && (
          <DetailView 
            path={selectedPath} 
            formData={formData}
            onBack={() => {
              setSelectedPath(null);
              setCurrentView('results');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#0F1115]/50 py-6 text-center text-xs text-secondaryGray">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-1.5">
            <GraduationCap className="h-4 w-4 text-primaryViolet" />
            <span>Empowering students and switchers to navigate careers with clarity.</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>Powered by Gemini 2.0 Flash</span>
            <Sparkles className="h-3 w-3 text-accentAmber animate-pulse" />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
