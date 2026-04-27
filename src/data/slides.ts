import {
  ShieldAlert,
  FileText,
  Target,
  Server,
  Eye,
  KeyRound,
  Unlock,
  GitBranch,
  AlertOctagon,
  LineChart,
  Search,
  Lock,
  SmartphoneNfc,
  Activity,
  CheckCircle,
  Database,
  Terminal,
  UserX,
  Building,
  GraduationCap
} from "lucide-react";

export interface SlideData {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  icon: any;
  content: string;
  bullets: string[];
  recommendation?: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
  attackPath?: {
    step: string;
    desc: string;
    danger?: boolean;
  }[];
}

export const slides: SlideData[] = [
  {
    id: 1,
    title: "Vulnerability Assessment & Penetration Test Report",
    subtitle: "Target: Management Information System (mis.bsu.edu.eg)",
    category: "Title Slide",
    icon: ShieldAlert,
    content: "This report documents a critical security vulnerability discovered during an authorized cybersecurity competition targeting the university's domain infrastructure. It details the complete attack chain, from external intelligence gathering to full Account Takeover (ATO) of administrative profiles.",
    bullets: [
      "Target Infrastructure: mis.bsu.edu.eg (University Control System)",
      "Vulnerability Class: Broken Authentication (OWASP A07:2021) & Insecure Password Recovery",
      "Severity Level: CRITICAL (CVSSv3 Score: 9.8)",
      "Impact: Full system compromise, unauthorized grade/tuition modification."
    ],
  },
  {
    id: 2,
    title: "Executive Summary",
    subtitle: "High-Level Overview of the Compromise",
    category: "Overview",
    icon: FileText,
    content: "A critical flaw exists in the authentication recovery mechanism of the MIS portal. Threat actors can leverage historical credential dumps from Telegram and dark web forums to identify valid system usernames. By exploiting weak Knowledge-Based Authentication (KBA) verification questions (e.g., Name, Date of Birth), attackers can bypass authentication entirely, reset the password, and gain unauthorized access to privileged accounts.",
    bullets: [
      "No advanced exploitation or malware was required; the system's own logic was abused.",
      "The vulnerability allows immediate escalation to Professor, Dean, and Admin roles.",
      "Once compromised, an attacker has unrestricted read/write access to the specific college's database.",
      "Immediate remediation is required to prevent widespread data manipulation."
    ]
  },
  {
    id: 3,
    title: "Phase 1: Open-Source Intelligence (OSINT)",
    subtitle: "Reconnaissance and Dark Web Scraping",
    category: "The Attack Chain",
    icon: Search,
    content: "The attack commenced without touching the university's servers. Information gathering focused on public data breaches, Telegram hacker channels, and combo-list forums searching for the `@bsu.edu.eg` domain.",
    bullets: [
      "Querying breach databases (e.g., Dehashed, HaveIBeenPwned) for university emails.",
      "Extracting valid MIS usernames from unstructured Telegram dumps.",
      "Finding: Hundreds of valid system usernames were discovered. While the associated passwords were old or inactive, the usernames themselves remained active in the MIS database."
    ],
    codeSnippet: {
      language: "bash",
      code: `$ grep -ri "@bsu.edu.eg" /data/breaches/telegram_dumps/
> dump_2022.txt: dr.ahmed.cs@bsu.edu.eg:P@ssword123
> dump_2022.txt: student.affairs.eng@bsu.edu.eg:Admin_2020!
> dump_2023.txt: it.admin@bsu.edu.eg:Bsu@2021`
    }
  },
  {
    id: 4,
    title: "Target System Architecture",
    subtitle: "Role-Based Access Control (RBAC) in MIS",
    category: "Architecture",
    icon: Building,
    content: "The MIS system utilizes a multi-tenant architecture divided by individual colleges (Engineering, Computer Science, Medicine, etc.). Access is strictly role-based, meaning the severity of the breach depends on the hijacked username's assigned role.",
    bullets: [
      "Professor Role: Permissions to view rosters, manage coursework, and finalize grades.",
      "Student Affairs Role: Unrestricted access to student PII, enrollment data, and disciplinary records.",
      "Department Head / Dean Role: Faculty oversight, curriculum approval, financial approvals.",
      "University Administration: Global system configuration and tuition payment verification."
    ]
  },
  {
    id: 5,
    title: "Phase 2: Authentication Evaluation",
    subtitle: "Testing the Perimeter",
    category: "The Attack Chain",
    icon: KeyRound,
    content: "With a list of valid usernames acquired, direct login attempts failed due to password rotation policies. The attacker then shifted focus to the 'Forgot Password / Reset Password' functionality.",
    bullets: [
      "The system confirms if a username exists during the reset phase (Username Enumeration).",
      "No rate-limiting was detected on the reset portal.",
      "The system lacked secondary verification channels. No email confirmation or SMS OTP was required to initiate the reset."
    ]
  },
  {
    id: 6,
    title: "The Vulnerability: Weak KBA",
    subtitle: "Knowledge-Based Authentication Failure",
    category: "The Vulnerability",
    icon: Unlock,
    content: "To reset a password, the system challenges the user with a static Verification Question. These questions rely on public or semi-public information, such as the user's Full Name or Date of Birth. This fundamentally breaks the core principle of identity verification.",
    bullets: [
      "Dates of Birth are easily discoverable via Facebook, LinkedIn, or academic publications.",
      "Full names are public knowledge, especially for teaching faculty.",
      "KBA acts as a Single Point of Failure. If the answer is known, the account is compromised."
    ],
    codeSnippet: {
      language: "json",
      code: `// Intercepted API Response from /api/auth/reset-challenge
{
  "status": "success",
  "username": "dr.ahmed.cs@bsu.edu.eg",
  "challenge_type": "security_question",
  "question": "What is your Date of Birth? (YYYY-MM-DD)"
}`
    }
  },
  {
    id: 7,
    title: "Exploitation Scenario Step-by-Step",
    subtitle: "Executing the Account Takeover (ATO)",
    category: "The Attack Chain",
    icon: GitBranch,
    content: "By chaining the leaked usernames with the weak KBA implementation, the attacker executes a complete Account Takeover. The process is clean, leaves minimal forensic traces, and requires less than 5 minutes per account.",
    bullets: [],
    attackPath: [
      { step: "OSINT Collection", desc: "Obtain 'dr.ahmed.cs' from Telegram leaks." },
      { step: "Trigger Reset", desc: "Request password reset on mis.bsu.edu.eg." },
      { step: "Social Recon", desc: "Search Facebook for Dr. Ahmed to find DOB." },
      { step: "Bypass Auth", desc: "Answer the KBA challenge correctly." },
      { step: "Account Takeover", desc: "Set new password and log in successfully.", danger: true }
    ]
  },
  {
    id: 8,
    title: "Exploit Phase 3: The Payload",
    subtitle: "Bypassing the system programmatically",
    category: "Deep Dive",
    icon: Terminal,
    content: "Once the Date of Birth is discovered, the attacker can submit the password reset payload. Because the system trusts the KBA answer implicitly, it authorizes the password change, locking the legitimate user out of their account.",
    bullets: [
      "The payload is submitted to the `/api/auth/reset` endpoint.",
      "The server updates the database hash and invalidates active sessions.",
      "The attacker now has persistent, authenticated access."
    ],
    codeSnippet: {
      language: "http",
      code: `POST /api/auth/reset HTTP/1.1
Host: mis.bsu.edu.eg
Content-Type: application/json

{
  "username": "dr.ahmed.cs@bsu.edu.eg",
  "security_answer": "1975-08-22",
  "new_password": "HackedPassword@2026!"
}

HTTP/1.1 200 OK
{"status": "success", "message": "Password reset successful."}`
    }
  },
  {
    id: 9,
    title: "Impact Analysis: Confidentiality (PII)",
    subtitle: "The Student Affairs Compromise",
    category: "Impact Assessment",
    icon: UserX,
    content: "If an attacker targets a 'Student Affairs' or 'Administration' account, the immediate impact is a massive breach of Confidentiality. The university is legally obligated to protect this data.",
    bullets: [
      "Unauthorized querying of the central student database.",
      "Mass exfiltration of Personally Identifiable Information (PII).",
      "Exposure of National IDs, physical addresses, phone numbers, and emergency contacts.",
      "Severe risk of targeted phishing campaigns or identity theft against the student body."
    ]
  },
  {
    id: 10,
    title: "Impact Analysis: Academic Integrity",
    subtitle: "The Professor & Dean Compromise",
    category: "Impact Assessment",
    icon: GraduationCap,
    content: "Taking over a teaching faculty member's account degrades the absolute trust required in an academic institution. The integrity of the university's degree programs is directly threatened.",
    bullets: [
      "Unauthorized modification of midterm and final grades.",
      "Alteration of attendance records and academic standing flags.",
      "Uploading fraudulent student coursework or deleting legitimate submissions.",
      "These changes are difficult to detect if the attacker mimics normal usage patterns."
    ]
  },
  {
    id: 11,
    title: "Impact Analysis: Financial Data",
    subtitle: "Tampering with University Revenue",
    category: "Impact Assessment",
    icon: LineChart,
    content: "Certain administrative accounts handle the reconciliation of student tuition payments. Access to these accounts introduces severe financial manipulation risks.",
    bullets: [
      "Marking unpaid student tuition accounts as 'Paid In Full'.",
      "Accessing historical transaction records and scholarship disbursements.",
      "Deleting financial holds, allowing ineligible students to register for classes or graduate.",
      "Direct financial loss and auditing nightmares for the university administration."
    ]
  },
  {
    id: 12,
    title: "Solution 1: Modernize Authentication",
    subtitle: "Deprecating Knowledge-Based Authentication",
    category: "Remediation",
    icon: Lock,
    content: "The immediate priority MUST be the total removal of 'Security Questions' from the MIS architecture. This legacy mechanism is inherently insecure against modern OSINT capabilities.",
    bullets: [
      "Disable the current KBA reset route entirely.",
      "Implement Secure Link Resets: Password resets must generate a high-entropy, single-use cryptographic token sent exclusively to the user's registered university email.",
      "Tokens must explicitly expire within 15 minutes of generation.",
      "Log all password reset attempts (Success and Failure) to a centralized SIEM for anomaly detection."
    ],
    recommendation: "CRITICAL: Drop the 'security_questions' table from the database configuration immediately."
  },
  {
    id: 13,
    title: "Solution 2: Multi-Factor Auth (MFA)",
    subtitle: "Implementing Defense in Depth",
    category: "Remediation",
    icon: SmartphoneNfc,
    content: "To neutralize the threat of leaked usernames and credential stuffing, authentication must require more than just knowledge (a password). It must require possession (a device).",
    bullets: [
      "Mandate Time-based One-Time Passwords (TOTP) usage for all faculty and staff using applications like Google Authenticator or Microsoft Authenticator.",
      "If TOTP is not feasible for all users, implement SMS-based OTP as a fallback integration.",
      "Require MFA challenges on every login originating from an unrecognized IP address or device.",
      "Do not allow password resets to bypass the MFA requirement."
    ],
    recommendation: "ACTION: Integrate an enterprise Identity Provider (IdP) like Azure AD or Okta."
  },
  {
    id: 14,
    title: "Solution 3: Credential Hygiene & Auditing",
    subtitle: "Securing the Active Directory",
    category: "Remediation",
    icon: Database,
    content: "Given the confirmed presence of BSU credentials in threat actor networks, a systemic cleanup is required to ensure no shadow access remains.",
    bullets: [
      "Identify all dormant accounts (Inactive for > 180 days) and hard-disable them.",
      "Initiate a mandatory, global password reset for all Faculty and Administration accounts upon their next login attempt.",
      "Implement strict rate-limiting on the `/api/auth/login` and `/api/auth/reset` endpoints (e.g., max 5 attempts per 15 minutes per IP).",
      "Review MIS access logs from the past 90 days for unusual IP geolocations or off-hours access."
    ],
    codeSnippet: {
      language: "sql",
      code: `-- Recommended Query: Disable dormant accounts
UPDATE users 
SET status = 'disabled', requires_password_reset = TRUE 
WHERE last_login_date < NOW() - INTERVAL '180 days';`
    }
  },
  {
    id: 15,
    title: "Solution 4: Secure Credential Storage",
    subtitle: "Upgrading Cryptographic Hash Functions",
    category: "Remediation",
    icon: KeyRound,
    content: "Even with modern authentication mechanisms, the underlying storage of credentials must be cryptographically sound to prevent catastrophic exposure in the event of a database dump.",
    bullets: [
      "Ensure all stored passwords are salted with a cryptographically secure, unique salt per user.",
      "Immediately migrate away from legacy, collision-prone hashing algorithms such as MD5 or SHA-1.",
      "Implement memory-hard and compute-intensive hashing algorithms—specifically Argon2id or bcrypt—to thwart offline brute-force and dictionary attacks.",
      "Apply key stretching techniques to slow down hashing operations and deter hardware-accelerated cracking."
    ],
    codeSnippet: {
      language: "javascript",
      code: `// Example: Modern Password Hashing with bcrypt (Node.js)
const bcrypt = require('bcrypt');
const saltRounds = 12; // Computationally intensive

async function hashPassword(plainTextPassword) {
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(plainTextPassword, salt);
  return hash;
}`
    }
  },
  {
    id: 16,
    title: "Conclusion & Strategic Roadmap",
    subtitle: "Securing BSU's Digital Infrastructure",
    category: "Conclusion",
    icon: CheckCircle,
    content: "This authorized engagement successfully identified a critical attack vector that could lead to catastrophic data and financial loss. By transitioning from legacy authentication (KBA) to modern, token-based verification and enforcing MFA, Bani Suef University can neutralize this threat and protect its students and staff.",
    bullets: [
      "Stage 1 (Next 24 Hours): Disable Security Questions and enforce email-based resets.",
      "Stage 2 (Next 7 Days): Run database queries to disable dormant leak-exposed accounts.",
      "Stage 3 (Next 30 Days): Begin rolling out MFA requirements to University Administration and Deans.",
      "Stage 4 (Quarterly): Conduct regular Penetration Testing and source-code audits of the MIS platform."
    ],
    recommendation: "This report should be forwarded to the Dean of IT and the University President's office for immediate authorization of security patches."
  }
];

