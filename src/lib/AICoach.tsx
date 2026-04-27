import React, { useState, useEffect } from 'react';
import { Bot, X, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { useGame } from './GameContext';

export function AICoach({ currentStage }: { currentStage: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const { t, isRtl } = useLanguage();
  const { useHint } = useGame();
  
  // Track which stages we already penalized points for
  const [hintedStages, setHintedStages] = useState<string[]>([]);

  const handleOpenCoach = () => {
    setIsOpen(!isOpen);
    setShowNotification(false);
    
    // If opening for the first time on this stage, deduct hint
    if (!isOpen && !hintedStages.includes(currentStage)) {
       useHint();
       setHintedStages(prev => [...prev, currentStage]);
    }
  };

  const hints: Record<string, string> = {
    'persona': 'T/A selection will dictate your ultimate goal. A script kiddie usually takes the easiest path, while an APT goes for the most critical data.',
    'osint': 'In the Dark Web browser, rely on leaked database dumps. Look for the @bsu.edu.eg domain to find target accounts.',
    'exploit_choice': 'You can choose between KBA bypass or SQL Injection. SQLi directly manipulates the database query, while KBA relies on social engineering.',
    'exploit': 'KBA Bypass: Use the leaked Date of Birth from the previous phase. Think about where you can find personal data.',
    'exploit_sqli': 'SQL Injection: Try to inject a boolean true statement like \' OR \'1\'=\'1 into the username field to bypass auth.',
    'impact': 'Explore what access you have. You can view sensitive data or execute actions like ransomware.',
    'remediation': 'Code fixing: Look for the solution that introduces true Multi-Factor Authentication or Parameterized Queries, not just superficial checks.',
  };

  useEffect(() => {
    // Show notification if stuck for 15 seconds
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, [currentStage]);

  return (
    <>
      <AnimatePresence>
        {showNotification && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-20 ${isRtl ? 'left-6' : 'right-6'} bg-indigo-600 text-white p-3 rounded-xl shadow-lg border border-indigo-400 cursor-pointer z-40 max-w-[200px]`}
            onClick={handleOpenCoach}
          >
            <div className="flex items-center gap-2 text-sm font-bold">
              <Lightbulb className="w-4 h-4 animate-pulse" />
              {t('hint_coach')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleOpenCoach}
        className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)] hover:bg-indigo-500 hover:scale-110 transition-all z-50`}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed bottom-20 ${isRtl ? 'left-6' : 'right-6'} w-80 bg-[#151521] border border-indigo-500/30 rounded-2xl shadow-2xl p-4 z-40`}
          >
            <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Security AI Coach</h3>
                <div className="text-[10px] text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
                </div>
              </div>
            </div>
            <div className="text-sm text-slate-300 leading-relaxed">
              {hints[currentStage] || 'Need assistance? Review the instructions on the left panel.'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
