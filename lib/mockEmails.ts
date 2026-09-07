import { Email, InvestigationId } from './types'

export const mockEmails: Email[] = [
  {
    id: 'email-1',
    from: 'Microsoft Security Team',
    senderDomain: 'security@microsoft-support.net',
    to: 'you@akfung.com',
    subject: 'Action Required: Verify Your Microsoft Account',
    body: `Dear User,

We detected unusual activity on your Microsoft account. 

To prevent account suspension, please verify your identity within 24 hours.

Click here to verify: [Verify Your Account](http://security-microsoft.net/verify)

If you did not request this, please ignore this email.

Thank you,
Microsoft Security Team`,
    timestamp: '09:15 AM',
    attachments: [
      {
        name: 'Account_Verification_Form.html',
        size: 125,
        type: 'HTML',
        suspicious: true,
        details: 'File contains form requesting login credentials',
      },
    ],
    isLegitimate: false,
    threat: 'phishing',
    clues: {
      senderProfile:
        'Domain is suspicious - microsoft-support.net instead of microsoft.com. Legitimate Microsoft uses @microsoft.com domains.',
      linkDetails: [
        'Link points to security-microsoft.net - mimics official domain but slightly different',
        'No tracking or legitimate Microsoft URL patterns found',
      ],
      attachmentAnalysis:
        'HTML file requesting login credentials is a major red flag. Microsoft does not send credentials requests via email.',
      languageAnalysis:
        'Urgent tone with 24-hour deadline is a common phishing tactic. Grammar is mostly correct but formal tone seems off.',
      contextAnalysis:
        'You did not initiate any account activity. The "unusual activity" claim is vague and unspecific.',
      requestAnalysis:
        'Requesting account verification credentials via email is never legitimate. Real Microsoft uses secure portals.',
    },
  },
  {
    id: 'email-2',
    from: 'HR Department',
    senderDomain: 'hr@akfung.com',
    to: 'you@akfung.com',
    subject: 'Updated Benefits Information',
    body: `Hi,

We've updated our benefits package for this year. Please review the new information in the attached PDF.

Best regards,
HR Department`,
    timestamp: '08:50 AM',
    attachments: [
      {
        name: 'Benefits_2024.pdf',
        size: 450,
        type: 'PDF',
        suspicious: false,
        details: 'Standard company benefits document',
      },
    ],
    isLegitimate: true,
    threat: 'legitimate',
    clues: {
      senderProfile:
        'Sender is from company domain (@akfung.com) and HR is a legitimate department.',
      linkDetails: [],
      attachmentAnalysis: 'PDF file from HR containing expected company benefits information.',
      languageAnalysis: 'Professional and calm tone, appropriate for HR communication.',
      contextAnalysis:
        'Benefits updates are a normal annual occurrence. You work for this company.',
      requestAnalysis:
        'No request for sensitive information or unusual actions. Just asking to review policy.',
    },
  },
  {
    id: 'email-3',
    from: 'Jason Lee',
    senderDomain: 'jlee@akfung.com',
    to: 'you@akfung.com',
    subject: 'Q3 Marketing Plan',
    body: `Hey,

Can you review the Q3 marketing plan? I've attached the latest draft. Let me know if you have any feedback.

Thanks!
Jason`,
    timestamp: '08:30 AM',
    attachments: [
      {
        name: 'Q3_Marketing_Plan.docx',
        size: 280,
        type: 'Word Document',
        suspicious: false,
        details: 'Company document shared internally',
      },
    ],
    isLegitimate: true,
    threat: 'legitimate',
    clues: {
      senderProfile:
        'Jason Lee is a known colleague from marketing department. Email from company domain.',
      linkDetails: [],
      attachmentAnalysis: 'Standard Word document with marketing plan - normal business file.',
      languageAnalysis: 'Casual, friendly tone. Typical of internal colleague communication.',
      contextAnalysis:
        'You work in marketing. Q3 planning is an expected business activity.',
      requestAnalysis:
        'Simple request for feedback on work document. No suspicious requests.',
    },
  },
  {
    id: 'email-4',
    from: 'PayPal Alert',
    senderDomain: 'alert@paypal-secure.com',
    to: 'you@akfung.com',
    subject: 'Unusual Login Detected - Confirm Your Identity',
    body: `Your PayPal account has experienced an unusual login attempt from an unfamiliar location.

For your account security, we require immediate verification.

[Confirm Identity Now](http://paypal-secure.com/verify-identity)

This link will expire in 1 hour.

PayPal Security Team`,
    timestamp: '07:45 AM',
    attachments: [],
    isLegitimate: false,
    threat: 'phishing',
    clues: {
      senderProfile:
        'Domain is alert@paypal-secure.com - real PayPal uses @paypal.com. The fake domain uses a common pattern to appear legitimate.',
      linkDetails: [
        'Link goes to paypal-secure.com instead of paypal.com',
        'No official PayPal branding or secure routing in URL',
      ],
      attachmentAnalysis: 'No attachments, but the verification link is the attack vector.',
      languageAnalysis:
        'Creates artificial urgency with "1 hour" deadline. PayPal would never use this tactic.',
      contextAnalysis:
        'You may not have PayPal account, or this could be sent to many addresses randomly.',
      requestAnalysis:
        'Asking to verify identity via link is a phishing red flag. Real PayPal directs to official site.',
    },
  },
  {
    id: 'email-5',
    from: 'System Notification',
    senderDomain: 'notification@akfung.com',
    to: 'you@akfung.com',
    subject: 'Password will expire soon',
    body: `Your network password will expire in 7 days.

To reset your password securely, please visit:
https://akfung.com/portal/reset-password

Use your employee ID and current password to authenticate.

IT Support`,
    timestamp: 'Yesterday',
    attachments: [],
    isLegitimate: true,
    threat: 'legitimate',
    clues: {
      senderProfile:
        'Notification from company notification system using official @akfung.com domain.',
      linkDetails: [
        'Link is to official company domain (akfung.com)',
        'Uses HTTPS for secure connection',
        'Path follows standard company portal naming',
      ],
      attachmentAnalysis: 'No attachments needed for password reset notification.',
      languageAnalysis:
        'Professional, clear instructions. Standard security protocol messaging.',
      contextAnalysis:
        'Password expiration notifications are normal company security policy.',
      requestAnalysis:
        'Legitimate request to reset password through official company portal.',
    },
  },
  {
    id: 'email-6',
    from: 'Amazon Security',
    senderDomain: 'security@amazon-account.com',
    to: 'you@akfung.com',
    subject: 'Confirm Your Amazon Account - Unusual Activity',
    body: `We noticed unusual activity on your Amazon account.

Please confirm your identity immediately to prevent account closure.

[Confirm Account](http://amazon-account.com/security/verify)

Amazon Security Team`,
    timestamp: '06:30 AM',
    attachments: [],
    isLegitimate: false,
    threat: 'phishing',
    clues: {
      senderProfile:
        'Domain is amazon-account.com, not amazon.com. Clear phishing indicator.',
      linkDetails: ['URL does not match official Amazon domain', 'Generic verification link'],
      attachmentAnalysis: 'No attachments.',
      languageAnalysis: 'Creates urgency with threat of account closure.',
      contextAnalysis: 'You may not have active Amazon account.',
      requestAnalysis: 'Amazon never requests confirmation via email links.',
    },
  },
  {
    id: 'email-7',
    from: 'IT Department',
    senderDomain: 'it@akfung.com',
    to: 'you@akfung.com',
    subject: 'Software License Renewal',
    body: `Your software licenses are up for renewal next month. Please submit your renewal requests through the IT portal.

https://akfung.com/licenses

Thank you,
IT Department`,
    timestamp: '05:15 AM',
    attachments: [],
    isLegitimate: true,
    threat: 'legitimate',
    clues: {
      senderProfile: 'From company IT department using official domain.',
      linkDetails: ['Official company domain with HTTPS'],
      attachmentAnalysis: 'No attachments needed.',
      languageAnalysis: 'Professional and routine.',
      contextAnalysis: 'Software renewal is a normal business process.',
      requestAnalysis: 'Standard request through official channels.',
    },
  },
  {
    id: 'email-8',
    from: 'Bank of America Alert',
    senderDomain: 'alert@bank-of-america-verify.com',
    to: 'you@akfung.com',
    subject: 'Your Account Has Been Limited',
    body: `Your Bank of America account has been temporarily limited due to suspicious activity.

To unlock your account, verify your details here:
[Verify Banking Details](http://bank-of-america-verify.com/unlock)

Bank of America`,
    timestamp: '04:45 AM',
    attachments: [],
    isLegitimate: false,
    threat: 'phishing',
    clues: {
      senderProfile:
        'Sender domain is bank-of-america-verify.com, not bankofamerica.com. Phishing domain.',
      linkDetails: ['Fake domain mimicking bank name'],
      attachmentAnalysis: 'No attachments.',
      languageAnalysis: 'Creates fear and urgency about account access.',
      contextAnalysis: 'Real banks do not limit accounts via email.',
      requestAnalysis: 'Banks never request account details via email links.',
    },
  },
  {
    id: 'email-9',
    from: 'Finance Team',
    senderDomain: 'finance@akfung.com',
    to: 'you@akfung.com',
    subject: 'Expense Report Review Required',
    body: `Your recent expense report needs clarification on a few items. Please contact me to discuss.

Report ID: EXP-2026-0847

Thanks,
Finance`,
    timestamp: '03:30 AM',
    attachments: [],
    isLegitimate: true,
    threat: 'legitimate',
    clues: {
      senderProfile: 'From internal finance team using company domain.',
      linkDetails: [],
      attachmentAnalysis: 'No attachments.',
      languageAnalysis: 'Professional and straightforward.',
      contextAnalysis: 'Expense report review is normal business procedure.',
      requestAnalysis: 'Simple request for discussion, no suspicious actions.',
    },
  },
  {
    id: 'email-10',
    from: 'Apple ID Team',
    senderDomain: 'noreply@apple-security.com',
    to: 'you@akfung.com',
    subject: 'Verify Your Apple ID - Security Alert',
    body: `Your Apple ID requires verification due to recent sign-in attempts.

Click here to verify: [Verify Apple ID](http://apple-security.com/verify-id)

This link expires in 2 hours.

Apple Security`,
    timestamp: '02:00 AM',
    attachments: [],
    isLegitimate: false,
    threat: 'phishing',
    clues: {
      senderProfile: 'Domain is apple-security.com, not apple.com.',
      linkDetails: ['Impersonated Apple security domain'],
      attachmentAnalysis: 'No attachments.',
      languageAnalysis: 'Artificial urgency with expiring link.',
      contextAnalysis: 'You may not have Apple ID associated with work email.',
      requestAnalysis: 'Apple never requests verification via external links.',
    },
  },
  {
    id: 'email-11',
    from: 'Conference Organizers',
    senderDomain: 'events@akfung.com',
    to: 'you@akfung.com',
    subject: 'Tech Conference Registration Confirmation',
    body: `Thank you for registering for the Tech Summit 2026.

Your confirmation details are attached. The event is next month.

Looking forward to seeing you there!

Events Team`,
    timestamp: '01:30 AM',
    attachments: [
      {
        name: 'Registration_Confirmation.pdf',
        size: 200,
        type: 'PDF',
        suspicious: false,
        details: 'Conference registration details',
      },
    ],
    isLegitimate: true,
    threat: 'legitimate',
    clues: {
      senderProfile: 'From company events team using company domain.',
      linkDetails: [],
      attachmentAnalysis: 'Standard PDF confirmation document.',
      languageAnalysis: 'Friendly and professional confirmation message.',
      contextAnalysis: 'Company conference registrations are expected.',
      requestAnalysis: 'No requests for sensitive information.',
    },
  },
  {
    id: 'email-12',
    from: 'Google Account Security',
    senderDomain: 'security@google-verify.net',
    to: 'you@akfung.com',
    subject: 'Unusual Activity Detected on Your Google Account',
    body: `We detected unusual sign-in activity on your Google account from an unknown location.

Secure your account now: [Verify Google Account](http://google-verify.net/account-security)

Google Security Team`,
    timestamp: '12:45 AM',
    attachments: [],
    isLegitimate: false,
    threat: 'phishing',
    clues: {
      senderProfile: 'Domain is google-verify.net, not google.com.',
      linkDetails: ['Fake Google security domain'],
      attachmentAnalysis: 'No attachments.',
      languageAnalysis: 'Creates concern about account security.',
      contextAnalysis: 'Phishing targeting common email services.',
      requestAnalysis: 'Google provides in-account security warnings, not email links.',
    },
  },
  {
    id: 'email-13',
    from: 'Project Manager',
    senderDomain: 'pmanager@akfung.com',
    to: 'you@akfung.com',
    subject: 'Q3 Project Timeline Update',
    body: `Hi,

I've updated the Q3 project timeline based on latest milestones. Please review and provide feedback.

Attached is the updated schedule.

Best,
Project Manager`,
    timestamp: '11:30 PM',
    attachments: [
      {
        name: 'Q3_Timeline.xlsx',
        size: 320,
        type: 'Excel',
        suspicious: false,
        details: 'Project timeline spreadsheet',
      },
    ],
    isLegitimate: true,
    threat: 'legitimate',
    clues: {
      senderProfile: 'From internal project manager using company domain.',
      linkDetails: [],
      attachmentAnalysis: 'Standard project timeline document.',
      languageAnalysis: 'Professional project communication.',
      contextAnalysis: 'Project updates are regular business activities.',
      requestAnalysis: 'Standard request for feedback on project timeline.',
    },
  },
  {
    id: 'email-14',
    from: 'Stripe Payment Alerts',
    senderDomain: 'alerts@stripe-secure.io',
    to: 'you@akfung.com',
    subject: 'Suspicious Payment Detected',
    body: `We detected a suspicious payment on your Stripe account.

Review activity: [Check Payment](http://stripe-secure.io/payment-verify)

Stripe Security`,
    timestamp: '10:15 PM',
    attachments: [],
    isLegitimate: false,
    threat: 'phishing',
    clues: {
      senderProfile: 'Domain is stripe-secure.io, not stripe.com.',
      linkDetails: ['Impersonated Stripe payment domain'],
      attachmentAnalysis: 'No attachments.',
      languageAnalysis: 'Alert language designed to trigger action.',
      contextAnalysis: 'Stripe alerts are shown in-app, not via email.',
      requestAnalysis: 'Legitimate payment services do not verify via email links.',
    },
  },
  {
    id: 'email-15',
    from: 'Learning & Development',
    senderDomain: 'learning@akfung.com',
    to: 'you@akfung.com',
    subject: 'Compliance Training: Security Awareness 2026',
    body: `All employees must complete the annual security awareness training.

Access the training module: https://akfung.com/learning/security-training

Completion deadline: End of this month.

Thank you,
Learning & Development`,
    timestamp: '09:00 PM',
    attachments: [],
    isLegitimate: true,
    threat: 'legitimate',
    clues: {
      senderProfile: 'From company L&D department using official domain.',
      linkDetails: ['Official company training platform link with HTTPS'],
      attachmentAnalysis: 'No attachments needed for training notification.',
      languageAnalysis: 'Professional compliance communication.',
      contextAnalysis: 'Annual security training is standard corporate requirement.',
      requestAnalysis: 'Standard training enrollment request.',
    },
  },
]

