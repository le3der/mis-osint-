import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/LanguageContext';

export function AdvisoryReport({ onExit }: { onExit: () => void }) {
  const { isRtl, t } = useLanguage();

  useEffect(() => {
    // Trigger fade-up animations
    const elements = document.querySelectorAll('.fade-up');
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('in');
      }, index * 100);
    });
  }, []);

  return (
    <div className={cn("advisory-root w-full h-full text-left", isRtl ? "" : "ltr")} dir="ltr">
      <div id="sidebar">
        <div className="sb-top">
          <button onClick={onExit} className="mb-4 text-slate-400 hover:text-white flex items-center gap-2 text-xs font-mono transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="sb-id">BSU-SEC-2023-001</div>
          <div className="sb-name">Banner System <br/> Vulnerability Report</div>
          <div className="sb-badges">
            <span className="sb-badge conf">CRITICAL</span>
            <span className="sb-badge disc">DISCLOSED</span>
          </div>
        </div>
        <div className="sb-body pt-4">
          <div className="sb-group">
            <div className="sb-group-title">Executive Summary</div>
            <a className="nav-a on">
              <span className="nav-text">Overview</span>
            </a>
            <a className="nav-a">
              <span className="nav-text">Impact Matrix</span>
            </a>
          </div>
          <div className="sb-group">
            <div className="sb-group-title">Findings</div>
            <a className="nav-a">
              <span className="nav-text">Local File Inclusion (LFI)</span>
              <span className="sev sev-c">C</span>
            </a>
            <a className="nav-a">
              <span className="nav-text">Stored XSS</span>
              <span className="sev sev-h">H</span>
            </a>
            <a className="nav-a">
              <span className="nav-text">Misconfiguration</span>
              <span className="sev sev-m">M</span>
            </a>
          </div>
          <div className="sb-group">
            <div className="sb-group-title">Remediation</div>
            <a className="nav-a">
              <span className="nav-text">Fix Steps</span>
            </a>
            <a className="nav-a">
              <span className="nav-text">Roadmap</span>
            </a>
          </div>
        </div>
      </div>

      <div id="topbar">
        <div className="tb-dot"></div>
        <div className="tb-title">LIVE ASSESSMENT</div>
        <div className="tb-sep"></div>
        <div className="tb-tag red">TLP:RED</div>
        <div className="tb-tag amber">STRICTLY CONFIDENTIAL</div>
        <div className="progress" style={{ width: '45%' }}></div>
      </div>

      <div id="main" className="overflow-y-auto h-screen pb-20 custom-scrollbar">
        <div id="hero">
          <div className="hero-grid"></div>
          <div className="relative z-10 fade-up">
            <div className="advisory-id">BSU-SEC-2023-001</div>
            <h1 className="hero-title">
              BANNER SYSTEM <span className="red">LFI</span> & <span className="blue">RCE</span> CHAIN
            </h1>
            <p className="hero-sub">
              This advisory details a critical vulnerability chain discovered in the University's Banner grading system, allowing unauthenticated attackers to read arbitrary files and achieve remote code execution.
            </p>

            <div className="meta-grid">
              <div className="meta-cell">
                <div className="lbl">CVSS v3.1</div>
                <div className="val red">9.8 CRITICAL</div>
              </div>
              <div className="meta-cell">
                <div className="lbl">AFFECTED</div>
                <div className="val cyan">Banner v9.x</div>
              </div>
              <div className="meta-cell">
                <div className="lbl">CWE</div>
                <div className="val purple">CWE-22, CWE-79</div>
              </div>
              <div className="meta-cell">
                <div className="lbl">DATE</div>
                <div className="val">2023-10-25</div>
              </div>
            </div>

            <div className="score-row">
              <div className="score-box c">
                <div className="n">1</div>
                <div className="l">CRITICAL</div>
              </div>
              <div className="score-box h">
                <div className="n">2</div>
                <div className="l">HIGH</div>
              </div>
              <div className="score-box m">
                <div className="n">4</div>
                <div className="l">MEDIUM</div>
              </div>
            </div>
          </div>
        </div>

        <div className="sec fade-up">
          <div className="sec-label red">01 / VULNERABILITY DETAILS</div>
          <h2 className="sec-title">Local File Inclusion (LFI)</h2>
          <p className="mb-6 text-slate-400 leading-relaxed max-w-4xl">
            The banner system is vulnerable to Local File Inclusion due to improper sanitization of the `template` parameter in the `report_gen.php` endpoint. An attacker can use directory traversal payloads to read sensitive files on the server.
          </p>

          <div className="card danger mb-8">
            <h3 className="sub-title flex items-center gap-2"><span className="text-red-400">⚠️</span> Critical Impact</h3>
            <p className="text-slate-400 text-sm">
              Exploiting this LFI allows reading configuration files containing database credentials, API keys, and sensitive student records.
            </p>
          </div>

          <h3 className="sub-title">Proof of Concept</h3>
          <div className="code-wrap">
            <div className="code-bar">
              <div className="code-dots"><span className="d1"></span><span className="d2"></span><span className="d3"></span></div>
              <div className="code-file">payload.txt</div>
              <button className="code-copy">Copy</button>
            </div>
            <div className="code-body">
              <pre>
<span className="t-c"># Directory traversal to read /etc/passwd</span>
<span className="t-k">GET</span> <span className="t-u">/grades/report_gen.php?template=../../../../../../etc/passwd</span> HTTP/1.1
<span className="t-n">Host:</span> <span className="t-s">banner.bsu.edu.eg</span>
              </pre>
            </div>
          </div>

          <div className="terminal">
            <div className="term-bar">
              <div className="term-pulse"></div>
              <div className="term-title">TTY: /bin/bash</div>
            </div>
            <div className="term-body">
              <span className="term-prompt">attacker@kali:~$</span> <span className="term-cmd">curl -s "https://banner.bsu.edu.eg/grades/report_gen.php?template=../../../../../../etc/passwd" | head -n 5</span>
              <br/>
              <span className="term-resp">root:x:0:0:root:/root:/bin/bash</span><br/>
              <span className="term-resp">daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin</span><br/>
              <span className="term-resp">bin:x:2:2:bin:/bin:/usr/sbin/nologin</span>
              <br/>
              <span className="term-err">[+] Vulnerability Confirmed. LFI successful.</span>
            </div>
          </div>
        </div>

        <div className="sec fade-up">
          <div className="sec-label blue">02 / KILL CHAIN SEQUENCE</div>
          <h2 className="sec-title">Attack Path</h2>
          
          <div className="chain mt-8">
            <div className="chain-step">
              <div className="chain-n scout">01</div>
              <div className="chain-content">
                <h4>Reconnaissance</h4>
                <p>Attacker identifies the `report_gen.php` endpoint taking a `template` parameter.</p>
                <span className="chain-tag">T1595 - Active Scanning</span>
              </div>
            </div>
            <div className="chain-step">
              <div className="chain-n xploit">02</div>
              <div className="chain-content">
                <h4>Initial Access (LFI)</h4>
                <p>Attacker exploits Local File Inclusion to read `config.local.php`.</p>
                <span className="chain-tag">T1190 - Exploit Public-Facing Application</span>
              </div>
            </div>
            <div className="chain-step">
              <div className="chain-n own">03</div>
              <div className="chain-content">
                <h4 className="text-red-400">Privilege Escalation & Impact</h4>
                <p>Database credentials extracted from config allow the attacker full access to the grading database.</p>
                <span className="chain-tag">T1078 - Valid Accounts</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sec fade-up">
           <div className="sec-label green">03 / REMEDIATION</div>
           <h2 className="sec-title">Fix Steps & Roadmap</h2>

           <div className="my-8">
             <div className="fix-step">
               <div className="fix-n r">1</div>
               <div className="fix-content">
                 <h4>Input Sanitization</h4>
                 <p>Implement strict allowlisting for the `template` parameter. Do not allow `../` traversal characters.</p>
               </div>
             </div>
             <div className="fix-step">
               <div className="fix-n b">2</div>
               <div className="fix-content">
                 <h4>Web Application Firewall (WAF)</h4>
                 <p>Deploy WAF rules to block common LFI and Directory Traversal payloads.</p>
               </div>
             </div>
             <div className="fix-step">
               <div className="fix-n g">3</div>
               <div className="fix-content">
                 <h4>Rotate Credentials</h4>
                 <p>Immediately rotate all database passwords, API keys, and secret tokens in configuration files.</p>
               </div>
             </div>
           </div>

           <div className="rm-list mt-8">
             <div className="rm-row c">
               <div className="rm-when">
                 <span className="w">IMMEDIATE</span>
                 <span className="p">24 HRS</span>
               </div>
               <div className="rm-info">
                 <h4>Patch LFI Endpoint</h4>
                 <p>Deploy the hotfix to sanitize the report_gen.php template parameter.</p>
               </div>
             </div>
             <div className="rm-row h">
               <div className="rm-when">
                 <span className="w">SHORT-TERM</span>
                 <span className="p">7 DAYS</span>
               </div>
               <div className="rm-info">
                 <h4>WAF Configuration</h4>
                 <p>Enable rigorous OWASP Core Rule Set on the perimeter WAF.</p>
               </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
