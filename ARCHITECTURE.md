# Sentricol Architecture & Component Hierarchy

## Component Tree Structure

```
<html> (RootLayout)
└─ <body className="bg-background">
    └─ Home (page.tsx) [Client Component - "use client"]
        ├─ <Header />
        │   ├─ Title "SENTRI DISPATCH CONSOLE"
        │   ├─ Time Display
        │   └─ Progress Bar (0-100%)
        │
        ├─ <div className="flex-1 flex gap-4 p-4">
        │
        │   ├─ Left Sidebar (w-56)
        │   │   ├─ <TasksPanel />
        │   │   │   ├─ Email Task Button
        │   │   │   ├─ Password Task Button
        │   │   │   ├─ Data Classification Button
        │   │   │   └─ Notification Badge
        │   │   │
        │   │   └─ <ProgressPanel />
        │   │
        │   ├─ Center Content (flex-1) [Dynamic based on taskType]
        │   │   ├─ EMAIL TASK
        │   │   │   ├─ <EmailInbox />
        │   │   │   │   └─ Email list with selectable items
        │   │   │   └─ <EmailViewer />
        │   │   │       ├─ Email header (from, to, subject)
        │   │   │       ├─ Email body
        │   │   │       ├─ Attachments list
        │   │   │       └─ Investigate buttons
        │   │   │
        │   │   ├─ PASSWORD TASK
        │   │   │   └─ <PasswordStrengthTask />
        │   │   │       ├─ Password display
        │   │   │       ├─ Characteristics checklist
        │   │   │       └─ Decision buttons (Approve/Revision/Reject)
        │   │   │
        │   │   └─ DATA CLASSIFICATION TASK
        │   │       └─ <DataClassificationTask />
        │   │           ├─ Document preview
        │   │           ├─ Sensitivity indicators
        │   │           └─ Classification buttons
        │   │
        │   └─ Right Sidebar (Email only, email-specific)
        │       └─ <InvestigationPanel />
        │           ├─ Profile checkbox
        │           ├─ Link checkbox
        │           ├─ File checkbox
        │           ├─ Language checkbox
        │           ├─ Context checkbox
        │           ├─ Request checkbox
        │           ├─ Make Decision button
        │           └─ Verify Contact button
        │
        ├─ Modal Layer (Conditional Rendering)
        │   ├─ <DecisionModal /> (Email decision confirmation)
        │   ├─ <FeedbackModal /> (Email feedback)
        │   ├─ <PasswordFeedbackModal /> (Password feedback)
        │   ├─ <DataClassificationFeedbackModal /> (Classification feedback)
        │   └─ <ContactModal /> (Verification contact helper)
        │
        └─ <DeskUI /> (Fixed Bottom)
            ├─ Employee Handbook Button
            ├─ Password Policy Card
            ├─ Messages Button (with badge)
            ├─ Notes Button (with badge)
            ├─ Coffee Mug
            ├─ End Day Button
            └─ Modal Layer (Handbook/Messages/Notes)
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     GameState (page.tsx)                        │
├─────────────────────────────────────────────────────────────────┤
│ • graduationProgress: 0-100                                     │
│ • currentTaskType: 'email' | 'password' | 'data-classification'│
│ • currentEmailId / currentPasswordId / currentDocumentId        │
│ • investigatedCategories: Set<string>                           │
│ • decision: 'legitimate' | 'phishing' | null                   │
│ • day: number                                                    │
│ • todaysTasksCompleted: number (max 10)                        │
│ • dispatchQueue: Array<Incident>                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
            ┌───────────────────────────────────┐
            │   useEffect Hooks (page.tsx)      │
            ├───────────────────────────────────┤
            │ 1. Time Update (every minute)    │
            │ 2. Incident Generation (3-10s)  │
            │    → playNotificationSound()     │
            │    → dispatchQueue increment     │
            └───────────────────────────────────┘
                            ↓
        ┌──────────────────────────────────────────┐
        │   Rendered Task Component                │
        │   (based on currentTaskType)             │
        ├──────────────────────────────────────────┤
        │ Email:  EmailInbox + EmailViewer         │
        │ Pwd:    PasswordStrengthTask             │
        │ Doc:    DataClassificationTask           │
        └──────────────────────────────────────────┘
                            ↓
        ┌──────────────────────────────────────────┐
        │   User Interaction (Event Handler)       │
        ├──────────────────────────────────────────┤
        │ • handleSelectEmail()                    │
        │ • handleInvestigate()                    │
        │ • handleCheckboxChange()                 │
        │ • handleMakeDecision()                   │
        │ • handlePasswordDecision()               │
        │ • handleDataClassification()             │
        └──────────────────────────────────────────┘
                            ↓
        ┌──────────────────────────────────────────┐
        │   State Update + Progress Calculation   │
        ├──────────────────────────────────────────┤
        │ 1. Validate user decision                │
        │ 2. Calculate progress reward            │
        │ 3. Update graduationProgress            │
        │ 4. Show Feedback Modal                   │
        └──────────────────────────────────────────┘
                            ↓
        ┌──────────────────────────────────────────┐
        │   handleContinueAfterFeedback()         │
        ├──────────────────────────────────────────┤
        │ 1. Hide Feedback Modal                   │
        │ 2. Remove task from active list          │
        │ 3. Increment todaysTasksCompleted       │
        │ 4. Move to next task or show new one    │
        └──────────────────────────────────────────┘
                            ↓
        ┌──────────────────────────────────────────┐
        │   End Day Logic                          │
        ├──────────────────────────────────────────┤
        │ 1. handleEndDay() triggered              │
        │ 2. Reset daily state                     │
        │ 3. Preserve graduationProgress          │
        │ 4. Increment day counter                 │
        │ 5. Clear dispatchQueue                   │
        └──────────────────────────────────────────┘
```