const investigationIds: InvestigationId[] = ['profile', 'link', 'file', 'language', 'context', 'request']

// Only suspicious indicators belong in the answer set. The other items remain
// visible investigation opportunities, but selecting them is an extra answer.
const suspiciousInvestigationByEmail: Record<string, InvestigationId[]> = {
  'email-1': ['profile', 'link', 'file', 'language', 'context', 'request'],
  'email-2': [],
  'email-3': [],
  'email-4': ['profile', 'link', 'language', 'context', 'request'],
  'email-5': [],
  'email-6': ['profile', 'link', 'context', 'request'],
  'email-7': [],
  'email-8': ['profile', 'link', 'context', 'request'],
  'email-9': [],
  'email-10': ['profile', 'link', 'context', 'request'],
  'email-11': [],
  'email-12': ['profile', 'link', 'context', 'request'],
  'email-13': [],
  'email-14': ['profile', 'link', 'context', 'request'],
  'email-15': [],
}

for (const email of mockEmails) {
  const suspicious = suspiciousInvestigationByEmail[email.id] ?? []
  const suspiciousSet = new Set(suspicious)
  email.requiredInvestigationCategories = suspicious
  email.investigationStates = Object.fromEntries(
    investigationIds.map((id) => [id, suspiciousSet.has(id) ? 'suspicious' : 'legitimate'])
  ) as Email['investigationStates']
  email.investigationHints = email.isLegitimate
    ? [
        'Before flagging anything, consider whether the details of this email are actually inconsistent or unusual.',
        'The sender and the information in the email appear consistent with what you would normally expect.',
        'There may not be a suspicious indicator that needs to be flagged.',
      ]
    : [
        email.clues.senderProfile,
        email.clues.linkDetails[0] || email.clues.languageAnalysis,
        email.clues.requestAnalysis || email.clues.contextAnalysis,
      ]
  email.redFlags = email.isLegitimate ? [] : [
    email.clues.senderProfile,
    ...(email.clues.linkDetails[0] ? [email.clues.linkDetails[0]] : []),
    email.clues.requestAnalysis,
  ]
}

export const verificationContacts = [
  {
    id: 'it',
    name: 'IT Support',
    role: 'Technical Support',
    canHelp: [
      'Verify if a link is legitimate',
      'Check if attachments are safe',
      'Confirm company domains and email systems',
      'Provide information about phishing indicators',
    ],
  },
  {
    id: 'supervisor',
    name: 'Your Supervisor',
    role: 'Manager',
    canHelp: [
      'Confirm if work is expected from colleagues',
      'Verify company policies and procedures',
      'Provide context about business requests',
    ],
  },
  {
    id: 'hr',
    name: 'HR Department',
    role: 'Human Resources',
    canHelp: [
      'Confirm HR communications and benefits updates',
      'Verify company policies',
      'Confirm personnel-related requests',
    ],
  },
  {
    id: 'finance',
    name: 'Finance Department',
    role: 'Finance',
    canHelp: [
      'Verify payment requests and invoices',
      'Confirm financial communications',
      'Verify account information requests',
    ],
  },
  {
    id: 'sender',
    name: 'Contact Sender Directly',
    role: 'Direct Communication',
    canHelp: [
      'Verify if sender actually sent the email',
      'Confirm requests through alternative channel',
      'Ask about suspicious content directly',
    ],
  },
]
