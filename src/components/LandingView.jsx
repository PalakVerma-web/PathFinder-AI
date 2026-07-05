import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Terminal, Palette, Briefcase, BookOpen, Compass, ArrowRight } from 'lucide-react';

function LandingView({ onStart, onSelectDemo }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const steps = [
    {
      icon: <Terminal className="h-5 w-5 text-primaryViolet" />,
      title: "Input Your Skills",
      desc: "Select your existing tech skills, experience levels, and working preferences."
    },
    {
      icon: <Compass className="h-5 w-5 text-primaryIndigo" />,
      title: "AI Analysis",
      desc: "Gemini maps your profile to optimal careers, calculating matching scores and skill gaps."
    },
    {
      icon: <BookOpen className="h-5 w-5 text-accentAmber" />,
      title: "Get Your Roadmap",
      desc: "Receive structured, 3-6 month action items, project prompts, and salary insights."
    }
  ];

  const demoProfiles = [
    {
      id: 1,
      title: "Data & AI Profile",
      icon: <Terminal className="h-4 w-4 text-emerald-400" />,
      skills: ["Python", "SQL", "Excel", "Data Analysis"],
      bg: "hover:border-emerald-500/30 hover:bg-emerald-500/[0.02]"
    },
    {
      id: 2,
      title: "Frontend & Design Profile",
      icon: <Palette className="h-4 w-4 text-primaryViolet" />,
      skills: ["HTML", "CSS", "JavaScript", "Design", "Figma"],
      bg: "hover:border-violet-500/30 hover:bg-violet-500/[0.02]"
    },
    {
      id: 3,
      title: "Product & Business Profile",
      icon: <Briefcase className="h-4 w-4 text-accentAmber" />,
      skills: ["Public Speaking", "Writing", "Excel", "Project Management"],
      bg: "hover:border-amber-500/30 hover:bg-amber-500/[0.02]"
    }
  ];

  return (
    <motion.div 
      className="max-w-4xl mx-auto text-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Badge */}
      <motion.div 
        variants={itemVariants}
        className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs font-medium text-secondaryGray mb-6"
      >
        <Sparkles className="h-3.5 w-3.5 text-accentAmber animate-pulse" />
        <span className="text-white">Gemini 2.0 Flash Powered Career Guidance</span>
      </motion.div>

      {/* Hero Headline */}
      <motion.h1 
        variants={itemVariants}
        className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6 leading-tight"
      >
        Find the tech career that fits <span className="bg-gradient-to-r from-primaryViolet to-primaryIndigo bg-clip-text text-transparent">YOU</span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p 
        variants={itemVariants}
        className="text-lg sm:text-xl text-secondaryGray max-w-2xl mx-auto mb-10 leading-relaxed"
      >
        Translate your scattered skills and interests into a specific job title, growth forecast, and a concrete month-by-month roadmap to get hired.
      </motion.p>

      {/* Call to Action Buttons */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
      >
        <button
          onClick={onStart}
          className="group w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primaryViolet to-primaryIndigo text-white font-semibold shadow-lg shadow-primaryViolet/25 hover:shadow-primaryViolet/35 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Discover My Path</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      {/* How It Works Header */}
      <motion.h2 
        variants={itemVariants}
        className="font-display text-sm font-semibold tracking-wider text-secondaryGray uppercase mb-8"
      >
        How it works
      </motion.h2>

      {/* 3-Step Cards */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
      >
        {steps.map((step, index) => (
          <div 
            key={index}
            className="glass-card rounded-2xl p-6 text-left flex flex-col justify-between h-48 border border-white/[0.05]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] mb-4 border border-white/5">
              {step.icon}
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-secondaryGray leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Try Demo Section */}
      <motion.div 
        variants={itemVariants}
        className="border-t border-white/[0.06] pt-12"
      >
        <h3 className="font-display text-base font-semibold text-white mb-3">
          Short on time? Try a pre-built demo profile
        </h3>
        <p className="text-sm text-secondaryGray mb-6">
          Instantly view matching results, roadmaps, and chat without filling out forms or entering API keys.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {demoProfiles.map((demo) => (
            <button
              key={demo.id}
              onClick={() => onSelectDemo(demo.id)}
              className={`glass-card flex flex-col items-start p-5 rounded-2xl border text-left transition-all ${demo.bg}`}
            >
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-1.5 rounded-lg bg-white/[0.04]">
                  {demo.icon}
                </div>
                <span className="text-sm font-semibold text-white">{demo.title}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {demo.skills.map((skill, idx) => (
                  <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-secondaryGray">
                    {skill}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default LandingView;