---

## State Management Flow (Email Task Example)

```
INITIAL STATE:
├─ currentTaskType: 'email'
├─ currentEmailId: 'email-1'
├─ investigatedCategories: Set([])
├─ decision: null
└─ graduationProgress: 35

USER SELECTS EMAIL-3:
│ handleSelectEmail('email-3')
├─ currentEmailId: 'email-3'
├─ investigatedCategories: Set([]) ← Reset
├─ decision: null ← Reset
└─ notificationCount: 0 ← Reset

USER INVESTIGATES CLUES:
│ handleInvestigate('profile')
├─ investigatedCategories: Set(['profile'])
│ handleInvestigate('link')
├─ investigatedCategories: Set(['profile', 'link'])
│ handleCheckboxChange('file')
├─ investigatedCategories: Set(['profile', 'link', 'file'])

USER MAKES DECISION:
│ handleMakeDecision('phishing')
│ isCorrect = (decision === 'phishing' && !currentEmail.isLegitimate)
│ checkedCount = 3 / 6 clues = 50%
├─ decision: 'phishing'
├─ graduationProgress: 40 ← +5% (correct + 50%+ investigated)
└─ showFeedback: true

USER CONTINUES:
│ handleContinueAfterFeedback()
├─ activeEmails: Set([email-1, email-2, email-4, email-5]) ← email-3 removed
├─ todaysTasksCompleted: 1
├─ currentEmailId: 'email-1' ← Next active email

NEW INCIDENT GENERATED:
│ setTimeout 5 seconds
├─ incident: { type: 'password', id: 'pwd-2', timestamp: ... }
├─ dispatchQueue: [..., {type: 'password', id: 'pwd-2', ...}]
└─ notificationCount: 1 ← Notification badge updates
```

---

## Component Responsibilities Matrix

| Component | Responsibility | State Control | Event Handling |
|-----------|-----------------|----------------|-----------------|
| `page.tsx` | Central game orchestration | All game state | All event handlers |
| `Header` | Display time + progress | Read-only props | None |
| `TasksPanel` | Task type selector | Read-only props | onSelectTask |
| `ProgressPanel` | Progress info display | Read-only props | None |
| `EmailInbox` | Email list | Read-only props | onSelectEmail |
| `EmailViewer` | Email detail view | Read-only props | onInvestigate |
| `InvestigationPanel` | Clue checklist + decision | Read-only props | onCheckboxChange, onMakeDecision, onVerify |
| `PasswordStrengthTask` | Password assessment UI | Read-only props | onToggleCharacteristic, onMakeDecision |
| `DataClassificationTask` | Document classification UI | Read-only props | onClassify |
| `DecisionModal` | Confirm email decision | Read-only props | onDecide, onClose |
| `FeedbackModal` | Show email feedback | Read-only props | onContinue |
| `ContactModal` | Verification contact helper | Read-only props | onClose |
| `DeskUI` | Desk with handbook/messages/endday | Local state only | onEndDay |

