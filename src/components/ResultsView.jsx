import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, TrendingUp, Coins, Check, MessageSquare, Send, X, ArrowRight, GitPullRequest, HelpCircle 
} from 'lucide-react';

// Sub-component to animate score counting up
function AnimatedScore({ score }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000; // 1s
    const stepTime = Math.abs(Math.floor(duration / score));
    
    const timer = setInterval(() => {
      start += 1;
      setDisplayScore(start);
      if (start >= score) {
        clearInterval(timer);
      }
    }, stepTime || 15);

    return () => clearInterval(timer);
  }, [score]);

  return (
    <span className="font-display text-3xl font-extrabold text-white">
      {displayScore}%
    </span>
  );
}

function ResultsView({ 
  results, 
  formData, 
  onSelectPath, 
  comparePaths, 
  setComparePaths, 
  isComparing, 
  setIsComparing 
}) {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'model', text: "Hello! I'm your AI career coach. Ask me anything about these recommended paths, salary outlooks, or how to customize your transition." }
  ]);
  const [isAsking, setIsAsking] = useState(false);

  const matches = results?.matches || [];

  const handleToggleCompare = (e, path) => {
    e.stopPropagation(); // Prevent opening detail view
    if (comparePaths.some(p => p.title === path.title)) {
      setComparePaths(comparePaths.filter(p => p.title !== path.title));
    } else {
      if (comparePaths.length >= 2) {
        // Replace the second one or show warning
        setComparePaths([comparePaths[0], path]);
      } else {
        setComparePaths([...comparePaths, path]);
      }
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isAsking) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userMessage }]);
    setIsAsking(true);

    try {
      // Use the top recommendation as context if nothing else is specified
      const contextPath = matches[0];
      const response = await fetch('http://localhost:3001/api/followup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: userMessage,
          chatHistory: chatHistory.slice(-5), // Send last 5 messages for context
          selectedPath: contextPath
        })
      });

      if (!response.ok) throw new Error('Chat failed');
      const data = await response.json();
      
      setChatHistory(prev => [...prev, { sender: 'model', text: data.answer }]);
    } catch (err) {
      console.error('Chat followup error:', err);
      setChatHistory(prev => [...prev, { sender: 'model', text: "I apologize, but I couldn't reach the coaching backend. Please ensure the server is active or try again." }]);
    } finally {
      setIsAsking(false);
    }
  };

  const formatCurrency = (val) => {
    if (!val) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="w-full relative pb-28">
      {/* Top Section */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="font-display text-3xl font-extrabold text-white mb-2">Your Career Matches</h1>
        <p className="text-sm text-secondaryGray">
          Based on your skills: <span className="text-white font-medium">{formData.skills.join(', ')}</span> at <span className="text-white font-medium">{formData.experienceLevel}</span> level.
        </p>
      </div>

      {/* Career Match Cards Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } }
        }}
      >
        {matches.map((path, index) => {
          const isTopFit = index === 0;
          const isSelectedForCompare = comparePaths.some(p => p.title === path.title);
          
          return (
            <motion.div
              key={path.title}
              onClick={() => onSelectPath(path)}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
              }}
              className={`relative flex flex-col justify-between rounded-3xl p-6 border cursor-pointer ${
                isTopFit 
                  ? "glass-card-selected md:scale-[1.02] md:-translate-y-1" 
                  : "glass-card"
              }`}
            >
              {isTopFit && (
                <div className="absolute top-[-12px] right-6 rounded-full bg-gradient-to-r from-accentAmber to-amber-600 px-3 py-0.5 text-[10px] font-extrabold text-darkBg uppercase tracking-widest flex items-center space-x-1 shadow-md">
                  <Sparkles className="h-3 w-3" />
                  <span>Best Match</span>
                </div>
              )}

              {/* Title & Match % */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white leading-tight">{path.title}</h3>
                    <div className="flex items-center space-x-1.5 mt-1 text-xs text-secondaryGray">
                      <HelpCircle className="h-3 w-3 text-primaryViolet" />
                      <span>AI Confidence: {path.confidenceScore || 80}%</span>
                    </div>
                  </div>
                  
                  {/* Score circle */}
                  <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-white/[0.04] border border-white/10 shrink-0">
                    <AnimatedScore score={path.matchPercent} />
                  </div>
                </div>

                {/* Match Reasoning */}
                <p className="text-xs text-secondaryGray leading-relaxed mb-6 line-clamp-3">
                  {path.reasoning}
                </p>
              </div>

              {/* Quick Details Footer on Card */}
              <div>
                <div className="border-t border-white/[0.06] pt-4 mb-5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-secondaryGray">
                    <span className="flex items-center gap-1.5"><Coins className="h-3.5 w-3.5 text-accentAmber" /> Est. Salary</span>
                    <span className="text-white font-medium">
                      {formatCurrency(path.salaryRange.min)} - {formatCurrency(path.salaryRange.max)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-secondaryGray">
                    <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> Outlook</span>
                    <span className={`font-semibold ${path.demandOutlook === 'High' ? 'text-emerald-400' : 'text-accentAmber'}`}>
                      {path.demandOutlook} Demand
                    </span>
                  </div>
                </div>

                {/* Compare Checkbox & Action */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={(e) => handleToggleCompare(e, path)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                      isSelectedForCompare 
                        ? "bg-primaryViolet/20 border-primaryViolet text-white" 
                        : "bg-white/[0.02] border-white/5 text-secondaryGray hover:text-white hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className={`h-3 w-3 rounded flex items-center justify-center border ${
                      isSelectedForCompare 
                        ? "border-primaryViolet bg-primaryViolet" 
                        : "border-white/20"
                    }`}>
                      {isSelectedForCompare && <Check className="h-2 w-2 text-white" />}
                    </div>
                    <span>Compare</span>
                  </button>

                  <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-primaryViolet hover:text-white transition-colors">
                    <span>Roadmap</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Floating comparison bar if paths are selected */}
      <AnimatePresence>
        {comparePaths.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4"
          >
            <div className="glass-panel p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-primaryViolet/30">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-primaryViolet/20 text-primaryViolet flex items-center justify-center">
                  <GitPullRequest className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Compare Paths</span>
                  <span className="text-[10px] text-secondaryGray">
                    {comparePaths.length === 1 
                      ? `Selected: ${comparePaths[0].title} (Select 1 more)` 
                      : `Selected: ${comparePaths[0].title} vs ${comparePaths[1].title}`}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setComparePaths([])}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-secondaryGray hover:text-white transition-colors"
                >
                  Clear
                </button>
                <button
                  disabled={comparePaths.length < 2}
                  onClick={() => setIsComparing(true)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    comparePaths.length < 2 
                      ? "bg-white/5 text-secondaryGray/40 cursor-not-allowed border border-white/5" 
                      : "bg-gradient-to-r from-primaryViolet to-primaryIndigo text-white shadow-md shadow-primaryViolet/20 hover:scale-[1.02]"
                  }`}
                >
                  Compare Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side-by-Side Comparison Overlay Modal */}
      <AnimatePresence>
        {isComparing && comparePaths.length === 2 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-darkBg/90 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel rounded-3xl w-full max-w-4xl p-6 sm:p-8 border border-white/10 shadow-2xl my-8 relative"
            >
              <button
                onClick={() => setIsComparing(false)}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-secondaryGray hover:text-white hover:bg-white/[0.08]"
              >
                <X className="h-4 w-4" />
              </button>

              <h2 className="font-display text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <GitPullRequest className="h-5 w-5 text-primaryViolet" />
                <span>Career Comparison</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
                {comparePaths.map((path, idx) => (
                  <div key={path.title} className={`${idx === 1 ? 'md:pl-6 pt-6 md:pt-0' : 'pb-6 md:pb-0'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-display text-xl font-extrabold text-white">{path.title}</h3>
                        <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          path.demandOutlook === 'High' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {path.demandOutlook} Outlook
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-display font-black text-primaryViolet">{path.matchPercent}%</span>
                        <span className="block text-[10px] text-secondaryGray">Match Score</span>
                      </div>
                    </div>

                    <div className="space-y-4 text-sm mt-6">
                      <div>
                        <span className="text-xs font-semibold text-secondaryGray uppercase tracking-wider block mb-1.5">Salary Range</span>
                        <span className="text-white font-medium">
                          {formatCurrency(path.salaryRange.min)} - {formatCurrency(path.salaryRange.max)} / year
                        </span>
                      </div>

                      <div>
                        <span className="text-xs font-semibold text-secondaryGray uppercase tracking-wider block mb-1.5">Why it fits</span>
                        <p className="text-xs text-secondaryGray leading-relaxed">{path.reasoning}</p>
                      </div>

                      <div>
                        <span className="text-xs font-semibold text-secondaryGray uppercase tracking-wider block mb-1.5">Skills Match</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {path.skillsYouHave.map(s => (
                            <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-semibold text-secondaryGray uppercase tracking-wider block mb-1.5">Skills to acquire</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {path.skillsToLearn.map(s => (
                            <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-accentAmber font-semibold border border-amber-500/20">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsComparing(false);
                        onSelectPath(path);
                      }}
                      className="w-full mt-8 py-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 text-white font-semibold text-xs transition-all hover:bg-white/[0.06] flex items-center justify-center gap-1.5"
                    >
                      <span>View Full Learning Roadmap</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating AI Chat Assist Drawer */}
      <div className={`fixed bottom-0 right-6 z-40 w-full max-w-sm px-4 md:px-0 transition-all duration-300 ${
        chatOpen ? 'translate-y-0' : 'translate-y-[calc(100%-48px)]'
      }`}>
        <div className="glass-panel rounded-t-2xl shadow-2xl border border-white/10 flex flex-col h-[400px]">
          {/* Header Toggle */}
          <div 
            onClick={() => setChatOpen(!chatOpen)}
            className="h-12 bg-white/[0.02] rounded-t-2xl px-4 flex items-center justify-between border-b border-white/[0.06] cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-primaryViolet" />
              <span className="text-xs font-semibold text-white">Ask Career Coach AI</span>
            </div>
            <button className="text-secondaryGray hover:text-white transition-colors">
              <X className={`h-4 w-4 transition-transform duration-200 ${chatOpen ? 'rotate-0' : 'rotate-180'}`} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {chatHistory.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-r from-primaryViolet to-primaryIndigo text-white rounded-tr-none' 
                    : 'bg-white/[0.04] border border-white/5 text-secondaryGray rounded-tl-none markdown-style'
                }`}>
                  {/* Clean linebreaks for markdown */}
                  {msg.text.split('\n').map((line, idx) => (
                    <p key={idx} className={idx > 0 ? 'mt-1' : ''}>
                      {line.startsWith('* ') ? '• ' + line.substring(2) : line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
            {isAsking && (
              <div className="flex justify-start">
                <div className="bg-white/[0.04] border border-white/5 rounded-2xl rounded-tl-none p-3 text-xs text-secondaryGray flex items-center space-x-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondaryGray animate-bounce"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-secondaryGray animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-secondaryGray animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Inputs */}
          <form onSubmit={handleSendChat} className="p-3 border-t border-white/[0.06] flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask: What if I don't want to code?"
              className="flex-grow glass-input rounded-xl px-3 py-2 text-xs placeholder:text-secondaryGray/50"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isAsking}
              className="h-8 w-8 rounded-xl bg-gradient-to-r from-primaryViolet to-primaryIndigo text-white flex items-center justify-center hover:scale-[1.05] active:scale-[0.95] transition-all disabled:opacity-40 disabled:scale-100"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResultsView;
