import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Plus, X, Check } from 'lucide-react';

const COMMON_SKILLS = [
  "Python", "JavaScript", "React", "SQL", "HTML", "CSS", 
  "Figma", "Node.js", "Java", "C++", "Git", "Tableau", 
  "Excel", "Public Speaking", "Writing", "Project Management"
];

function FormView({ onSubmit, onBack }) {
  const [step, setStep] = useState(1);
  const [skills, setSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');
  const [preferences, setPreferences] = useState({
    workStyle: 'mixed',
    environment: 'either',
    location: 'either'
  });
  const [additionalContext, setAdditionalContext] = useState('');

  const handleToggleSkill = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    const cleanSkill = customSkill.trim();
    if (cleanSkill && !skills.includes(cleanSkill)) {
      setSkills([...skills, cleanSkill]);
      setCustomSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onSubmit({
        skills,
        experienceLevel,
        preferences,
        additionalContext
      });
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  const isNextDisabled = step === 1 && skills.length === 0;

  // Form slide animations
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 150 : -150,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
    },
    exit: (direction) => ({
      x: direction < 0 ? 150 : -150,
      opacity: 0,
      transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
    })
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Header with back navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handlePrev}
          className="inline-flex items-center space-x-2 text-sm text-secondaryGray hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{step === 1 ? "Cancel" : "Back"}</span>
        </button>
        
        {/* Step Indicator */}
        <div className="flex items-center space-x-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step 
                  ? "w-8 bg-gradient-to-r from-primaryViolet to-primaryIndigo" 
                  : s < step 
                    ? "w-2 bg-primaryViolet/50" 
                    : "w-2 bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.06] shadow-xl relative overflow-hidden">
        {/* Glow effect inside form */}
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-primaryViolet/10 blur-xl pointer-events-none"></div>

        {/* Step 1: Skills & Experience */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h2 className="font-display text-2xl font-bold text-white mb-2">What skills do you have?</h2>
            <p className="text-sm text-secondaryGray mb-6">Select from common tech competencies or add your own. Add at least 1 skill.</p>

            {/* Selected Skills Chips */}
            {skills.length > 0 && (
              <div className="mb-6">
                <span className="text-xs font-semibold text-secondaryGray uppercase tracking-wider block mb-2">Selected Skills</span>
                <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-white/[0.02] border border-white/5 max-h-32 overflow-y-auto custom-scrollbar">
                  {skills.map((skill) => (
                    <span 
                      key={skill}
                      className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-primaryViolet/20 border border-primaryViolet/30 text-xs font-semibold text-white cursor-pointer hover:bg-red-500/20 hover:border-red-500/30 transition-colors group"
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      <span>{skill}</span>
                      <X className="h-3 w-3 text-primaryViolet group-hover:text-red-400" />
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Common Skills Selectors */}
            <div className="mb-6">
              <span className="text-xs font-semibold text-secondaryGray uppercase tracking-wider block mb-2.5">Suggested Skills</span>
              <div className="flex flex-wrap gap-2">
                {COMMON_SKILLS.map((skill) => {
                  const isSelected = skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => handleToggleSkill(skill)}
                      className={`text-xs font-medium px-3.5 py-2 rounded-xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] flex items-center space-x-1.5 ${
                        isSelected 
                          ? "bg-gradient-to-tr from-primaryViolet to-primaryIndigo text-white font-semibold" 
                          : "bg-white/[0.03] hover:bg-white/[0.06] text-secondaryGray hover:text-white border border-white/[0.04]"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Skill Input */}
            <form onSubmit={handleAddCustomSkill} className="flex gap-2 mb-8">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="Type custom skill (e.g. Docker, Rust, Statistics)..."
                className="flex-grow glass-input text-white text-sm rounded-xl px-4 py-3 placeholder:text-secondaryGray/60"
              />
              <button
                type="submit"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 text-white hover:bg-white/[0.08] transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </form>

            {/* Experience Level Slider */}
            <div>
              <span className="text-xs font-semibold text-secondaryGray uppercase tracking-wider block mb-3">Overall Experience Level</span>
              <div className="grid grid-cols-3 gap-2">
                {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setExperienceLevel(level)}
                    className={`py-3 rounded-xl text-xs font-semibold border transition-all ${
                      experienceLevel === level 
                        ? "bg-gradient-to-tr from-primaryViolet to-primaryIndigo border-transparent text-white shadow-lg shadow-primaryViolet/10" 
                        : "bg-white/[0.02] border-white/5 text-secondaryGray hover:bg-white/[0.04]"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-secondaryGray mt-2 px-1">
                {experienceLevel === 'Beginner' && "🧑‍🎓 Freshers, self-taught beginners, or career switchers with under 1 year of hands-on work."}
                {experienceLevel === 'Intermediate' && "🧑‍💻 Mid-level experience (1-3 years), comfortable building stand-alone features."}
                {experienceLevel === 'Advanced' && "🚀 Senior level (4+ years), experienced with systems design, architecture, and team lead."}
              </p>
            </div>
          </motion.div>
        )}

        {/* Step 2: Preferences */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div>
              <h2 className="font-display text-2xl font-bold text-white mb-2">Work Style & Setup</h2>
              <p className="text-sm text-secondaryGray mb-6">Tell us about your preferences so we can score and rank career matches accordingly.</p>
            </div>

            {/* Work Style (Building vs Talking) */}
            <div>
              <span className="text-xs font-semibold text-secondaryGray uppercase tracking-wider block mb-2.5">Work Style Focus</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'building', label: 'Building systems', desc: 'Focus on coding, design, & creation' },
                  { id: 'people-facing', label: 'People-facing', desc: 'Focus on alignment, sales, & management' },
                  { id: 'mixed', label: 'Balanced mix', desc: 'Collaborating while creating' }
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setPreferences({ ...preferences, workStyle: style.id })}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all h-24 ${
                      preferences.workStyle === style.id
                        ? "bg-primaryViolet/10 border-primaryViolet text-white"
                        : "bg-white/[0.02] border-white/5 text-secondaryGray hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="text-xs font-semibold text-white block">{style.label}</span>
                    <span className="text-[10px] text-secondaryGray leading-snug">{style.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Environment (Startup vs Corp) */}
            <div>
              <span className="text-xs font-semibold text-secondaryGray uppercase tracking-wider block mb-2.5">Environment Style</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'startup', label: 'Startup', desc: 'Fast, high-ownership' },
                  { id: 'corporate', label: 'Corporate', desc: 'Structured, stable' },
                  { id: 'either', label: 'Either', desc: 'No strong preference' }
                ].map((env) => (
                  <button
                    key={env.id}
                    onClick={() => setPreferences({ ...preferences, environment: env.id })}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all h-20 ${
                      preferences.environment === env.id
                        ? "bg-primaryViolet/10 border-primaryViolet text-white"
                        : "bg-white/[0.02] border-white/5 text-secondaryGray hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="text-xs font-semibold text-white block">{env.label}</span>
                    <span className="text-[9px] text-secondaryGray leading-normal">{env.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location (Remote vs Office) */}
            <div>
              <span className="text-xs font-semibold text-secondaryGray uppercase tracking-wider block mb-2.5">Work Setup Location</span>
              <div className="grid grid-cols-3 gap-2">
                {['remote', 'office', 'either'].map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setPreferences({ ...preferences, location: loc })}
                    className={`py-3 rounded-xl text-xs font-semibold border transition-all capitalize ${
                      preferences.location === loc
                        ? "bg-gradient-to-tr from-primaryViolet to-primaryIndigo border-transparent text-white"
                        : "bg-white/[0.02] border-white/5 text-secondaryGray hover:bg-white/[0.04]"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Additional Context */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h2 className="font-display text-2xl font-bold text-white mb-2">Anything else about you?</h2>
            <p className="text-sm text-secondaryGray mb-6">Optionally add details about your degree, hobbies, specific target companies, or limitations.</p>

            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              rows="6"
              placeholder="Example: I am a 3rd year CS student in India. I prefer roles with minimal client communication, and I want to land an internship within 6 months. I'm also open to learning web design."
              className="w-full glass-input text-white text-sm rounded-2xl p-4 placeholder:text-secondaryGray/50 resize-none mb-8 custom-scrollbar"
            />

            <div className="flex items-center space-x-2 text-xs text-secondaryGray bg-white/[0.01] p-3 rounded-xl border border-white/5">
              <Sparkles className="h-4 w-4 text-accentAmber animate-pulse" />
              <span>We'll feed this context directly to Gemini to construct highly personalized matches and roadmap tasks!</span>
            </div>
          </motion.div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between border-t border-white/[0.06] mt-8 pt-6">
          <button
            onClick={handlePrev}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-white/5 hover:border-white/10 hover:bg-white/[0.02] text-secondaryGray hover:text-white transition-all"
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>
          
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all ${
              isNextDisabled 
                ? "bg-white/5 text-secondaryGray/45 cursor-not-allowed border border-white/5 shadow-none" 
                : "bg-gradient-to-r from-primaryViolet to-primaryIndigo hover:shadow-primaryViolet/20 hover:scale-[1.01] active:scale-[0.99]"
            }`}
          >
            <span>{step === 3 ? "Analyze My Career Path" : "Continue"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FormView;
