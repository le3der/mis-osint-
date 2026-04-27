import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, ShieldAlert, Target, Database, Search, Lock, 
  ArrowRight, Globe, AlertTriangle, Monitor, FileText, CheckCircle,
  GraduationCap, Users, DollarSign, X, ArrowLeft, KeyRound, Activity,
  Loader2, Clock, Check, Download
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/LanguageContext';
import { useGame } from '../lib/GameContext';
import { saveScore, ScoreEntry } from '../lib/firebase';
import { AICoach } from '../lib/AICoach';
import { translations } from '../lib/translations';
import { AudioService } from '../lib/audio';
import jsPDF from 'jspdf';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-sql';
import 'prismjs/themes/prism-tomorrow.css';

const accounts = {
  'dr.ahmed.cs@bsu.edu.eg': {
    role: 'Professor',
    dob: '1975-08-22',
    name: 'Dr. Ahmed Mahmoud',
    type: 'grades',
    leak: 'oldpass_2021'
  },
  's.affairs@bsu.edu.eg': {
    role: 'Student Affairs',
    dob: '1982-11-05',
    name: 'Sarah Hassan',
    type: 'pii',
    leak: 'Admin@123'
  },
  'finance.admin@bsu.edu.eg': {
    role: 'Financial Admin',
    dob: '1979-03-14',
    name: 'Khaled Ibrahim',
    type: 'finance',
    leak: 'bsu_finance79'
  }
};

type LabStage = 'persona' | 'osint' | 'exploit_choice' | 'exploit' | 'exploit_sqli' | 'impact' | 'remediation' | 'certificate';

export function CyberLab({ onExit }: { onExit: () => void }) {
  const [stage, setStage] = useState<LabStage>(() => localStorage.getItem('cyberlab_stage') as LabStage || 'persona');
  const [hackedAccount, setHackedAccount] = useState<string | null>(() => localStorage.getItem('cyberlab_hackedAccount'));
  const [persona, setPersona] = useState<string | null>(() => localStorage.getItem('cyberlab_persona'));
  const { t, isRtl } = useLanguage();
  const { startGame, resetGame } = useGame();

  useEffect(() => {
    localStorage.setItem('cyberlab_stage', stage);
    if(stage === 'persona') {
      startGame();
    }
  }, [stage]);

  useEffect(() => {
    if (hackedAccount) localStorage.setItem('cyberlab_hackedAccount', hackedAccount);
    else localStorage.removeItem('cyberlab_hackedAccount');
  }, [hackedAccount]);

  useEffect(() => {
    if (persona) localStorage.setItem('cyberlab_persona', persona);
    else localStorage.removeItem('cyberlab_persona');
  }, [persona]);


  return (
    <div className="flex flex-col h-screen w-full bg-[#0a0a0e] text-slate-300 font-sans overflow-hidden">
      {/* Top Banner */}
      <header className="h-14 bg-[#050508] border-b border-indigo-900/30 flex items-center justify-between px-4 shrink-0 shadow-md z-20">
        <div className="flex items-center gap-4">
          <button onClick={onExit} className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors flex items-center gap-2 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Exit Lab
          </button>
          <div className="h-6 w-[1px] bg-slate-800 hidden md:block"></div>
          <div className="hidden md:flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-[10px]">
            <Target className="w-3.5 h-3.5" />
            Attack Simulation Environment
          </div>
        </div>
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
          {persona && <><span className="text-indigo-400">T/A: {persona}</span> <span className="opacity-50">|</span></>}
          <div className="hidden md:block">
             <GlobalTimer isActive={stage !== 'persona' && stage !== 'remediation'} onFail={onExit} />
          </div>
          <span className="opacity-50 hidden md:block">|</span>
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          Target: mis.bsu.edu.eg <span className="opacity-50">|</span> Session: Active
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Lab Sidebar */}
        <aside className="w-72 bg-[#050508] border-r border-indigo-900/30 p-5 shrink-0 flex flex-col gap-3 z-10 hidden md:flex shadow-2xl relative">
          <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .3) 25%, rgba(255, 255, 255, .3) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .3) 75%, rgba(255, 255, 255, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .3) 25%, rgba(255, 255, 255, .3) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .3) 75%, rgba(255, 255, 255, .3) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' }}></div>
          <div className="relative z-10 flex flex-col h-full gap-3">
             <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-1 flex items-center gap-2">
               <Activity className="w-3.5 h-3.5"/> Simulation Stages
             </h2>
             
             <StageBtn current={stage} target="persona" icon={Users} label={t('cyberlab_stage0')} setStage={setStage} />
             <StageBtn current={stage} target="osint" icon={Search} label={t('cyberlab_stage1')} setStage={setStage} disabled={!persona} />
             <StageBtn current={stage} target="exploit_choice" icon={Lock} label={t('cyberlab_stage2')} setStage={setStage} disabled={stage === 'osint' || stage === 'persona'} />
             <StageBtn current={stage} target="impact" icon={Database} label={t('cyberlab_stage3')} setStage={setStage} disabled={!hackedAccount} />
             <StageBtn current={stage} target="remediation" icon={ShieldAlert} label={t('cyberlab_stage4')} setStage={setStage} disabled={stage !== 'remediation' && stage !== 'certificate'} />
             
             <div className="mt-auto pt-6">
                <div className="p-4 bg-indigo-950/20 rounded-xl border border-indigo-900/40 text-xs shadow-inner">
                   <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-widest uppercase mb-3 text-[10px] border-b border-indigo-900/50 pb-2">
                      <FileText className="w-3.5 h-3.5"/> Instructions
                   </div>
                   <p className="text-slate-400 leading-relaxed">
                     Complete each stage sequentially. Begin by choosing your persona, search for leaked credentials, bypass authentication, analyze data impact, and apply the security patch.
                   </p>
                </div>
             </div>
          </div>
        </aside>

        {/* Lab Content */}
        <main className="flex-1 relative bg-[#0a0a0e] overflow-hidden flex flex-col">
          <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          <div className="relative z-10 w-full h-full">
            <AnimatePresence mode="wait">
              {stage === 'persona' && <PersonaStage key="persona" onSelect={(p) => { setPersona(p); setStage('osint'); }} />}
              {stage === 'osint' && <OsintStage key="osint" onComplete={() => setStage('exploit_choice')} persona={persona!} />}
              {stage === 'exploit_choice' && <ExploitChoiceStage key="exploit_choice" onSelect={(type) => setStage(type === 'kba' ? 'exploit' : 'exploit_sqli')} />}
              {stage === 'exploit' && <ExploitStage key="exploit" onComplete={(acc) => { setHackedAccount(acc); setStage('impact'); }} activeHacked={hackedAccount} />}
              {stage === 'exploit_sqli' && <ExploitSqliStage key="exploit_sqli" onComplete={(acc) => { setHackedAccount(acc); setStage('impact'); }} activeHacked={hackedAccount} />}
              {stage === 'impact' && <ImpactStage key="impact" account={hackedAccount!} onNext={() => setStage('remediation')} />}
              {stage === 'remediation' && <RemediationStage key="rem" onComplete={() => setStage('certificate')} />}
              {stage === 'certificate' && <CertificateStage key="cert" onExit={() => {
                setStage('persona');
                setHackedAccount(null);
                setPersona(null);
                onExit();
              }} />}
            </AnimatePresence>
          </div>
          <AICoach currentStage={stage} />
        </main>
      </div>
    </div>
  );
}