---

## Key State Transitions

### Email Task Lifecycle
```
START
  ↓
[Select Email]
  ↓
Investigate Clues (Multiple)
  ↓
Make Decision
  ↓
[Show Feedback Modal]
  ↓
Continue
  ↓
Remove from Active
  ↓
Select Next Email or Task Switch
  ↓
REPEAT or END DAY
```

### Password Task Lifecycle
```
START
  ↓
View Password + Characteristics
  ↓
Toggle Characteristics (Optional)
  ↓
Make Decision (Approve/Revision/Reject)
  ↓
[Show Feedback Modal]
  ↓
Continue
  ↓
Move to Next Password (Cycles)
  ↓
REPEAT or SWITCH TASK
```

### Data Classification Lifecycle
```
START
  ↓
View Document + Indicators
  ↓
Make Classification (Public/Internal/Confidential/Restricted)
  ↓
[Show Feedback Modal]
  ↓
Continue
  ↓
Move to Next Document (Cycles)
  ↓
REPEAT or SWITCH TASK
```

### Daily Session Lifecycle
```
New Day Starts
  ↓
Initialize State (day 7, progress 35%)
  ↓
Generate Incidents (every 3-10s)
  ↓
Complete Tasks (max 10)
  ↓
Progress → Graduation (track to 100%)
  ↓
Click End Day Button
  ↓
Reset Daily State
  ↓
New Day Starts (preserve progress)
```

---

## Mock Data Architecture

```
lib/
├─ mockEmails.ts
│  ├─ mockEmails[] (5 items)
│  │  ├─ id, from, senderDomain, to, subject, body
│  │  ├─ attachments[] (name, size, type, suspicious, details)
│  │  ├─ isLegitimate (boolean)
│  │  ├─ threat ('phishing'|'malware'|'social-engineering'|'legitimate')
│  │  └─ clues (6 categories with explanation text)
│  └─ verificationContacts[] (5 roles)
│     └─ id, name, role, canHelp[] (topics)
│
├─ mockPasswords.ts
│  └─ mockPasswords[] (3 items)
│     ├─ id, employee, department, submitted, timestamp
│     ├─ characteristics[] (8 items: presence flag, checked flag, weight)
│     └─ correctDecision ('approve'|'revision'|'reject')
│
└─ mockDataClassification.ts
   └─ mockDataClassifications[] (6 items)
      ├─ id, title, from, timestamp
      ├─ fileType, fileSize, preview
      ├─ sensitivityIndicators[] (list)
      ├─ correctClassification ('public'|'internal'|'confidential'|'restricted')
      └─ shouldShareWith (string)
```

---

## Progress Calculation Engine

```
Email Decision:
├─ IF decision === correct_answer
│  ├─ checkedCount ÷ totalCategories (6) = completionRatio
│  ├─ IF completionRatio ≥ 0.5
│  │  └─ reward = 5%
│  ├─ ELSE IF completionRatio > 0
│  │  └─ reward = 2%
│  └─ ELSE
│     └─ reward = 1% (guessed)
└─ ELSE
   └─ reward = 0%

Password Decision:
├─ IF decision === correctDecision
│  └─ reward = 5%
└─ ELSE
   └─ reward = 0%

Data Classification:
├─ IF classification === correctClassification
│  └─ reward = 5%
└─ ELSE
   └─ reward = 0%

Final: graduationProgress = MIN(100, graduationProgress + reward)
```

---

## Incident Generation System

