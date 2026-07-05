import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Download, CheckCircle2, Circle, TrendingUp, Coins, HelpCircle, 
  Sparkles, ShieldCheck, Bookmark, MessageSquare, Send 
} from 'lucide-react';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend 
} from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function DetailView({ path, formData, onBack }) {
  const [completedTasks, setCompletedTasks] = useState({});
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'model', text: `Let's discuss the **${path.title}** roadmap! Ask me anything about resources, specific timelines, or certs.` }
  ]);
  const [isAsking, setIsAsking] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Restore task progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(`roadmap_progress_${path.title}`);
    if (savedProgress) {
      try {
        setCompletedTasks(JSON.parse(savedProgress));
      } catch (e) {
        console.error('Failed to parse progress', e);
      }
    }
  }, [path.title]);

  const handleToggleTask = (monthIdx, taskIdx) => {
    const key = `${monthIdx}-${taskIdx}`;
    const updated = {
      ...completedTasks,
      [key]: !completedTasks[key]
    };
    setCompletedTasks(updated);
    localStorage.setItem(`roadmap_progress_${path.title}`, JSON.stringify(updated));
  };

  // Calculate overall task progress
  const totalTasks = path.roadmap.reduce((acc, month) => acc + month.tasks.length, 0);
  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Formulate data for Radar Chart
  // Mapping current user skills (score 5) and missing skills (score 1.5) vs requirement (score 5)
  const allSkills = [
    ...path.skillsYouHave.map(name => ({ name, user: 5, required: 5 })),
    ...path.skillsToLearn.map(name => ({ name, user: 1.5, required: 5 }))
  ].slice(0, 8); // Cap at 8 for visual cleanliness

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isAsking) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userMessage }]);
    setIsAsking(true);

    try {
      const response = await fetch('http://localhost:3001/api/followup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: userMessage,
          chatHistory: chatHistory.slice(-5),
          selectedPath: path
        })
      });

      if (!response.ok) throw new Error('Chat failed');
      const data = await response.json();
      
      setChatHistory(prev => [...prev, { sender: 'model', text: data.answer }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { sender: 'model', text: "I had trouble generating an AI reply. Check your connection or try again." }]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleDownloadPDF = () => {
    setExporting(true);
    const element = document.getElementById('capture-roadmap-container');
    
    // Add temporary styling classes for clean PDF generation
    element.classList.add('p-8', 'bg-darkBg');
    
    // Slight timeout to let DOM adjust if needed
    setTimeout(() => {
      html2canvas(element, {
        backgroundColor: '#0F1115',
        scale: 2,
        useCORS: true,
        logging: false
      }).then((canvas) => {
        element.classList.remove('p-8', 'bg-darkBg');
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 Width
        const pageHeight = 295; // A4 Height
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        pdf.save(`PathFinder_Roadmap_${path.title.replace(/\s+/g, '_')}.pdf`);
        setExporting(false);
      }).catch(err => {
        console.error('PDF export failed', err);
        setExporting(false);
      });
    }, 300);
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
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20 items-start">
      {/* Left 2 Columns: Main Content */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Navigation / Actions Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 text-sm text-secondaryGray hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={exporting}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-white transition-all active:scale-95"
          >
            <Download className="h-4 w-4 text-primaryViolet" />
            <span>{exporting ? "Generating PDF..." : "Export as PDF"}</span>
          </button>
        </div>

        {/* Printable/Exportable Content Area */}
        <div id="capture-roadmap-container" className="space-y-8">
          
          {/* Hero Header Panel */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.06] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primaryViolet/5 blur-2xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <span className="text-[10px] font-bold text-primaryViolet uppercase tracking-wider block mb-1">Career Path Detail</span>
                <h1 className="font-display text-3xl font-bold text-white">{path.title}</h1>
              </div>

              {/* Match Score Indicator */}
              <div className="flex items-center space-x-3 bg-white/[0.02] border border-white/5 rounded-2xl p-3 w-fit">
                <div className="text-right">
                  <span className="text-[10px] text-secondaryGray block uppercase font-bold tracking-wider">Matching Score</span>
                  <span className="text-sm font-bold text-white">Matches your profile</span>
                </div>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-primaryViolet to-primaryIndigo text-white flex items-center justify-center font-display font-black text-lg shadow-md shadow-primaryViolet/15">
                  {path.matchPercent}%
                </div>
              </div>
            </div>

            <p className="text-sm text-secondaryGray leading-relaxed mb-6">
              {path.reasoning}
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/[0.06] text-xs">
              <div>
                <span className="text-secondaryGray block mb-1">Average Salary</span>
                <span className="text-white font-semibold text-sm">
                  {formatCurrency(path.salaryRange.min)} - {formatCurrency(path.salaryRange.max)}
                </span>
              </div>
              <div>
                <span className="text-secondaryGray block mb-1">Demand Outlook</span>
                <span className="text-emerald-400 font-semibold text-sm flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>{path.demandOutlook}</span>
                </span>
              </div>
              <div>
                <span className="text-secondaryGray block mb-1">AI Confidence</span>
                <span className="text-white font-semibold text-sm">{path.confidenceScore}%</span>
              </div>
              <div>
                <span className="text-secondaryGray block mb-1">Roadmap Duration</span>
                <span className="text-white font-semibold text-sm">{path.roadmap.length} Months</span>
              </div>
            </div>
          </div>

          {/* Skill Inventory & Radar Chart Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills acquired vs Missing lists */}
            <div className="glass-panel rounded-3xl p-6 border border-white/[0.06] flex flex-col justify-between">
              <div>
                <h3 className="font-display text-base font-semibold text-white mb-4">Skills Gap Analysis</h3>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-2">Skills You Already Have ({path.skillsYouHave.length})</span>
                    <div className="flex flex-wrap gap-1.5">
                      {path.skillsYouHave.map(skill => (
                        <span key={skill} className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
                          <ShieldCheck className="h-3 w-3 shrink-0" />
                          <span>{skill}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accentAmber block mb-2">Skills to Acquire ({path.skillsToLearn.length})</span>
                    <div className="flex flex-wrap gap-1.5">
                      {path.skillsToLearn.map(skill => (
                        <span key={skill} className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] font-semibold text-accentAmber">
                          <Bookmark className="h-3 w-3 shrink-0" />
                          <span>{skill}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="mt-8 pt-4 border-t border-white/[0.06]">
                <div className="flex justify-between text-xs font-semibold text-secondaryGray mb-2">
                  <span>Roadmap Completion Progress</span>
                  <span className="text-white">{progressPercent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primaryViolet to-primaryIndigo rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Radar chart visual */}
            <div className="glass-panel rounded-3xl p-6 border border-white/[0.06] h-[280px]">
              <h3 className="font-display text-base font-semibold text-white mb-2">Visual Skill Comparison</h3>
              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={allSkills}>
                    <PolarGrid stroke="rgba(255, 255, 255, 0.05)" />
                    <PolarAngleAxis dataKey="name" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 8 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} stroke="rgba(255, 255, 255, 0.05)" />
                    <Radar name="Your Match" dataKey="user" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                    <Radar name="Target Profile" dataKey="required" stroke="#F59E0B" fill="none" strokeWidth={1} strokeDasharray="3 3" />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Month-by-Month Roadmap Vertical Stepper */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.06]">
            <h3 className="font-display text-lg font-bold text-white mb-6">Personalized Action Plan</h3>

            <div className="relative border-l border-white/10 pl-6 sm:pl-8 space-y-10 ml-3">
              {path.roadmap.map((month, mIdx) => (
                <div key={month.month} className="relative">
                  {/* Timeline Dot */}
                  <span className="absolute left-[-31px] sm:left-[-39px] top-1.5 flex h-4 w-4 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-darkBg border-2 border-primaryViolet">
                    <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primaryViolet"></span>
                  </span>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-primaryViolet block mb-1">
                      Month {month.month}
                    </span>
                    <h4 className="font-display text-base font-bold text-white mb-3">
                      {month.focus}
                    </h4>

                    {/* Tasks Checklist */}
                    <div className="space-y-2.5">
                      {month.tasks.map((task, tIdx) => {
                        const isDone = completedTasks[`${mIdx}-${tIdx}`];
                        return (
                          <div 
                            key={tIdx}
                            onClick={() => handleToggleTask(mIdx, tIdx)}
                            className={`flex items-start space-x-3 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                              isDone 
                                ? "bg-white/[0.01] border-white/5 opacity-50" 
                                : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.03]"
                            }`}
                          >
                            <button className="mt-0.5 shrink-0">
                              {isDone ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 fill-emerald-400/20" />
                              ) : (
                                <Circle className="h-4 w-4 text-secondaryGray hover:text-white" />
                              )}
                            </button>
                            <span className={`text-xs text-secondaryGray ${isDone ? 'line-through text-secondaryGray/60' : 'text-white'}`}>
                              {task}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Right Column (Sidebar): Live Chat Coach Panel */}
      <div className="space-y-6 lg:sticky lg:top-24">
        <div className="glass-panel rounded-3xl p-5 border border-white/[0.06] flex flex-col h-[500px]">
          <div className="pb-4 border-b border-white/[0.06] flex items-center space-x-2">
            <MessageSquare className="h-4 w-4 text-primaryViolet" />
            <div>
              <h3 className="text-xs font-bold text-white">Ask Career Coach AI</h3>
              <span className="text-[10px] text-secondaryGray">Chat context: {path.title}</span>
            </div>
          </div>

          {/* Chat Stream */}
          <div className="flex-grow overflow-y-auto py-4 space-y-3 custom-scrollbar">
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

          {/* Chat Form */}
          <form onSubmit={handleSendChat} className="pt-3 border-t border-white/[0.06] flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask: What certifications should I get?"
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

        {/* Pro Coaching Alert Box */}
        <div className="glass-panel rounded-2xl p-4 border border-white/5 bg-gradient-to-br from-primaryViolet/5 to-transparent text-xs text-secondaryGray flex items-start space-x-3">
          <Sparkles className="h-5 w-5 text-accentAmber shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white block mb-1">Tailored Milestones</span>
            <span>Check off tasks as you finish them! Your progress is auto-saved locally on your device.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailView;