function StageBtn({ current, target, icon: Icon, label, setStage, disabled }: any) {
  const active = current === target;
  return (
    <button 
      onClick={() => setStage(target)}
      disabled={disabled}
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all text-left group",
        active ? "bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.2)] text-white" : "bg-[#0c0c12] hover:bg-[#11111a] text-slate-400 border border-slate-800/50 hover:border-slate-700 hover:text-slate-200",
        disabled && "opacity-40 cursor-not-allowed grayscale hover:bg-transparent hover:border-transparent"
      )}
    >
      <Icon className={cn("w-4 h-4 transition-colors", active ? "text-indigo-200" : "text-slate-600 group-hover:text-slate-400")} />
      {label}
    </button>
  );
}

// -----------------------------------------------------
// Stage 0: Threat Actor Persona
// -----------------------------------------------------
function PersonaStage({ onSelect }: { onSelect: (persona: string) => void, key?: React.Key }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 md:p-10 h-full flex flex-col justify-center max-w-5xl mx-auto w-full">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-white mb-3">Select Threat Actor Profile</h2>
        <p className="text-slate-400">Choose your attacker persona to contextualize the simulation.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PersonaCard 
          title="Script Kiddie" 
          desc="Low technical skill. Uses pre-made scripts and publicly leaked databases. Seeking easy targets for bragging rights."
          icon={<Terminal className="w-8 h-8 text-green-400" />}
          color="border-green-500/30 hover:border-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]"
          onClick={() => onSelect('Script Kiddie')}
        />
        <PersonaCard 
          title="Financially Motivated Group" 
          desc="Highly organized. Seeking direct monetization through ransomware, extortion, or selling student PII on the dark web."
          icon={<DollarSign className="w-8 h-8 text-amber-400" />}
          color="border-amber-500/30 hover:border-amber-500 hover:shadow-[0_0_20px_rgba(251,191,36,0.1)]"
          onClick={() => onSelect('Ransomware Gang')}
        />
        <PersonaCard 
          title="Nation State APT" 
          desc="Advanced Persistent Threat. Extremely sophisticated. Wants to silently steal research or academic intelligence."
          icon={<Globe className="w-8 h-8 text-red-500" />}
          color="border-red-500/30 hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]"
          onClick={() => onSelect('Nation State (APT)')}
        />
      </div>
    </motion.div>
  );
}

function PersonaCard({ title, desc, icon, color, onClick }: any) {
  return (
    <div onClick={onClick} className={cn("bg-[#0c0c12] border p-8 rounded-2xl cursor-pointer transition-all hover:scale-105 shadow-xl group", color)}>
      <div className="bg-[#151521] w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <TypewriterText text={desc} className="text-sm text-slate-400 leading-relaxed font-medium" />
    </div>
  );
}

function TypewriterText({ text, className, speed = 20 }: { text: string, className?: string, speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      if (i % 3 === 0 && i < text.length) {
         AudioService.playType();
      }
      i++;
      if (i > text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text, speed]);

  return <p className={className}>{displayedText}</p>;
}

