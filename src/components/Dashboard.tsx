import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import { 
  Server, AlertTriangle, Users, Database, Crosshair, Fingerprint, Lock, Shield,
  ShieldAlert, FileText, ExternalLink, TerminalSquare, Activity, Trophy, Clock, ArrowRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { AudioService } from '../lib/audio';
import { getTopScores, ScoreEntry } from '../lib/firebase';
import { cn } from '../lib/utils';

export function Dashboard({ setView }: { setView: (v: 'landing' | 'report' | 'simulation') => void }) {
  const { t, isRtl } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'soc' | 'leaderboard'>('overview');
  const [leaderboardData, setLeaderboardData] = useState<ScoreEntry[]>([]);
  const [loadingScores, setLoadingScores] = useState(false);

  useEffect(() => {
    if (activeTab === 'soc') {
      AudioService.playAlert();
    } else if (activeTab === 'leaderboard') {
      setLoadingScores(true);
      getTopScores().then(data => {
         setLeaderboardData(data);
         setLoadingScores(false);
      });
    }
  }, [activeTab]);

  const chartData = [
    { time: '00:00', attempts: 5 },
    { time: '04:00', attempts: 12 },
    { time: '08:00', attempts: 8 },
    { time: '12:00', attempts: 45 },
    { time: '16:00', attempts: 130 },
    { time: '20:00', attempts: 180 },
    { time: '24:00', attempts: 210 },
  ];

  const radarData = [
    { subject: 'Confidentiality', A: 20, fullMark: 100 },
    { subject: 'Integrity', A: 40, fullMark: 100 },
    { subject: 'Availability', A: 90, fullMark: 100 },
    { subject: 'Authentication', A: 10, fullMark: 100 },
    { subject: 'Authorization', A: 30, fullMark: 100 },
    { subject: 'Audit/Logs', A: 50, fullMark: 100 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#030509] text-slate-300 font-sans p-4 md:p-6 lg:p-10 relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Immersive Animated Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 2px, transparent 2px)', backgroundSize: '32px 32px' }}></div>
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }} 
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className={cn("absolute top-[-20%] w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none", isRtl ? "left-[-10%]" : "right-[-10%]")}
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }} 
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className={cn("absolute bottom-[-20%] w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none", isRtl ? "right-[-10%]" : "left-[-10%]")}
      />

      <div className="max-w-[90rem] mx-auto z-10 relative space-y-8 flex flex-col h-full min-h-[calc(100vh-80px)]">
        
        {/* Header Ribbon - Premium Glassmorphism */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-[#0a0f16]/60 backdrop-blur-2xl border border-white/[0.05] p-5 md:p-6 rounded-3xl shadow-2xl shadow-black/50"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/5 border border-indigo-500/30 flex items-center justify-center relative shadow-[0_0_30px_rgba(99,102,241,0.15)]">
              <ShieldAlert className="w-7 h-7 text-indigo-400 relative z-10" />
              <div className="absolute inset-0 bg-indigo-400/20 rounded-2xl animate-ping opacity-30 duration-1000"></div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3 font-display">
                {t('dashboard_title')}
                <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-2.5 py-0.5 rounded-md text-[10px] md:text-xs uppercase font-black tracking-widest animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]">{t('live')}</span>
              </h1>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase mt-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {t('monitoring_active')}
              </div>
            </div>
          </div>
          <div className="flex bg-[#05080f]/80 p-1.5 rounded-2xl border border-white/[0.05] shadow-inner relative z-20 overflow-x-auto no-scrollbar">
            {['overview', 'soc', 'leaderboard'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "relative px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 z-10 whitespace-nowrap flex items-center gap-2",
                  activeTab === tab ? "text-white" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                )}
              >
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTabBadge" 
                    className={cn(
                      "absolute inset-0 rounded-xl shadow-lg -z-10",
                      tab === 'overview' ? "bg-indigo-600" : 
                      tab === 'soc' ? "bg-red-600" : "bg-amber-600"
                    )}
                  />
                )}
                {tab === 'overview' && t('strategic_overview')}
                {tab === 'soc' && t('soc_view')}
                {tab === 'leaderboard' && <><Trophy className={cn("w-4 h-4", activeTab !== tab && "text-amber-500/70")}/> Leaderboard</>}
              </button>
            ))}
          </div>
        </motion.header>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div key="overview" variants={containerVariants} initial="hidden" animate="show" exit="hidden" className="flex-1 flex flex-col gap-6 md:gap-8">
              {/* Top Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <MetricCard title={t('overall_risk')} value={t('critical')} alert={true} icon={<AlertTriangle className="w-5 h-5"/>} />
                <MetricCard title={t('exposed_records')} value="~45,210" icon={<Users className="w-5 h-5"/>} />
                <MetricCard title={t('vuln_type')} value="KBA Bypass" icon={<KeyRoundIcon />} />
                <MetricCard title={t('target_node')} value="misc.bsu.edu.eg" icon={<Server className="w-5 h-5"/>} />
              </div>

              {/* Main Content Split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 flex-1">
                
                {/* Main Action Panels */}
                <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 flex-1">
                    {/* Executive Report Panel */}
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="group cursor-pointer bg-[#0c121c]/80 backdrop-blur-xl border border-white/[0.05] hover:border-indigo-500/50 rounded-3xl p-8 transition-all duration-500 relative flex flex-col h-full shadow-2xl overflow-hidden"
                      onClick={() => setView('report')}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 transition-all duration-700 pointer-events-none transform origin-top-right">
                         <FileText className="w-40 h-40 text-indigo-400" />
                      </div>
                      
                      <div className="flex justify-between items-start mb-10 relative z-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-indigo-600/5 border border-indigo-500/30 text-indigo-400 rounded-2xl flex items-center justify-center transition-all shadow-[0_0_20px_rgba(99,102,241,0.1)] group-hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                          <FileText className="w-8 h-8" />
                        </div>
                        <span className="font-mono text-[10px] sm:text-xs text-indigo-300 font-bold uppercase tracking-[0.2em] border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 rounded-full backdrop-blur-md">{t('exec_brief')}</span>
                      </div>
                      <div className="mt-auto relative z-10">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 font-display group-hover:text-indigo-100 transition-colors">{t('assessment_report')}</h2>
                        <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8 group-hover:text-slate-300 transition-colors">
                          {t('assessment_desc')}
                        </p>
                        <div className="flex items-center text-indigo-400 font-bold text-sm uppercase tracking-wider gap-3 group-hover:gap-5 transition-all">
                          <span>{t('access_doc')}</span>
                          <span className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20">
                             <ArrowRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Interactive Simulation Panel */}
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="group cursor-pointer bg-[#0c121c]/80 backdrop-blur-xl border border-white/[0.05] hover:border-red-500/50 rounded-3xl p-8 transition-all duration-500 relative flex flex-col h-full shadow-2xl overflow-hidden"
                      onClick={() => setView('simulation')}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 transition-all duration-700 pointer-events-none transform origin-top-right">
                         <Crosshair className="w-40 h-40 text-red-500" />
                      </div>

                      <div className="flex justify-between items-start mb-10 relative z-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-red-600/5 border border-red-500/30 text-red-500 rounded-2xl flex items-center justify-center transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)] group-hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                          <TerminalSquare className="w-8 h-8" />
                        </div>
                        <span className="font-mono text-[10px] sm:text-xs text-red-400 font-bold uppercase tracking-[0.2em] border border-red-500/20 bg-red-500/10 px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span> {t('live_range')}
                        </span>
                      </div>
                      <div className="mt-auto relative z-10">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 font-display group-hover:text-red-100 transition-colors">{t('attack_simulation')}</h2>
                        <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8 group-hover:text-slate-300 transition-colors">
                          {t('attack_sim_desc')}
                        </p>
                        <div className="flex items-center text-red-400 font-bold text-sm uppercase tracking-wider gap-3 group-hover:gap-5 transition-all">
                          <span>{t('init_matrix')}</span>
                          <span className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20">
                             <ArrowRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Threat Radar Panel */}
                  <motion.div variants={itemVariants} className="bg-[#0c121c]/80 backdrop-blur-xl border border-white/[0.05] hover:border-white/10 transition-colors rounded-3xl p-6 md:p-10 flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-center shadow-2xl">
                    <div className="flex flex-col justify-center">
                        <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-3 font-display">
                          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20"><Activity className="w-5 h-5"/></div>
                          {t('security_radar')}
                        </h3>
                        <p className="text-sm text-slate-400 mb-8 leading-relaxed max-w-sm">{t('radar_desc')}</p>
                        
                        <div className="space-y-6">
                           <div>
                             <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2">
                                <span className="text-slate-300 flex items-center gap-2"><Lock className="w-4 h-4 text-red-500" /> {t('auth')}</span>
                                <span className="text-red-500 font-mono">10% / 100%</span>
                             </div>
                             <div className="w-full bg-slate-800/50 h-2.5 rounded-full overflow-hidden border border-white/[0.05]">
                               <motion.div initial={{ width: 0 }} animate={{ width: "10%" }} transition={{ duration: 1, ease: "easeOut" }} className="bg-gradient-to-r from-red-600 to-red-400 w-[10%] h-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></motion.div>
                             </div>
                           </div>
                           
                           <div>
                             <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2">
                                <span className="text-slate-300 flex items-center gap-2"><Fingerprint className="w-4 h-4 text-orange-500" /> {t('confidentiality')}</span>
                                <span className="text-orange-500 font-mono">20% / 100%</span>
                             </div>
                             <div className="w-full bg-slate-800/50 h-2.5 rounded-full overflow-hidden border border-white/[0.05]">
                               <motion.div initial={{ width: 0 }} animate={{ width: "20%" }} transition={{ duration: 1, ease: "easeOut", delay: 0.2 }} className="bg-gradient-to-r from-orange-600 to-orange-400 w-[20%] h-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"></motion.div>
                             </div>
                           </div>
                        </div>
                    </div>
                    <div className="h-[280px] w-full flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                          <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-display)' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="Score" dataKey="A" stroke="#ef4444" strokeWidth={2} fill="url(#radarGradient)" fillOpacity={1} isAnimationActive={true} />
                          <defs>
                            <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6}/>
                              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                </div>

                {/* Right Info Panel */}
                <motion.div variants={itemVariants} className="bg-[#0c121c]/80 backdrop-blur-xl border border-white/[0.05] hover:border-indigo-500/30 transition-colors rounded-3xl p-6 md:p-8 flex flex-col h-full shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] -z-10"></div>
                  
                  <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3 font-display">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20"><Database className="w-5 h-5" /></div>
                    {t('intel_title')}
                  </h3>
                  
                  <div className="space-y-6 flex-1">
                    <ThreatItem 
                      title="Knowledge-Based Auth Bypass" 
                      severity="High" 
                      desc="Improper validation in DOB recovery flow allows full account takeover."
                      tags={['CWE-287', 'CVSS: 8.5']}
                    />
                    <ThreatItem 
                      title="Privelege Escalation" 
                      severity="Critical" 
                      desc="Compromising an admin account grants access to holistic student records."
                      tags={['CWE-269']}
                    />
                    <ThreatItem 
                      title="Data Exposure" 
                      severity="Medium" 
                      desc="Leaked email formats and structural metadata on public boards."
                      tags={['OSINT']}
                    />
                  </div>

                  <div className="mt-8 p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl relative overflow-hidden group">
                     <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                     <p className="text-sm text-indigo-200 leading-relaxed relative z-10 font-medium">
                       <span className="font-bold text-indigo-400 block mb-1 uppercase tracking-wider text-xs">{t('note')}</span> 
                       {t('note_desc')}
                     </p>
                  </div>
                </motion.div>

              </div>
            </motion.div>
          ) : activeTab === 'soc' ? (
            <motion.div key="soc" variants={containerVariants} initial="hidden" animate="show" exit="hidden" className="flex-1 bg-[#0a0f16]/90 backdrop-blur-xl border border-white/[0.05] shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-white/5 pb-6">
                 <div>
                   <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3 font-display">
                     <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                       <Shield className="w-6 h-6" />
                     </div>
                     {t('soc_title')}
                   </h2>
                   <p className="text-slate-400 mt-2 text-sm">{t('soc_desc')}</p>
                 </div>
                 <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 text-emerald-400 rounded-full border border-emerald-500/20">
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
                   <span className="font-mono text-xs font-bold uppercase tracking-widest">{t('soc_ids')}</span>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
                 <motion.div variants={itemVariants} className="lg:col-span-2 flex flex-col h-full bg-[#030509]/80 border border-white/5 rounded-2xl p-6 shadow-inner relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] -z-10"></div>
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                       <Activity className="w-4 h-4 text-emerald-500"/> {t('soc_live')}
                    </h3>
                    <div className="flex-1 font-mono text-[11px] sm:text-xs overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                       <SocLog time="23:41:02" level="WARN" msg="Multiple failed login attempts from IP 192.168.1.45 targeting user: ahmed.ali@mis.bsu.edu.eg" />
                       <SocLog time="23:42:15" level="CRIT" msg="Unusual volume of password reset requests detected on endpoint /api/auth/recover" />
                       <SocLog time="23:43:08" level="ALERT" msg="Possible enumeration attack. 50+ sequential requests to user profile imagery." />
                       <SocLog time="23:45:12" level="WARN" msg="Successful authentication for admin account from novel User-Agent/IP combination." />
                       <SocLog time="23:48:55" level="CRIT" msg="DATA EXFILTRATION WARNING: Mass data download (14GB) initiated by admin session." />
                       <SocLog time="23:51:00" level="INFO" msg="System baseline normalized. Initiating automated honey-token deployment." />
                     </div>
                 </motion.div>

                 <div className="flex flex-col gap-8 h-full">
                    <motion.div variants={itemVariants} className="bg-[#030509]/80 border border-white/5 rounded-2xl p-6 shadow-inner">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t('soc_traffic')}</h3>
                      </div>
                      <div className="h-[120px] w-full mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorAttemptsAlert" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="time" stroke="#334155" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#334155" fontSize={10} tickLine={false} axisLine={false} />
                            <RechartsTooltip contentStyle={{ backgroundColor: '#0a0f16', borderColor: '#1e293b', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} />
                            <Area type="monotone" dataKey="attempts" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAttemptsAlert)" isAnimationActive={true} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-[#030509]/80 border border-white/5 rounded-2xl p-6 shadow-inner flex-1 flex flex-col">
                       <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 border-b border-white/5 pb-4">{t('soc_blocked')}</h3>
                       <div className="space-y-4 flex-1">
                          <div className="flex items-center justify-between text-sm group">
                            <span className="text-slate-400 group-hover:text-emerald-400 transition-colors">SQL Injection</span>
                            <span className="text-emerald-500 font-mono font-bold bg-emerald-500/10 px-2.5 py-1 rounded-md">1,204</span>
                          </div>
                          <div className="flex items-center justify-between text-sm group">
                            <span className="text-slate-400 group-hover:text-emerald-400 transition-colors">XSS Payloads</span>
                            <span className="text-emerald-500 font-mono font-bold bg-emerald-500/10 px-2.5 py-1 rounded-md">842</span>
                          </div>
                          <div className="flex items-center justify-between text-sm group">
                            <span className="text-slate-400 group-hover:text-emerald-400 transition-colors">DDoS / Botnet</span>
                            <span className="text-emerald-500 font-mono font-bold bg-emerald-500/10 px-2.5 py-1 rounded-md">5,000+</span>
                          </div>
                       </div>
                    </motion.div>
                 </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="leaderboard" variants={containerVariants} initial="hidden" animate="show" exit="hidden" className="flex-1 bg-[#0a0f16]/90 backdrop-blur-xl border border-amber-500/20 shadow-2xl shadow-amber-500/5 rounded-3xl p-6 md:p-10 flex flex-col">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                <div>
                   <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3 font-display">
                     <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/30 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]"><Trophy className="w-7 h-7" /></div>
                     CyberLab Hall of Fame
                   </h2>
                   <p className="text-slate-400 mt-3 text-sm">Top ranked cyber defenders who have successfully patched the vulnerabilities.</p>
                </div>
              </div>

              {loadingScores ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full border-4 border-slate-700/50 border-t-amber-500 animate-spin shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
                </div>
              ) : (
                <motion.div variants={itemVariants} className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <div className="bg-[#030509]/80 border border-white/5 rounded-2xl overflow-hidden shadow-inner">
                    <table className="w-full text-left border-collapse">
                      <thead className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-500 font-bold bg-white/[0.02]">
                        <tr>
                          <th className="py-4 px-6 w-20 text-center font-display border-b border-white/5">Rank</th>
                          <th className="py-4 px-6 font-display border-b border-white/5">Defender Name</th>
                          <th className="py-4 px-6 text-center font-display border-b border-white/5">Score</th>
                          <th className="py-4 px-6 text-center font-display border-b border-white/5">Grade</th>
                          <th className="py-4 px-6 text-right font-display border-b border-white/5">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono text-sm">
                        {leaderboardData.length === 0 ? (
                          <tr><td colSpan={5} className="py-12 text-center text-slate-500 italic">No defenders have cleared the simulation yet.</td></tr>
                        ) : (
                          leaderboardData.map((entry, idx) => (
                            <tr key={entry.id || idx} className="hover:bg-amber-500/5 hover:shadow-inner transition-colors group">
                              <td className="py-5 px-6 text-center">
                                {idx === 0 ? <span className="text-2xl drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]">🥇</span> : 
                                 idx === 1 ? <span className="text-2xl drop-shadow-[0_0_10px_rgba(156,163,175,0.8)]">🥈</span> : 
                                 idx === 2 ? <span className="text-2xl drop-shadow-[0_0_10px_rgba(180,83,9,0.8)]">🥉</span> : 
                                 <span className="text-slate-500 font-bold text-lg group-hover:text-amber-500/50 transition-colors">#{idx + 1}</span>}
                              </td>
                              <td className="py-5 px-6 font-sans font-bold text-slate-200 group-hover:text-amber-400 transition-colors text-base">{entry.name}</td>
                              <td className="py-5 px-6 text-center text-amber-400 font-black text-lg">{entry.score}</td>
                              <td className="py-5 px-6 text-center">
                                 <span className={`px-3 py-1 rounded-md font-black text-xs ${entry.grade.startsWith('A') || entry.grade === 'S' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>{entry.grade}</span>
                              </td>
                              <td className="py-5 px-6 text-right text-slate-500 flex items-center justify-end gap-2 group-hover:text-amber-100 transition-colors">
                                 <Clock className="w-4 h-4" /> {Math.floor(entry.timeTaken / 60)}m {entry.timeTaken % 60}s
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MetricCard({ title, value, alert, icon }: any) {
  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
      className={cn(
        "bg-[#0c121c]/80 backdrop-blur-xl border rounded-3xl p-6 flex flex-col justify-between group transition-all duration-300 relative overflow-hidden",
        alert ? "border-red-500/30 hover:border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.05)]" : "border-white/[0.05] hover:border-white/10 hover:shadow-2xl hover:bg-[#0f1725]"
      )}
    >
      <div className={cn(
        "absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[40px] -z-10 transition-opacity duration-300",
        alert ? "bg-red-500/20 opacity-100" : "bg-indigo-500/10 opacity-0 group-hover:opacity-100"
      )}></div>
      
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">{title}</p>
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
          alert ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-slate-800/50 text-slate-400 border border-white/5"
        )}>
          {icon}
        </div>
      </div>
      <div className={cn(
        "text-3xl font-black tracking-tight font-display", 
        alert ? "text-red-500" : "text-white group-hover:text-indigo-100 transition-colors"
      )}>
        {value}
      </div>
    </motion.div>
  );
}

function ThreatItem({ title, severity, desc, tags }: any) {
  return (
    <div className="border-l-2 border-slate-700 pl-5 py-2 relative group hover:border-indigo-500 transition-all duration-300">
      <div className="absolute w-3 h-3 bg-slate-800 border-2 border-slate-600 rounded-full -left-[7px] top-2.5 z-10 group-hover:border-indigo-500 group-hover:bg-indigo-400 transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0)] group-hover:shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <h4 className="text-white font-bold text-sm sm:text-base tracking-wide group-hover:text-indigo-100 transition-colors">{title}</h4>
        <span className={cn(
          "text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-md border",
          severity === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
          severity === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
        )}>
          {severity}
        </span>
      </div>
      <p className="text-sm text-slate-400 mb-3 leading-relaxed group-hover:text-slate-300 transition-colors">{desc}</p>
      <div className="flex gap-2 flex-wrap">
        {tags.map((tag: string) => (
          <span key={tag} className="text-[10px] font-mono font-bold text-slate-500 bg-[#05080f]/80 px-2.5 py-1 rounded-md border border-white/5 uppercase tracking-wider">{tag}</span>
        ))}
      </div>
    </div>
  );
}

function SocLog({ time, level, msg }: any) {
  useEffect(() => {
    AudioService.playType();
  }, []);

  let color = 'text-slate-400 bg-slate-800/50 border-slate-700/50';
  if (level === 'CRIT') color = 'text-red-500 font-bold bg-red-500/10 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]';
  if (level === 'WARN') color = 'text-orange-400 bg-orange-500/10 border-orange-500/20';
  if (level === 'ALERT') color = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  if (level === 'INFO') color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 p-3 bg-[#0a0f16]/90 rounded-xl border border-white/5 hover:bg-[#111825] transition-colors relative overflow-hidden group">
       <div className="flex items-center gap-2">
         <span className="text-slate-500 shrink-0 font-bold bg-black/30 px-2 py-0.5 rounded-md text-[10px]">{time}</span>
         <span className={cn("px-2 py-0.5 rounded-md text-[10px] border whitespace-nowrap", color)}>{level}</span>
       </div>
       <span className="text-slate-300 font-medium group-hover:text-white transition-colors">{msg}</span>
    </div>
  );
}

function KeyRoundIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg>
  );
}