```
scheduleNextIncident() {
  delay = getRandomDelay(3000, 10000) // 3-10 seconds
  
  setTimeout(() => {
    IF todaysTasksCompleted < 10 {
      incident = generateRandomIncident(
        mockEmails,
        mockPasswords,
        mockDataClassifications
      )
      
      IF incident exists {
        dispatchQueue.push({
          type: incident.type,
          id: incident.id,
          timestamp: Date.now()
        })
        
        notificationCount++
        playNotificationSound()
      }
    }
    
    scheduleNextIncident() // Recursive
  }, delay)
}

generateRandomIncident() {
  types = [
    'email' (if emails.length > 0),
    'password' (if passwords.length > 0),
    'data-classification' (if documents.length > 0)
  ]
  
  selectedType = selectRandomFromArray(types)
  
  RETURN {
    type: selectedType,
    id: selectRandomFromArray(relevantData).id
  }
}
```

---

## Styling & Theme Architecture

### Tailwind v4 Configuration
```
globals.css
├─ @import 'tailwindcss'
├─ @import 'tw-animate-css'
├─ @import 'shadcn/tailwind.css'
├─ Custom Fonts (--font-body, --font-pixel)
└─ @theme inline
   ├─ Color variables (primary, secondary, accent, etc.)
   ├─ Border radius scales (sm, md, lg, xl, 2xl, 3xl, 4xl)
   └─ All shadcn design tokens

Design Tokens:
├─ Primary: #ff8c00 (Orange)
├─ Background: #1a1a1a (Dark)
├─ Foreground: #e5e5e5 (Light Gray)
├─ Card: #242424
├─ Accent: #ff8c00
├─ Destructive: #ff4444
├─ Border: #333333
└─ Muted: #444444 / #999999
```

### Component Styling Pattern
```
className="flex items-center justify-between gap-4 p-4 bg-card border border-border rounded text-foreground hover:bg-secondary transition-colors"
│         └─ Layout    └─ Flex alignment └─ Spacing
└─ Colors & styling                      └─ Interactivity
```

---

## File Dependencies

```
page.tsx (Main Game Loop)
├─ Imports from: lib/types, lib/mockEmails, lib/mockPasswords, 
│                lib/mockDataClassification, lib/gameHelpers
├─ Imports: Header, TasksPanel, ProgressPanel, EmailInbox, EmailViewer,
│           InvestigationPanel, PasswordStrengthTask, DataClassificationTask,
│           DecisionModal, FeedbackModal, PasswordFeedbackModal,
│           DataClassificationFeedbackModal, ContactModal, DeskUI
└─ Renders all components and manages state

Header.tsx
├─ Imports: lucide-react icons
└─ Props: currentTime, graduationProgress

TasksPanel.tsx
├─ Imports: lucide-react icons
└─ Props: currentTaskType, onSelectTask, notificationCount

EmailInbox.tsx
├─ Imports: lucide-react icons
└─ Props: emails, selectedEmailId, onSelectEmail

EmailViewer.tsx
├─ Imports: lucide-react icons
└─ Props: email, onInvestigate, investigatedCategories

InvestigationPanel.tsx
├─ Imports: lucide-react icons
└─ Props: investigationList, onMakeDecision, onCheckboxChange, onVerify

And so on... (All purely presentational, no internal state)
```

---

## Performance Considerations

### Current Optimizations
- Mock data (no API calls)
- Client-side rendering
- Memoization opportunities (components not using React.memo)

### Performance Bottlenecks
1. **Large page.tsx** (1000+ lines) - consider custom hooks
2. **No image optimization** (configured in next.config.mjs)
3. **No code splitting** for modals or components
4. **Time interval** runs every minute (minor impact)
5. **Incident generation** runs every 3-10 seconds (minor impact)

### Optimization Opportunities
- Extract game state to custom hook: `useGameState()`
- Extract email logic to custom hook: `useEmailTask()`
- Use React.memo for modal components
- Lazy load heavy components
- Implement proper TypeScript types (some disabled)
- Add error boundaries

---

## Conclusion

Sentricol uses a **centralized state management approach** with a single `GameState` in the root page component. All child components are **purely presentational** and receive data via props + callbacks. The architecture is **functional and straightforward** for a client-side game but would benefit from refactoring into custom hooks and possibly a more scalable state management solution if expanded.