function GlobalTimer({ isActive, onFail }: { isActive: boolean, onFail: () => void }) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 mins

  useEffect(() => {
    if (!isActive) return;
    if (timeLeft <= 0) {
      alert("Simulation Failed: The Blue Team detected your network anomalies. IPS triggered.");
      onFail();
      return;
    }
    const t = setInterval(() => setTimeLeft(l => l - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, isActive, onFail]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className={cn("flex items-center gap-2", timeLeft < 60 ? "text-red-500 animate-pulse font-bold" : "text-amber-500 font-bold")}>
       <Clock className="w-3.5 h-3.5" /> 
       {mins}:{secs.toString().padStart(2, '0')}
    </div>
  );
}

// -----------------------------------------------------
// Stage 1: OSINT
// -----------------------------------------------------
function OsintStage({ onComplete, persona }: { onComplete: () => void, persona: string, key?: React.Key }) {
  const [output, setOutput] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    setTimeout(() => setIsSearching(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 md:p-10 h-full flex flex-col max-w-5xl mx-auto w-full">
      <div className="mb-8 p-6 bg-[#0c0c12] border border-slate-800/50 rounded-2xl shadow-xl flex justify-between items-center z-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/10 to-transparent pointer-events-none"></div>
        <div className="relative">
          <h2 className="text-2xl font-extrabold text-white mb-2 flex items-center gap-3">
            <div className="bg-indigo-500/20 p-2 rounded text-indigo-400"><Search className="w-5 h-5"/></div>
            Phase 1: Threat Reconnaissance
          </h2>
          <TypewriterText text="Simulate an attacker executing initial recon on the Dark Web to find active university usernames." className="text-slate-400 text-sm font-medium" />
        </div>
      </div>
      
      <div className="flex-1 bg-black border border-slate-800/80 rounded-2xl p-0 overflow-hidden flex flex-col relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10">
        <div className="bg-[#1f1f1f] px-4 py-3 border-b border-white/5 flex gap-4 items-center shrink-0">
           <div className="flex gap-2">
             <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
             <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
             <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
           </div>
           <div className="flex-1 max-w-lg bg-[#0f0f0f] border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs text-slate-400 font-mono">http://deepsearch7x...onion</span>
           </div>
        </div>
        
        <div className="p-8 flex-1 overflow-y-auto relative bg-[#0a0a0a] flex flex-col items-center">
           {!hasSearched ? (
              <div className="flex flex-col items-center justify-center h-full w-full max-w-xl">
                 <Globe className="w-16 h-16 text-indigo-500/50 mb-6" />
                 <h3 className="text-3xl font-black text-white tracking-tight mb-8">DeepSearch<span className="text-indigo-500">.onion</span></h3>
                 <form onSubmit={handleSearch} className="w-full relative">
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={e=>setSearchQuery(e.target.value)}
                      placeholder="Search leaked databases (e.g., bsu.edu.eg)..."
                      className="w-full bg-[#151515] border-2 border-indigo-500/30 rounded-xl py-4 pl-6 pr-14 text-white text-lg focus:outline-none focus:border-indigo-500 transition-colors shadow-inner font-mono"
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 focus:outline-none">
                       <Search className="w-5 h-5" />
                    </button>
                 </form>
              </div>
           ) : isSearching ? (
             <div className="flex flex-col items-center justify-center h-full text-indigo-400 gap-4">
                <Loader2 className="w-12 h-12 animate-[spin_1.5s_linear_infinite]" />
                <span className="font-mono text-sm tracking-widest uppercase animate-pulse">Querying illicit databases...</span>
             </div>
           ) : (
             <div className="w-full max-w-4xl pt-4">
                <div className="flex items-center gap-3 mb-8">
                  <h3 className="text-2xl font-black text-white tracking-tight">Search Results</h3>
                  <span className="text-xs text-slate-500 font-mono">Found 1 match for "{searchQuery}" in 0.04s</span>
                </div>

                <div className="bg-[#151515] border border-red-500/20 rounded-xl p-6 flex flex-col">
                   <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-red-400 font-bold font-mono text-sm mb-1">ComboList_EG_Universities_2022.txt</h4>
                        <p className="text-xs text-slate-500">Source: Telegram dump &bull; Confidence: 85%</p>
                      </div>
                      <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-1 rounded uppercase">Pwned Data</span>
                   </div>
                   
                   <pre className="bg-black/50 p-4 rounded-lg border border-white/5 font-mono text-xs text-slate-300 leading-relaxed mb-6 overflow-x-auto">
[LEAKED CREDENTIALS]
dr.ahmed.cs@bsu.edu.eg : oldpass_2021
s.affairs@bsu.edu.eg : Admin@123
finance.admin@bsu.edu.eg : bsu_finance79

-- End of DB Snippet --
                   </pre>

                   <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-lg mb-6">
                      <p className="text-xs text-indigo-300 leading-relaxed"><strong className="text-indigo-400">Attacker Note:</strong> Note that passwords may be outdated if users changed them, but the usernames reflect active accounts to target.</p>
                   </div>
                   
                   <button onClick={onComplete} className="ml-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-sans text-sm font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center gap-3 transition-transform hover:scale-105 active:scale-95">
                     Proceed to Exploitation Phase <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
             </div>
           )}
        </div>
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------
// Stage 2: Exploit
// -----------------------------------------------------
function ExploitStage({ onComplete, activeHacked }: { onComplete: (acc: string) => void, activeHacked: string | null, key?: React.Key }) {
  const [step, setStep] = useState<'login'|'reset'|'social'|'challenge'|'success'>('login');
  const [targetUser, setTargetUser] = useState('');
  const [dobInput, setDobInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const targetData = accounts[targetUser as keyof typeof accounts];

  const filteredAccounts = Object.entries(accounts).filter(([email, data]) => 
    email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    data.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 md:p-10 h-full flex flex-col max-w-7xl mx-auto w-full">
      <div className="mb-8 p-6 bg-[#0c0c12] border border-slate-800/50 rounded-2xl shadow-xl z-10 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/10 to-transparent pointer-events-none"></div>
         <div className="relative">
            <h2 className="text-2xl font-extrabold text-white mb-2 flex items-center gap-3">
               <div className="bg-indigo-500/20 p-2 rounded text-indigo-400"><Lock className="w-5 h-5"/></div>
               Phase 2: Vulnerability Exploitation
            </h2>
            <TypewriterText text="Exploit the Knowledge-Based Authentication (KBA) via password recovery using the leaked usernames." className="text-slate-400 text-sm font-medium" />
         </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 overflow-hidden z-10">
        
        {/* Fake Browser Window */}
        <div className="bg-white rounded-2xl border border-slate-700/50 overflow-hidden flex flex-col shadow-2xl flex-1 relative ring-4 ring-slate-800/10">
          <div className="bg-slate-100 border-b border-slate-300 p-2.5 flex items-center gap-3 shrink-0">
             <div className="flex gap-1.5 ml-1">
               <div className="w-3 h-3 rounded-full bg-slate-300"></div>
               <div className="w-3 h-3 rounded-full bg-slate-300"></div>
               <div className="w-3 h-3 rounded-full bg-slate-300"></div>
             </div>
             <div className="flex-1 bg-white border border-slate-200 rounded-md py-1 px-3 text-xs text-slate-500 font-medium text-center flex items-center justify-center gap-2 shadow-inner">
               <Lock className="w-3 h-3 text-slate-400" />
               https://mis.bsu.edu.eg/auth/login
             </div>
             <div className="w-10"></div>
          </div>
          
          <div className="flex-1 bg-slate-50 flex items-center justify-center relative overflow-y-auto w-full h-full p-4">
            <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #1E3A8A 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
            
            <AnimatePresence mode="wait">
              {step === 'login' && (
                <motion.div key="l" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-10 rounded-2xl border border-slate-200 shadow-xl w-full max-w-md relative z-10">
                  <div className="w-16 h-16 bg-[#1E3A8A] text-white rounded-xl mx-auto flex items-center justify-center text-xl font-black mb-6 shadow-lg shadow-blue-900/20">BSU</div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-8 text-center tracking-tight">Faculty & Staff Login</h3>
                  <div className="space-y-5 text-slate-800">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">University ID or Email</label>
                      <input type="text" className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none transition-all shadow-sm" value={targetUser} onChange={e=>setTargetUser(e.target.value)} placeholder="username@bsu.edu.eg" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Password</label>
                      <input type="password" disabled className="w-full p-3 border border-slate-200 bg-slate-100 rounded-lg text-sm cursor-not-allowed text-slate-400 font-mono" placeholder="••••••••••••" />
                    </div>
                    <div className="pt-4 text-center text-sm relative">
                      {error && <div className="absolute -top-10 left-0 w-full p-2 bg-red-50 border border-red-100 text-red-600 text-[10px] rounded text-center">{error}</div>}
                      <button 
                        disabled={isLoading}
                        onClick={() => {
                          if (!targetData) setError('Attacker Note: Select a leaked target from the right sidebar first.');
                          else { 
                            setError(''); 
                            setIsLoading(true);
                            setTimeout(() => { setIsLoading(false); setStep('reset'); }, 1000);
                          }
                        }} 
                        className="text-[#1E3A8A] font-bold hover:underline disabled:opacity-50 disabled:no-underline flex items-center justify-center mx-auto gap-2"
                      >
                        {isLoading && <Loader2 className="w-3 h-3 animate-spin"/>} Forgot Password?
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 'reset' && (
                <motion.div key="r" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-10 rounded-2xl border border-slate-200 shadow-xl w-full max-w-md text-slate-800 text-center relative z-10">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200"><KeyRound className="w-5 h-5 text-slate-600"/></div>
                  <h3 className="text-2xl font-bold mb-3 tracking-tight">Password Recovery</h3>
                  <p className="text-sm text-slate-500 mb-8 leading-relaxed">Account found: <strong className="text-slate-800 block text-base mt-1">{targetUser}</strong></p>
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-8">
                     <p className="text-sm text-blue-800 font-medium">To verify your identity, please answer the security question registered to your account.</p>
                  </div>
                  <button 
                    disabled={isLoading}
                    onClick={() => {
                      setIsLoading(true);
                      setTimeout(() => { setIsLoading(false); setStep('social'); }, 1200);
                    }} 
                    className="bg-[#1E3A8A] text-white font-bold w-full py-3.5 rounded-xl shadow-lg hover:bg-blue-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <><Loader2 className="w-5 h-5 animate-spin"/> Processing...</> : 'Continue to Security Question'}
                  </button>
                </motion.div>
              )}

              {step === 'social' && (
                <motion.div key="s" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#151521] border border-red-500/50 p-6 sm:p-8 rounded-2xl shadow-[0_20px_50px_rgba(239,68,68,0.15)] w-full max-w-lg text-white relative z-20">
                     <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{ boxShadow: 'inset 0 0 40px rgba(239,68,68,0.05)' }}></div>
                     <h3 className="text-xl font-extrabold mb-4 flex items-center gap-3 text-red-500 pb-4 border-b border-red-900/40">
                         <Search className="w-6 h-6"/> Attacker Tool: Social Query
                     </h3>
                     <p className="text-sm text-slate-400 mb-6 leading-relaxed">Before answering the KBA, the Date of Birth must be extracted. Running background reconnaissance via public indexers...</p>
                     <div className="bg-[#0f0f17] p-5 font-mono text-[13px] text-green-400 rounded-xl border border-black shadow-inner leading-relaxed overflow-x-auto">
                        <span className="text-slate-500">root@kali:~#</span> ./osint_fb.py -t "{targetData?.name}" -l "Bani Suef"<br/>
                        <span className="text-yellow-500">[*]</span> Scanning Facebook, LinkedIn, University Directory...<br/>
                        <span className="animate-pulse">...</span><br/>
                        <span className="text-blue-400">[+]</span> MATCH FOUND! Profile correlation: 98%<br/>
                        <span className="text-slate-400">[-]</span> Profile: facebook.com/{targetUser.split('@')[0]}<br/>
                        <span className="text-slate-400">[-]</span> About: "Works at BSU" ...<br/>
                        <span className="text-red-400 font-bold bg-red-900/30 px-2 py-0.5 rounded mt-2 inline-block">[!] Extracted DOB: {targetData?.dob}</span>
                     </div>
                     <button 
                        disabled={isLoading}
                        onClick={() => {
                          setIsLoading(true);
                          setTimeout(() => { setIsLoading(false); setStep('challenge'); }, 1500);
                        }} 
                        className="mt-8 w-full bg-red-600 hover:bg-red-500 py-3.5 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                     >
                        {isLoading ? <><Loader2 className="w-5 h-5 animate-spin"/> Injecting Intercept...</> : 'Proceed to Challenge Bypass'}
                     </button>
                </motion.div>
              )}

              {step === 'challenge' && (
                <motion.div key="c" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-10 rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md text-slate-800 relative z-10 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
                  <h3 className="text-xl font-bold mb-8 text-center text-amber-600 flex items-center justify-center gap-2">
                    <ShieldAlert className="w-6 h-6"/> Security Challenge
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="dob-input" className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center flex items-center justify-center gap-2">
                        <Lock className="w-3 h-3"/> What is your Date of Birth?
                      </label>
                      <div className="relative">
                        <input 
                          id="dob-input"
                          type="date" 
                          value={dobInput} 
                          onChange={e=>setDobInput(e.target.value)} 
                          aria-invalid={!!error}
                          aria-describedby={error ? "dob-error" : undefined}
                          className={cn(
                            "w-full p-4 pl-12 border bg-white rounded-xl focus:ring-4 focus:outline-none font-mono text-center text-lg tracking-widest transition-all shadow-inner hover:bg-amber-50/30",
                            error ? "border-red-400 focus:ring-red-500/20 text-red-900" : "border-amber-200 focus:ring-amber-500/20 focus:border-amber-400 text-amber-900"
                          )} 
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" aria-hidden="true">
                           <Target className="w-5 h-5"/>
                        </div>
                      </div>
                    </div>
                    <AnimatePresence>
                      {error && (
                        <motion.div 
                          id="dob-error"
                          role="alert"
                          initial={{ opacity: 0, x: -10 }} 
                          animate={{ opacity: 1, x: [-5, 5, -5, 5, 0] }} 
                          exit={{ opacity: 0, scale: 0.95 }} 
                          transition={{ duration: 0.4 }}
                          className="text-sm text-red-700 font-bold flex items-center justify-center gap-2 bg-red-50 border border-red-200 p-3 rounded-xl shadow-sm"
                        >
                          <AlertTriangle className="w-4 h-4 text-red-500" aria-hidden="true"/> {error}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button 
                      disabled={isLoading}
                      onClick={() => {
                        setIsLoading(true);
                        setTimeout(() => {
                           setIsLoading(false);
                           if(dobInput === targetData?.dob) { 
                             setError(''); 
                             setStep('success'); 
                             AudioService.playSuccess();
                           }
                           else {
                             setError('Incorrect answer.');
                             AudioService.playAlert();
                           }
                        }, 1200);
                      }} 
                      className="w-full bg-amber-500 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-amber-600 transition-colors tracking-wide flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <><Loader2 className="w-5 h-5 animate-spin"/> Verifying...</> : 'Submit Bypass Payload'}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md text-slate-800 text-center relative z-10 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                     <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-3xl font-black mb-3 text-slate-900 tracking-tight">Auth Bypassed</h3>
                  <p className="text-sm text-slate-500 mb-8 leading-relaxed">Password has been reset. Full account takeover achieved for <strong className="text-slate-800">{targetData?.name}</strong>.</p>
                  <button onClick={() => onComplete(targetUser)} className="w-full bg-[#11111a] text-white font-bold py-4 rounded-xl shadow-xl hover:bg-black transition-colors flex items-center justify-center gap-2">
                    Enter Dashboard <ArrowRight className="w-4 h-4"/>
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* Hints Sidebar */}
        <div className="bg-[#0f0f17] rounded-2xl p-6 border border-slate-800/80 flex flex-col shadow-2xl">
          <h3 className="text-sm font-extrabold text-white mb-2 flex items-center gap-2 tracking-wide"><KeyRound className="w-4 h-4 text-indigo-400"/> Stolen Credentials</h3>
          <p className="text-xs text-slate-400 mb-4 font-medium leading-relaxed">Select a compromised username to begin the exploit sequence.</p>
          
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by email or role..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#151521] border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {filteredAccounts.map(([email, data]) => (
              <div key={email} onClick={() => setTargetUser(email)} className={cn(
                "p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]",
                targetUser === email ? "bg-indigo-600/10 border-indigo-500/50 shadow-inner" : "bg-[#151521] border-slate-800/80 hover:border-slate-600"
              )}>
                <div className="font-mono text-xs text-indigo-300 font-bold mb-1.5 truncate">{email}</div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{data.role}</span>
                  {activeHacked === email && <span className="text-[9px] bg-red-900/50 text-red-300 px-2 py-0.5 rounded-full font-black tracking-widest border border-red-500/30">PWNED</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}

// -----------------------------------------------------
// Exploit Choice Stage
// -----------------------------------------------------
function ExploitChoiceStage({ onSelect }: { onSelect: (type: 'kba' | 'sqli') => void, key?: React.Key }) {
  const { t } = useLanguage();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 md:p-10 h-full flex flex-col justify-center max-w-5xl mx-auto w-full">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-white mb-3">Select Exploit Vector</h2>
        <p className="text-slate-400">Choose the method to compromise the authentication system.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        <div onClick={() => onSelect('kba')} className="bg-[#0c0c12] border border-slate-700 hover:border-indigo-500 p-8 rounded-2xl cursor-pointer transition-all hover:scale-105 shadow-xl group text-center">
          <div className="bg-indigo-500/10 w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Lock className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">{t('auth_bypass')} (KBA)</h3>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">Use leaked personal information to reset the victim's password via the Knowledge-Based Authentication flow.</p>
        </div>
        <div onClick={() => onSelect('sqli')} className="bg-[#0c0c12] border border-slate-700 hover:border-red-500 p-8 rounded-2xl cursor-pointer transition-all hover:scale-105 shadow-xl group text-center">
          <div className="bg-red-500/10 w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Database className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">{t('sql_injection')}</h3>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">{t('sql_desc_btn')}</p>
        </div>
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------
// SQLi Exploit Stage
// -----------------------------------------------------
function ExploitSqliStage({ onComplete, activeHacked }: { onComplete: (acc: string) => void, activeHacked: string | null, key?: React.Key }) {
  const [targetUser, setTargetUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'login'|'success'>('login');
  
  const targetData = accounts[targetUser as keyof typeof accounts];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Check if it's a basic SQLi payload
    const isSqli = targetUser.includes("' OR '1'='1") || targetUser.includes('" OR "1"="1');
    
    setTimeout(() => {
      setIsLoading(false);
      if (isSqli) {
        // Find the first admin or high privilege account if they just injected broadly,
        // or if they injected into a specific email like: admin@bsu.edu.eg' OR '1'='1
        const actualEmail = Object.keys(accounts).find(e => targetUser.startsWith(e)) || 'dr.ahmed.cs@bsu.edu.eg';
        setTargetUser(actualEmail); // Force it to a valid account for the next stage
        setStep('success');
        AudioService.playSuccess();
      } else {
        setError('Invalid username or password.');
        AudioService.playAlert();
      }
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 md:p-10 h-full flex flex-col max-w-7xl mx-auto w-full">
      <div className="mb-8 p-6 bg-[#0c0c12] border border-slate-800/50 rounded-2xl shadow-xl z-10 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 to-transparent pointer-events-none"></div>
         <div className="relative">
            <h2 className="text-2xl font-extrabold text-white mb-2 flex items-center gap-3">
               <div className="bg-red-500/20 p-2 rounded text-red-500"><Terminal className="w-5 h-5"/></div>
               Phase 2: SQL Injection
            </h2>
            <TypewriterText text="Inject malicious SQL payloads into the login field to bypass auth and dump the database." className="text-slate-400 text-sm font-medium" />
         </div>
      </div>

      <div className="flex-1 overflow-hidden z-10 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-slate-700/50 overflow-hidden flex flex-col shadow-2xl w-full max-w-3xl relative ring-4 ring-slate-800/10 h-[600px]">
          <div className="bg-slate-100 border-b border-slate-300 p-2.5 flex items-center gap-3 shrink-0">
             <div className="flex gap-1.5 ml-1">
               <div className="w-3 h-3 rounded-full bg-slate-300"></div>
               <div className="w-3 h-3 rounded-full bg-slate-300"></div>
               <div className="w-3 h-3 rounded-full bg-slate-300"></div>
             </div>
             <div className="flex-1 bg-white border border-slate-200 rounded-md py-1 px-3 text-xs text-slate-500 font-medium text-center flex items-center justify-center gap-2 shadow-inner">
               <Lock className="w-3 h-3 text-slate-400" />
               https://mis.bsu.edu.eg/auth/login
             </div>
          </div>
          
          <div className="flex-1 bg-slate-50 flex items-center justify-center relative overflow-y-auto w-full p-4">
            <AnimatePresence mode="wait">
              {step === 'login' && (
                <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white p-10 rounded-2xl border border-slate-200 shadow-xl w-full max-w-md relative z-10">
                  <div className="w-16 h-16 bg-[#1E3A8A] text-white rounded-xl mx-auto flex items-center justify-center text-xl font-black mb-6 shadow-lg shadow-blue-900/20">BSU</div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-8 text-center tracking-tight">Faculty & Staff Login</h3>
                  <form onSubmit={handleLogin} className="space-y-5 text-slate-800">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">University ID or Email</label>
                      <input type="text" className="w-full p-3 border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none transition-all shadow-sm" value={targetUser} onChange={e=>setTargetUser(e.target.value)} placeholder="admin@bsu.edu.eg' OR '1'='1" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Password</label>
                      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1E3A8A]" placeholder="••••••••••••" />
                    </div>
                    <div className="pt-4 text-center text-sm relative">
                      {error && <div className="absolute -top-10 left-0 w-full p-2 bg-red-50 border border-red-100 text-red-600 text-[10px] rounded text-center">{error}</div>}
                      <button 
                        type="submit"
                        disabled={isLoading}
                        className="bg-[#1E3A8A] text-white font-bold w-full py-3.5 rounded-xl shadow-lg hover:bg-blue-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isLoading ? <><Loader2 className="w-5 h-5 animate-spin"/> Processing...</> : 'Login'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md text-slate-800 text-center relative z-10 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                     <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-3xl font-black mb-3 text-slate-900 tracking-tight">Auth Bypassed (SQLi)</h3>
                  <p className="text-sm text-slate-500 mb-8 leading-relaxed">SQL query manipulated successfully. Bypassed authentication constraints and logged in as Administrator.</p>
                  <button onClick={() => onComplete(targetUser)} className="w-full bg-[#11111a] text-white font-bold py-4 rounded-xl shadow-xl hover:bg-black transition-colors flex items-center justify-center gap-2">
                    Enter Dashboard <ArrowRight className="w-4 h-4"/>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------
// Certificate Stage
// -----------------------------------------------------
function CertificateStage({ onExit }: { onExit: () => void, key?: React.Key }) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const { endGame } = useGame();
  
  const [finalResult, setFinalResult] = useState<{finalScore: number, grade: string, timeTaken: number} | null>(null);

  useEffect(() => {
    // End game once when certificate stage mounts
    const result = endGame();
    setFinalResult(result);
  }, []);

  const issueCert = async () => {
    if (!name.trim() || !finalResult) return;
    setIsExporting(true);
    
    // Quick simple PDF generation
    setTimeout(async () => {
      try {
        const doc = new jsPDF('landscape', 'px', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text('Bani Suef University', pageWidth / 2, 80, { align: 'center' });
        
        doc.setFontSize(40);
        doc.setTextColor(34, 197, 94); // green-500
        doc.text('Certified Defender', pageWidth / 2, 140, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setTextColor(148, 163, 184);
        doc.text('This certifies that', pageWidth / 2, 190, { align: 'center' });
        
        doc.setFontSize(32);
        doc.setTextColor(255, 255, 255);
        doc.text(name, pageWidth / 2, 240, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setTextColor(148, 163, 184);
        doc.text('has successfully completed the CyberLab Vulnerability Assessment & Remediation simulation.', pageWidth / 2, 290, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setTextColor(79, 70, 229);
        doc.text(`Final Score: ${finalResult.finalScore}  |  Grade: ${finalResult.grade}`, pageWidth / 2, 330, { align: 'center' });

        doc.save(`${name.replace(/\s+/g, '_')}_BSU_Certificate.pdf`);
        
        // Save to Firebase Leaderboard
        await saveScore({
          name: name.trim(),
          score: finalResult.finalScore,
          grade: finalResult.grade,
          timeTaken: finalResult.timeTaken
        });

      } catch (err) {
        console.error(err);
      } finally {
        setIsExporting(false);
        onExit(); // Automatically navigate back to dashboard
      }
    }, 1000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto w-full p-6">
      <div className="bg-[#050508] border border-indigo-500/30 p-10 rounded-3xl w-full text-center relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #4f46e5 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
        <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-12 h-12 text-indigo-400" />
        </div>
        <h2 className="text-4xl font-extrabold text-white mb-4 relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Simulation Complete</h2>
        <p className="text-slate-400 mb-6 max-w-lg mx-auto relative z-10 leading-relaxed">
          You have successfully completed all phases of the attack and remediation. Claim your certificate of completion below.
        </p>
        
        {finalResult && (
           <div className="flex justify-center gap-6 mb-10 relative z-10">
              <div className="bg-indigo-900/30 border border-indigo-500/50 rounded-xl px-6 py-3">
                 <div className="text-xs text-indigo-300 uppercase tracking-widest font-bold mb-1">Final Score</div>
                 <div className="text-3xl font-black text-white">{finalResult.finalScore}</div>
              </div>
              <div className="bg-indigo-900/30 border border-indigo-500/50 rounded-xl px-6 py-3">
                 <div className="text-xs text-indigo-300 uppercase tracking-widest font-bold mb-1">Grade</div>
                 <div className="text-3xl font-black text-emerald-400">{finalResult.grade}</div>
              </div>
           </div>
        )}

        <div className="max-w-md mx-auto relative z-10 bg-[#151521] p-6 rounded-2xl border border-white/5">
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('cert_placeholder') as string}
            className="w-full bg-[#0a0a0e] border border-slate-700 rounded-xl py-4 px-6 text-white mb-4 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
          />
          <button 
            disabled={!name.trim() || isExporting}
            onClick={issueCert}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            {t('download_cert')}
          </button>
        </div>

        <button onClick={onExit} className="mt-8 text-slate-500 hover:text-white transition-colors text-sm font-bold mx-auto border-b border-transparent hover:border-white pb-1 relative z-10">
          Return to Dashboard
        </button>
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------
// Stage 3: Impact Post-Breach
// -----------------------------------------------------
function ImpactStage({ account, onNext }: { account: string, onNext: () => void, key?: React.Key }) {
  const [isMounting, setIsMounting] = useState(true);
  const [isRansomwareActive, setIsRansomwareActive] = useState(false);
  const [studentId, setStudentId] = useState('2026102');
  const [modifiedGrade, setModifiedGrade] = useState('B');
  const [isGradeSaved, setIsGradeSaved] = useState(false);

  const target = accounts[account as keyof typeof accounts];

  useEffect(() => {
    const t = setTimeout(() => setIsMounting(false), 2000);
    return () => clearTimeout(t);
  }, []);

  const triggerRansomware = () => {
    setIsRansomwareActive(true);
    AudioService.playAlert();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("p-6 md:p-10 h-full flex flex-col max-w-6xl mx-auto w-full relative", isRansomwareActive && "animate-shake")}>
       {isRansomwareActive && (
         <>
           <div className="absolute inset-0 bg-red-900/50 mix-blend-color-dodge z-[9000] pointer-events-none animate-pulse"></div>
           <div className="glitch-layer glitch-layer-1"></div>
           <div className="glitch-layer glitch-layer-2"></div>
           <div className="fixed inset-0 flex items-center justify-center z-[10000] pointer-events-none">
              <h1 className="text-8xl md:text-[150px] font-black text-red-600 drop-shadow-[0_0_50px_rgba(255,0,0,1)] uppercase tracking-tighter mix-blend-screen opacity-80 rotate-[-10deg]">SYSTEM ENCRYPTED</h1>
           </div>
         </>
       )}
       <div className="mb-8 p-6 bg-[#0c0c12] border border-red-900/40 rounded-2xl shadow-[0_20px_50px_rgba(239,68,68,0.1)] flex flex-wrap gap-4 justify-between items-center z-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-transparent pointer-events-none"></div>
        <div className="relative">
          <h2 className="text-2xl font-extrabold text-white mb-2 flex items-center gap-3">
             <div className="bg-red-500/20 p-2 rounded text-red-500"><Database className="w-5 h-5"/></div>
             Phase 3: Post-Breach Impact
          </h2>
          <TypewriterText text={`Visualizing the level of access granted to a malicious actor after hijacking the ${target.role} role.`} className="text-slate-400 text-sm" />
        </div>
        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button onClick={triggerRansomware} disabled={isRansomwareActive} className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-6 py-3.5 rounded-xl font-sans text-sm font-bold shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center gap-2 transition-transform hover:scale-105">
            <AlertTriangle className="w-4 h-4"/> Deploy Ransomware
          </button>
          <button onClick={onNext} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-sans text-sm font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center gap-3 transition-transform hover:scale-105">
            Apply Remediation <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-2xl border-4 border-slate-700/50 overflow-hidden flex flex-col font-sans relative z-10">
        <header className="bg-slate-900 p-4 border-b border-black flex justify-between items-center text-white shrink-0 shadow-lg relative z-20">
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
          <div className="flex items-center gap-4 relative z-10 w-full">
             <div className="bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-md uppercase tracking-widest animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]">Hijacked Session</div>
             <h3 className="font-bold tracking-tight text-slate-200">MIS Internal Dashboard</h3>
             
             <div className="ml-auto flex items-center gap-4 bg-slate-800/80 pr-2 pl-4 py-1.5 rounded-full border border-slate-700">
               <div className="text-right hidden sm:block">
                 <div className="text-sm font-bold text-white">{target.name}</div>
                 <div className="text-[10px] text-green-400 uppercase tracking-widest">{target.role} <span className="opacity-50 text-white ml-2">(Admin)</span></div>
               </div>
               <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex justify-center items-center font-bold text-lg shadow-inner ring-2 ring-indigo-400/50">{target.name.charAt(0)}</div>
             </div>
          </div>
        </header>
        
        <div className="flex-1 p-6 md:p-10 bg-slate-50 overflow-y-auto text-slate-800 relative">
           
           {isMounting ? (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 max-w-4xl mx-auto w-full">
                <div className="flex items-center gap-4 mb-2 border-b border-slate-200 pb-6 bg-white p-6 rounded-2xl shadow-sm">
                   <div className="w-16 h-16 bg-slate-200 rounded-2xl animate-pulse"></div>
                   <div className="space-y-3 flex-1">
                      <div className="h-6 bg-slate-200 rounded-md w-1/3 animate-pulse"></div>
                      <div className="h-4 bg-slate-200 rounded-md w-2/3 animate-pulse"></div>
                   </div>
                </div>
                <div className="bg-white border-2 border-slate-200 p-8 rounded-2xl shadow-sm flex flex-col items-start gap-8 mt-8">
                   <div className="flex items-center gap-4 w-full">
                      <div className="w-12 h-12 bg-slate-200 rounded-full animate-pulse"></div>
                      <div className="h-6 bg-slate-200 rounded-md w-1/4 animate-pulse"></div>
                   </div>
                   <div className="space-y-3 flex-1 w-full">
                      <div className="h-10 bg-slate-200 rounded-xl w-32 animate-pulse mb-4"></div>
                      <div className="h-4 bg-slate-200 rounded-md w-full animate-pulse"></div>
                      <div className="h-4 bg-slate-200 rounded-md w-5/6 animate-pulse"></div>
                   </div>
                   <div className="h-32 bg-slate-200 rounded-xl w-full animate-pulse mt-4 hidden md:block"></div>
                </div>
             </motion.div>
           ) : (
             <AnimatePresence mode="wait">
               {target.type === 'grades' && (
             <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y:0, opacity: 1 }} className="space-y-8 max-w-4xl mx-auto">
                <div className="flex items-center gap-4 text-red-600 mb-2 border-b border-red-100 pb-6 bg-red-50/50 p-6 rounded-2xl">
                  <div className="p-4 bg-red-100 rounded-2xl"><GraduationCap className="w-8 h-8" /></div>
                  <div>
                     <h3 className="text-2xl font-black tracking-tight text-red-700">Academic Records Unrestricted Access</h3>
                     <p className="text-slate-700 mt-2 font-medium">As a Professor, the attacker can view and permanently modify finalized student grades. This degrades the core integrity of the university's degree programs.</p>
                  </div>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden mt-8 ring-1 ring-black/5">
                  <div className="bg-slate-100/50 p-4 border-b border-slate-200 flex justify-between items-center">
                     <h4 className="font-bold text-slate-800">CS-301: Advanced Algorithms (Spring 2026)</h4>
                     <button className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded font-bold hover:bg-slate-800">Export Final Roster</button>
                  </div>
                  
                  <div className="p-6 bg-red-50 border-b border-red-100 flex flex-col sm:flex-row items-center gap-4">
                     <div className="text-sm font-bold text-red-800">IDOR Vulnerability Simulation:</div>
                     <div className="flex flex-1 items-center gap-2 max-w-lg w-full bg-white border border-red-200 p-2 rounded-lg shadow-inner">
                        <span className="text-xs text-slate-400 font-mono">mis.bsu.edu.eg/api/grades?id=</span>
                        <input 
                           type="text" 
                           value={studentId} 
                           onChange={e => { setStudentId(e.target.value); setIsGradeSaved(false); }}
                           className="flex-1 font-mono text-sm bg-transparent outline-none focus:ring-0 text-red-700 font-bold"
                        />
                     </div>
                  </div>

                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold tracking-widest text-[10px] uppercase">
                      <tr><th className="px-6 py-4">Student ID</th><th className="px-6 py-4">Name</th><th className="px-6 py-4">Midterm</th><th className="px-6 py-4">Final Grade</th><th className="px-6 py-4 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-slate-500">{studentId || '2026102'}</td>
                        <td className="px-6 py-4 font-bold text-slate-700">Target Student</td>
                        <td className="px-6 py-4">35/50</td>
                        <td className="px-6 py-4">
                           <input type="text" value={modifiedGrade} onChange={e => {setModifiedGrade(e.target.value); setIsGradeSaved(false)}} className="w-16 p-1 border font-bold text-center border-slate-300 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => {setIsGradeSaved(true); AudioService.playSuccess()}} className={cn("font-bold text-sm px-4 py-2 rounded transition-colors", isGradeSaved ? "bg-green-100 text-green-700" : "bg-[#1E3A8A] text-white hover:bg-blue-900")}>
                             {isGradeSaved ? "Saved" : "Overwrite"}
                          </button>
                        </td>
                      </tr>
                      {Array.from({ length: 3 }).map((_, i) => {
                        const names = ['Omar Hassan', 'Sara Mahmoud', 'Ali Ibrahim', 'Nourhan Ahmed', 'Khaled Mostafa', 'Youssef Kamal', 'Aya Tarek', 'Laila Samir', 'Kareem Nabil', 'Dina Fawzy'];
                        const grades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D'];
                        const isFail = i === 0; // Force one fail for demonstration
                        const grade = isFail ? 'F' : grades[Math.floor(Math.random() * grades.length)];
                        return (
                          <tr key={i} className={cn("transition-colors", isFail ? "hover:bg-red-50/30" : "hover:bg-slate-50")}>
                            <td className="px-6 py-4 font-mono text-slate-500">2026{Math.floor(Math.random() * 9000) + 1000}</td>
                            <td className="px-6 py-4 font-bold text-slate-700">{names[Math.floor(Math.random() * names.length)]}</td>
                            <td className="px-6 py-4">{Math.floor(Math.random() * 20) + 30}/50</td>
                            <td className={cn("px-6 py-4 font-extrabold flex items-center gap-2", grade === 'F' ? 'text-red-600' : 'text-slate-700')}>
                              {grade} 
                              {grade === 'F' && <span className="text-xs font-normal bg-red-100 text-red-700 px-2 rounded-full hidden sm:block">Failed</span>}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-[#1E3A8A] font-bold hover:underline bg-blue-50 px-3 py-1 rounded">Edit Output</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs text-slate-500 text-center font-medium">Clicking "Edit Output" allows unauthorized overwriting of historical database records.</div>
                </div>
             </motion.div>
           )}

           {target.type === 'pii' && (
             <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y:0, opacity: 1 }} className="space-y-8 max-w-4xl mx-auto">
                <div className="flex items-center gap-4 text-red-600 mb-2 border-b border-red-100 pb-6 bg-red-50/50 p-6 rounded-2xl">
                  <div className="p-4 bg-red-100 rounded-2xl"><Users className="w-8 h-8" /></div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight text-red-700">Student PII Exposure</h3>
                    <p className="text-slate-700 mt-2 font-medium">The Student Affairs role holds the keys to the kingdom regarding Personally Identifiable Information (PII). An attacker can easily export the entire registry.</p>
                  </div>
                </div>
                
                <div className="bg-amber-50 border-2 border-amber-200 p-8 rounded-2xl flex flex-col md:flex-row items-center gap-8 mt-8 shadow-xl">
                   <div className="bg-amber-100 p-4 rounded-full shrink-0">
                     <AlertTriangle className="w-10 h-10 text-amber-600" />
                   </div>
                   <div className="flex-1 w-full relative">
                     <h4 className="text-xl font-bold text-amber-900 tracking-tight">Mass Data Exfiltration Risk</h4>
                     <p className="text-amber-800 text-sm mt-2 mb-6 leading-relaxed">The attacker has access to a completely unfiltered endpoint returning National IDs, Physical Addresses, Phone Numbers, and Emergency Contacts. This data can be instantly sold on the dark web or used for targeted tuition phishing campaigns against students.</p>
                     <PostExploitationActions />
                   </div>
                </div>
             </motion.div>
           )}

           {target.type === 'finance' && (
             <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y:0, opacity: 1 }} className="space-y-8 max-w-4xl mx-auto">
                <div className="flex items-center gap-4 text-red-600 mb-2 border-b border-red-100 pb-6 bg-red-50/50 p-6 rounded-2xl">
                  <div className="p-4 bg-red-100 rounded-2xl"><DollarSign className="w-8 h-8" /></div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight text-red-700">Financial Administration Subversion</h3>
                    <p className="text-slate-700 mt-2 font-medium">Administrative Finance accounts can modify tuition balances, remove financial holds blockading graduation, and intercept scholarship funds.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-white border-2 border-slate-200 p-8 rounded-2xl shadow-xl flex flex-col">
                    <h5 className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2 flex items-center gap-2"><Database className="w-3 h-3"/> Pending Tuition Receipts</h5>
                    <div className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tighter">EGP 1,240,500</div>
                    <div className="mt-auto space-y-3">
                      <p className="text-xs text-slate-500 mb-4 bg-slate-50 p-3 rounded text-center">Attacker can intercept transaction routing or mark fraudulent payments as cleared.</p>
                      <button className="w-full bg-[#11111a] hover:bg-black text-white py-3.5 rounded-xl text-sm font-bold shadow-lg transition-colors">Approve Bulk Payments</button>
                    </div>
                  </div>
                  <div className="bg-white border-2 border-slate-200 p-8 rounded-2xl shadow-xl flex flex-col">
                     <h5 className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-6 flex items-center gap-2"><ShieldAlert className="w-3 h-3"/> Active Financial Holds</h5>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase tracking-widest">Locked</span> 
                            <span className="font-bold text-slate-700">Student #29019</span>
                          </div>
                          <button className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100">Bypass Hold</button>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase tracking-widest">Locked</span> 
                            <span className="font-bold text-slate-700">Student #29104</span>
                          </div>
                          <button className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100">Bypass Hold</button>
                        </div>
                     </div>
                  </div>
                </div>
             </motion.div>
           )}
           </AnimatePresence>
           )}

        </div>
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------
// Stage 4: Remediation
// -----------------------------------------------------
function RemediationStage({ onComplete }: { onComplete: () => void, key?: React.Key }) {
  const [patching, setPatching] = useState(true);
  const [code, setCode] = useState("// legacy_auth_controller.js\n// Security Flaw: SQL Injection Vulnerability\nconst query = `SELECT * FROM users WHERE username = '${input.user}' AND password = '${input.pass}'`;\n\n// Execute vulnerable query\nconst user = db.execute(query);\nif (user) {\n  grantAccess(user.id);\n}");
  const [patchApplied, setPatchApplied] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPatching(false), 2500);
    return () => clearTimeout(t);
  }, []);

  const handleDeploy = () => {
    const lowerCode = code.toLowerCase();
    // Very simple check: make sure they use prepared statements / parameterized queries
    if ((code.includes('?') || lowerCode.includes('prepare') || lowerCode.includes('bind')) && !code.includes("`SELECT * FROM users WHERE username = '${input.user}'")) {
      setPatchApplied(true);
      AudioService.playSuccess();
    } else {
      alert('Incorrect patch. You must rewrite the query to use Prepared Statements (e.g. using ? placeholders) to prevent SQL Injection.');
      AudioService.playAlert();
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 h-full flex flex-col items-center justify-center relative max-w-5xl mx-auto w-full">
       <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #22c55e 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>
       
       <div className="bg-[#0f0f17] p-8 md:p-12 rounded-3xl border border-green-500/30 shadow-[0_30px_60px_rgba(34,197,94,0.15)] max-w-4xl text-center relative z-10 w-full overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600"></div>
         
         <AnimatePresence mode="wait">
         {patching ? (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-12 px-4">
               <Loader2 className="w-16 h-16 text-emerald-500 animate-[spin_2s_linear_infinite] mb-6" />
               <h3 className="text-2xl font-bold text-white mb-3 animate-pulse">Initializing Patching Bay...</h3>
               <p className="text-slate-400 font-mono text-sm max-w-md mx-auto line-clamp-2 leading-relaxed">
                 Loading source control... connecting to mis.bsu.edu.eg repository...
               </p>
            </motion.div>
         ) : !patchApplied ? (
            <motion.div key="interactive" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-left w-full">
               <h2 className="text-2xl font-extrabold text-white mb-2">Interactive Code Remediation</h2>
               <p className="text-slate-400 mb-6 text-sm">Rewrite the vulnerable authentication block using Prepared Statements to prevent SQL Injection.</p>
               
               <div className="bg-[#050508] p-1 rounded-xl border border-red-500/30 mb-8 relative drop-shadow-xl text-left">
                 <div className="absolute top-0 right-0 bg-red-500/20 text-red-500 text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">Live Code Editor</div>
                 <Editor
                    value={code}
                    onValueChange={code => setCode(code)}
                    highlight={code => Prism.highlight(code, Prism.languages.javascript, 'javascript')}
                    padding={20}
                    style={{
                      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                      fontSize: 14,
                      backgroundColor: '#151521',
                      borderRadius: '0.75rem',
                      minHeight: '200px',
                      color: '#f8fafc'
                    }}
                    className="focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
               </div>

               <button 
                  onClick={handleDeploy}
                  className="w-full bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-xl font-bold px-10 py-4 shadow-xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-3"
                >
                  Deploy Selected Patch to Production <ArrowRight className="w-4 h-4"/>
               </button>
            </motion.div>
         ) : (
            <motion.div key="content" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                 <div className="absolute inset-0 border-2 border-green-500/20 rounded-full animate-ping"></div>
                 <ShieldAlert className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Remediation Architecture Applied</h2>
         <p className="text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">The vulnerability has been successfully remediated. You have systematically eliminated the SQL Injection attack vector by implementing Parameterized Queries.</p>
         
              <button onClick={onComplete} className="bg-slate-100 text-slate-900 rounded-xl font-bold px-10 py-4 shadow-xl hover:bg-white transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mx-auto mt-10">
                 Complete Simulation & Exit Laboratory <ArrowRight className="w-4 h-4"/>
              </button>
            </motion.div>
         )}
         </AnimatePresence>
       </div>
    </motion.div>
  );
}

function PostExploitationActions() {
  const [action, setAction] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (exporting && progress < 100) {
      const t = setTimeout(() => {
        setProgress(p => Math.min(p + (Math.random() * 15 + 5), 100));
      }, 500);
      return () => clearTimeout(t);
    }
  }, [exporting, progress]);

  if (action === 'export' && exporting) {
    return (
      <div className="w-full bg-white p-4 rounded-xl border border-red-200 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-center mb-3">
          <span className="text-red-700 font-bold text-sm tracking-widest uppercase flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> EXFILTRATING PII...</span>
          <span className="text-red-600 font-mono text-sm">{Math.floor(progress)}%</span>
        </div>
        <div className="w-full bg-red-100 h-2 rounded-full overflow-hidden">
          <motion.div initial={{ width: "0%" }} animate={{ width: `${progress}%` }} className="bg-red-500 h-full" />
        </div>
        {progress >= 100 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-red-50 text-red-800 text-xs font-mono font-bold border-l-4 border-red-600">
            [SUCCESS] 14.2 GB data package stored externally. 
          </motion.div>
        )}
      </div>
    );
  }

  if (action === 'ransomware') {
     return (
       <div className="w-full bg-slate-900 border border-slate-700 p-6 rounded-xl">
         <h3 className="text-red-500 font-bold text-lg mb-2 flex items-center gap-2"><Lock className="w-5 h-5"/> Data Encrypted</h3>
         <p className="text-slate-300 text-sm mb-4 leading-relaxed">Student records database has been successfully encrypted with AES-256. A ransom note has been distributed across the university network demanding 15 BTC.</p>
         <button onClick={() => setAction(null)} className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded hover:bg-slate-700 font-bold">Cancel Action</button>
       </div>
     );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-amber-900 uppercase tracking-widest border-b border-amber-200 pb-2">Select Malicious Action</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button onClick={() => { setAction('export'); setExporting(true); }} className="bg-white border-2 border-red-100 hover:border-red-500 hover:bg-red-50 text-slate-800 px-4 py-4 rounded-xl font-bold shadow-sm transition-all flex flex-col items-start gap-1 w-full text-left">
          <span className="flex items-center gap-2 text-red-600"><Database className="w-4 h-4"/> Exfiltrate Database</span>
          <span className="text-xs text-slate-500 font-medium">Export 45,210 Student Records (JSON/CSV) to a remote server.</span>
        </button>
        <button onClick={() => setAction('ransomware')} className="bg-white border-2 border-slate-200 hover:border-slate-800 hover:bg-slate-50 text-slate-800 px-4 py-4 rounded-xl font-bold shadow-sm transition-all flex flex-col items-start gap-1 w-full text-left">
          <span className="flex items-center gap-2 text-slate-800"><Lock className="w-4 h-4"/> Deploy Ransomware</span>
          <span className="text-xs text-slate-500 font-medium">Encrypt the PII registry and display an extortion demand.</span>
        </button>
      </div>
    </div>
  );
}
