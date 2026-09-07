'use client'

import { useState, useEffect, useRef } from 'react'
import dayjs from 'dayjs'
import { mockEmails, verificationContacts } from '@/lib/mockEmails'
import { mockPasswords } from '@/lib/mockPasswords'
import { mockDataClassifications } from '@/lib/mockDataClassification'
import { GameState, InvestigationCategory, Email, Password, DataClassification } from '@/lib/types'
import { createInitialInvestigationPerformance, selectAdaptiveEmail, updateInvestigationPerformance } from '@/lib/gameHelpers'
import { useCorrectAnswerSound } from '@/lib/useCorrectAnswerSound'
import { useWrongAnswerSound } from '@/lib/useWrongAnswerSound'
import { useTaskNotificationSound } from '@/lib/useTaskNotificationSound'
import { useBackgroundMusic } from '@/lib/useBackgroundMusic'
import Header from '@/components/Header'
import CompanyCard from '@/components/CompanyCard'
import TasksPanel from '@/components/TasksPanel'
import ProgressPanel from '@/components/ProgressPanel'
import DispatchQueueView from '@/components/DispatchQueueView'
import TaskDetailsPanel from '@/components/TaskDetailsPanel'
import EmailInvestigation from '@/components/EmailInvestigation'
import InvestigationPanel from '@/components/InvestigationPanel'
import EmployeeHandbook from '@/components/EmployeeHandbook'
import DecisionModal from '@/components/DecisionModal'
import FeedbackModal from '@/components/FeedbackModal'
import PasswordFeedbackModal from '@/components/PasswordFeedbackModal'
import DataClassificationFeedbackModal from '@/components/DataClassificationFeedbackModal'
import PasswordStrengthTask from '@/components/PasswordStrengthTask'
import PasswordDecisionPanel from '@/components/PasswordDecisionPanel'
import DataClassificationTask from '@/components/DataClassificationTask'
import PasswordPolicyPanel from '@/components/PasswordPolicyPanel'
import DataClassificationDetailsPanel from '@/components/DataClassificationDetailsPanel'
import DeskUI from '@/components/DeskUI'
import ContactModal from '@/components/ContactModal'
import SettingsModal from '@/components/SettingsModal'
import { fetchPlayerProfile, requestPersonalizedTask, submitTaskDecision } from '@/lib/sentricolApi'
import { DispatchItem } from '@/lib/types'

export default function Home() {
  const demoUserCode = process.env.NEXT_PUBLIC_DEMO_USER_CODE ?? 'usr_0001'
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const savingRef = useRef(false)
  const pendingSave = useRef<Promise<unknown>>(Promise.resolve())
  const playCorrectSound = useCorrectAnswerSound()
  const playWrongSound = useWrongAnswerSound()
  const playTaskNotificationSound = useTaskNotificationSound()
  const { isMuted, toggleMute } = useBackgroundMusic()
  const [currentTime, setCurrentTime] = useState<string>('')
  const [showSettings, setShowSettings] = useState(false)
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '16:10'>('16:9')
  
  const handleSaveSettings = (settings: { aspectRatio: '16:9' | '16:10' }) => {
    setAspectRatio(settings.aspectRatio)
    // Update the game screen height based on aspect ratio
    const gameScreen = document.querySelector('.game-screen') as HTMLElement
    if (gameScreen) {
      gameScreen.style.height = settings.aspectRatio === '16:9' ? '1080px' : '1200px'
    }
  }

  const [gameState, setGameState] = useState<GameState>({
    graduationProgress: 0,
    currentTaskType: 'email',
    currentEmailId: 'email-1',
    currentPasswordId: 'pwd-1',
    currentDocumentId: 'doc-1',
    investigatedCategories: new Set(),
    decision: null,
    day: 7,
    todaysTasksCompleted: 0,
    tasksGeneratedToday: 0,
    dispatchQueue: [],
  })
  const [checkedPasswordCharacteristics, setCheckedPasswordCharacteristics] = useState<Set<string>>(new Set())
  const [showHandbook, setShowHandbook] = useState(true)
  const [investigationList, setInvestigationList] = useState<InvestigationCategory[]>([
    { id: 'profile', label: 'Profile', description: 'Verify sender identity and domain legitimacy', checked: false, hasEvidence: true },
    { id: 'link', label: 'Link', description: 'Analyze URLs and check for suspicious redirects', checked: false, hasEvidence: true },
    { id: 'file', label: 'File', description: 'Examine attachments for malware and threats', checked: false, hasEvidence: true },
    { id: 'language', label: 'Language', description: 'Detect unusual grammar and phishing patterns', checked: false, hasEvidence: true },
    { id: 'context', label: 'Context', description: 'Review urgency and legitimacy of request', checked: false, hasEvidence: true },
    { id: 'request', label: 'Request', description: 'Evaluate unusual access or permission demands', checked: false, hasEvidence: true },
  ])
  const [showDecisionModal, setShowDecisionModal] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [lastDecision, setLastDecision] = useState<'legitimate' | 'phishing' | null>(null)
  const [emailAttempt, setEmailAttempt] = useState(0)
  const [lastEmailAttemptNumber, setLastEmailAttemptNumber] = useState(0)
  const [lastEmailCorrect, setLastEmailCorrect] = useState(false)
  const [showPasswordFeedback, setShowPasswordFeedback] = useState(false)
  const [lastPasswordDecision, setLastPasswordDecision] = useState<'approve' | 'revision' | 'reject' | null>(null)
  const [showDataClassificationFeedback, setShowDataClassificationFeedback] = useState(false)
  const [lastDataClassificationDecision, setLastDataClassificationDecision] = useState<'public' | 'internal' | 'confidential' | 'restricted' | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const [showDispatchQueue, setShowDispatchQueue] = useState(false)
  const [selectedQueueItemId, setSelectedQueueItemId] = useState<string | null>(null)
  const usedIncidentsRef = useRef<Set<string>>(new Set())
  const demoScenarioIndexRef = useRef(0)
  const [investigationPerformance, setInvestigationPerformance] = useState(createInitialInvestigationPerformance)

  const createMockDispatchItem = (): DispatchItem | null => {
    const fixedDemoIds = ['email-2', 'email-1', 'email-4']
    let email: Email | null = null

    if (demoScenarioIndexRef.current < fixedDemoIds.length) {
      email = mockEmails.find((candidate) => candidate.id === fixedDemoIds[demoScenarioIndexRef.current]) ?? null
      demoScenarioIndexRef.current += 1
    } else {
      email = selectAdaptiveEmail(mockEmails, investigationPerformance, usedIncidentsRef.current)
    }

    if (!email) {
      const lastIncidentId = Array.from(usedIncidentsRef.current).at(-1)
      usedIncidentsRef.current.clear()
      email = selectAdaptiveEmail(mockEmails, investigationPerformance, usedIncidentsRef.current)
      if (email && email.id === lastIncidentId) {
        usedIncidentsRef.current.add(email.id)
        email = selectAdaptiveEmail(mockEmails, investigationPerformance, usedIncidentsRef.current)
      }
    }

    if (!email) return null
    usedIncidentsRef.current.add(email.id)
    return { type: 'email' as const, id: email.id, timestamp: Date.now(), payload: email }
  }

  const createNextDispatchItem = async (): Promise<DispatchItem | null> => {
    await pendingSave.current
    try {
      const item = await requestPersonalizedTask(demoUserCode)
      setConnectionError(null)
      return item
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Unable to load the next task')
      if (process.env.NEXT_PUBLIC_ALLOW_MOCK_FALLBACK === 'true') return createMockDispatchItem()
      throw error
    }
  }

  const saveDecision = (id: string | null, decision: string, categories: string[] = [], attemptNumber = 1) => {
    const item = gameState.dispatchQueue.find((entry) => entry.id === id)
    if (!item?.attemptId) return
    pendingSave.current = submitTaskDecision({ attemptId: item.attemptId, decision, investigatedCategories: categories, attemptNumber })
      .then((result) => {
        if (result) setGameState((prev) => ({ ...prev, graduationProgress: result.graduationPercentage }))
        setConnectionError(null)
      })
    void pendingSave.current.catch(() => setConnectionError('Your answer could not be saved. Refresh to resume this task.'))
  }

  useEffect(() => {
    void fetchPlayerProfile(demoUserCode).then((profile) => {
      setGameState((prev) => ({ ...prev, graduationProgress: profile.graduationPercentage }))
    }).catch((error) => setConnectionError(error.message))
  }, [demoUserCode])

  // Update time every minute (client-side only to avoid hydration mismatch)
  useEffect(() => {
    const updateTime = () => {
      const now = dayjs()
      setCurrentTime(`DAY ${now.date().toString().padStart(2, '0')} • ${now.format('hh:mm A')}`)
    }
    // Set initial time immediately on first render
    updateTime()
    // Then update every minute
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  // Seed exactly one task on load. New tasks are created only after completion.
  useEffect(() => {
    let cancelled = false
    void (async () => {
    const nextTask = await createNextDispatchItem()
    if (cancelled) return
    if (!nextTask) return

    setGameState((prev) => ({
      ...prev,
      currentTaskType: nextTask.type,
      tasksGeneratedToday: 1,
      dispatchQueue: [nextTask],
      currentEmailId: nextTask.type === 'email' ? nextTask.id : null,
      currentPasswordId: nextTask.type === 'password' ? nextTask.id : null,
      currentDocumentId: nextTask.type === 'data-classification' ? nextTask.id : null,
    }))
    })().catch(() => {})
    return () => { cancelled = true }
  }, [])

  // Auto-select first available task when tasks are added or task type changes
  useEffect(() => {
    const emailTasks = gameState.dispatchQueue.filter((item) => item.type === 'email')
    const passwordTasks = gameState.dispatchQueue.filter((item) => item.type === 'password')
    const dataTasks = gameState.dispatchQueue.filter((item) => item.type === 'data-classification')

    setGameState((prev) => {
      let updated = false
      const newState = { ...prev }

      // Auto-select first email if current one doesn't exist in queue
      if (gameState.currentTaskType === 'email' && emailTasks.length > 0) {
        const emailExists = emailTasks.some((item) => item.id === prev.currentEmailId)
        if (!emailExists) {
          newState.currentEmailId = emailTasks[0].id
          updated = true
        }
      }

      // Auto-select first password if current one doesn't exist in queue
      if (gameState.currentTaskType === 'password' && passwordTasks.length > 0) {
        const passwordExists = passwordTasks.some((item) => item.id === prev.currentPasswordId)
        if (!passwordExists) {
          newState.currentPasswordId = passwordTasks[0].id
          updated = true
        }
      }

      // Auto-select first document if current one doesn't exist in queue
      if (gameState.currentTaskType === 'data-classification' && dataTasks.length > 0) {
        const docExists = dataTasks.some((item) => item.id === prev.currentDocumentId)
        if (!docExists) {
          newState.currentDocumentId = dataTasks[0].id
          updated = true
        }
      }

      return updated ? newState : prev
    })
  }, [gameState.dispatchQueue, gameState.currentTaskType])

  // Initialize currentTime with a placeholder to prevent hydration mismatch
  const displayTime = currentTime || 'DAY -- • --:-- --'

  const currentEmail = gameState.dispatchQueue
    .find((item) => item.id === gameState.currentEmailId && item.type === 'email')
    ?.payload as Email | undefined

  const handleSelectEmail = (emailId: string) => {
    setGameState((prev) => ({
      ...prev,
      currentEmailId: emailId,
      investigatedCategories: new Set(),
      decision: null,
    }))
    setInvestigationList((prev) =>
      prev.map((item) => ({
        ...item,
        checked: false,
      }))
    )
    setShowDecisionModal(false)
    setNotificationCount(0) // Reset notification when viewing an incident
  }

  const handleInvestigate = (categoryId: string) => {
    setGameState((prev) => ({
      ...prev,
      investigatedCategories: new Set([...prev.investigatedCategories, categoryId]),
    }))
    setInvestigationList((prev) =>
      prev.map((item) =>
        item.id === categoryId
          ? { ...item, checked: true }
          : item
      )
    )
  }

  const handleCheckboxChange = (categoryId: string) => {
    const isCurrentlyChecked = investigationList.find((item) => item.id === categoryId)?.checked
    
    setInvestigationList((prev) =>
      prev.map((item) =>
        item.id === categoryId
          ? { ...item, checked: !item.checked }
          : item
      )
    )

    // Update investigation tracking based on checkbox state
    if (!isCurrentlyChecked) {
      // Checking: add to investigated categories
      setGameState((prev) => ({
        ...prev,
        investigatedCategories: new Set([...prev.investigatedCategories, categoryId]),
      }))
    } else {
      // Unchecking: remove from investigated categories
      const newInvestigated = new Set(gameState.investigatedCategories)
      newInvestigated.delete(categoryId)
      setGameState((prev) => ({
        ...prev,
        investigatedCategories: newInvestigated,
      }))
    }
  }

  const handleMakeDecision = (decision: 'legitimate' | 'phishing') => {
    if (!currentEmail) return

    const suspiciousIds = currentEmail.requiredInvestigationCategories ?? Object.entries(currentEmail.investigationStates ?? {})
      .filter(([, state]) => state === 'suspicious')
      .map(([id]) => id as InvestigationCategory['id'])
    const suspicious = new Set(suspiciousIds)
    const checked = new Set(investigationList.filter((item) => item.checked).map((item) => item.id))
    const checklistMatches = suspicious.size === checked.size && [...suspicious].every((id) => checked.has(id))
    const decisionMatches = (decision === 'phishing' && !currentEmail.isLegitimate) ||
      (decision === 'legitimate' && currentEmail.isLegitimate)
    const hasChecklist = currentEmail.requiredInvestigationCategories !== undefined || currentEmail.investigationStates !== undefined
    const isCorrect = decisionMatches && (!hasChecklist || checklistMatches)
    const attemptNumber = isCorrect ? emailAttempt + 1 : Math.min(4, emailAttempt + 1)
    const progressIncrease = isCorrect ? (attemptNumber === 1 ? 5 : attemptNumber === 2 ? 2 : 0) : attemptNumber >= 4 ? -1 : 0
    const nextPerformance = updateInvestigationPerformance(
      investigationPerformance,
      currentEmail,
      checked,
      attemptNumber,
      !isCorrect && attemptNumber >= 4,
    )
    setInvestigationPerformance(nextPerformance)

    if (isCorrect) playCorrectSound()
    else {
      playWrongSound()
      setEmailAttempt(attemptNumber)
    }

    setLastEmailAttemptNumber(attemptNumber)
    setLastEmailCorrect(isCorrect)
    setGameState((prev) => ({
      ...prev,
      decision,
      graduationProgress: Math.max(0, Math.min(100, prev.graduationProgress + progressIncrease)),
    }))
    setLastDecision(decision)
    setShowDecisionModal(false)
    setShowFeedback(true)
    if (isCorrect || attemptNumber >= 4) saveDecision(gameState.currentEmailId, decision, [...checked], attemptNumber)
  }

  const handleContinueAfterFeedback = async () => {
    const shouldRetry = !lastEmailCorrect && lastEmailAttemptNumber < 4

    if (shouldRetry) { setShowFeedback(false); setLastDecision(null); return }
    if (savingRef.current) return
    savingRef.current = true
    let nextTask: DispatchItem | null
    try { nextTask = await createNextDispatchItem() } catch { return } finally { savingRef.current = false }
    setShowFeedback(false)
    setLastDecision(null)

    setEmailAttempt(0)
    setLastEmailAttemptNumber(0)
    setLastEmailCorrect(false)
    setInvestigationList((prev) => prev.map((item) => ({ ...item, checked: false })))
    
    // Move to the next case after a correct answer or the fourth wrong attempt
    const completedEmailId = gameState.currentEmailId
    if (nextTask) playTaskNotificationSound()
    setGameState((prev) => ({
      ...prev,
      todaysTasksCompleted: prev.todaysTasksCompleted + 1,
      tasksGeneratedToday: prev.tasksGeneratedToday + (nextTask ? 1 : 0),
      dispatchQueue: nextTask ? [nextTask] : [],
      currentTaskType: nextTask?.type ?? prev.currentTaskType,
      currentEmailId: nextTask?.type === 'email' ? nextTask.id : null,
      currentPasswordId: nextTask?.type === 'password' ? nextTask.id : null,
      currentDocumentId: nextTask?.type === 'data-classification' ? nextTask.id : null,
    }))
  }

  const handleTogglePasswordCharacteristic = (id: string) => {
    setCheckedPasswordCharacteristics((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handlePasswordDecision = (decision: 'approve' | 'revision' | 'reject') => {
    let progressIncrease = 0
    const currentPassword = gameState.dispatchQueue.find((p) => p.id === gameState.currentPasswordId)?.payload as Password | undefined
    if (!currentPassword) return
    
    if (currentPassword) {
      const isCorrect = decision === currentPassword.correctDecision
      if (isCorrect) {
        playCorrectSound()
        progressIncrease = 5
      } else {
        playWrongSound()
      }
    }
    
    setLastPasswordDecision(decision)
    setShowPasswordFeedback(true)
    saveDecision(gameState.currentPasswordId, decision, [...checkedPasswordCharacteristics])
    
    // Update progress immediately
    setGameState((prev) => ({
      ...prev,
      graduationProgress: Math.min(100, prev.graduationProgress + progressIncrease),
    }))
  }

  const handleContinueAfterPasswordFeedback = async () => {
    if (savingRef.current) return
    savingRef.current = true
    let nextTask: DispatchItem | null
    try { nextTask = await createNextDispatchItem() } catch { return } finally { savingRef.current = false }
    setShowPasswordFeedback(false)
    setLastPasswordDecision(null)
    setCheckedPasswordCharacteristics(new Set())
    
    if (nextTask) playTaskNotificationSound()
    setGameState((prev) => ({
      ...prev,
      todaysTasksCompleted: prev.todaysTasksCompleted + 1,
      tasksGeneratedToday: prev.tasksGeneratedToday + (nextTask ? 1 : 0),
      dispatchQueue: nextTask ? [nextTask] : [],
      currentTaskType: nextTask?.type ?? prev.currentTaskType,
      currentEmailId: nextTask?.type === 'email' ? nextTask.id : null,
      currentPasswordId: nextTask?.type === 'password' ? nextTask.id : null,
      currentDocumentId: nextTask?.type === 'data-classification' ? nextTask.id : null,
    }))
  }

  const handleDataClassification = (classification: 'public' | 'internal' | 'confidential' | 'restricted') => {
    let progressIncrease = 0
    const currentDocument = gameState.dispatchQueue.find((d) => d.id === gameState.currentDocumentId)?.payload as DataClassification | undefined
    if (!currentDocument) return
    
    if (currentDocument) {
      const isCorrect = classification === currentDocument.correctClassification
      if (isCorrect) {
        playCorrectSound()
        progressIncrease = 5
      } else {
        playWrongSound()
      }
    }
    
    setLastDataClassificationDecision(classification)
    setShowDataClassificationFeedback(true)
    saveDecision(gameState.currentDocumentId, classification)
    
    // Update progress immediately
    setGameState((prev) => ({
      ...prev,
      graduationProgress: Math.min(100, prev.graduationProgress + progressIncrease),
    }))
  }

  const handleContinueAfterDataClassificationFeedback = async () => {
    if (savingRef.current) return
    savingRef.current = true
    let nextTask: DispatchItem | null
    try { nextTask = await createNextDispatchItem() } catch { return } finally { savingRef.current = false }
    setShowDataClassificationFeedback(false)
    setLastDataClassificationDecision(null)
    
    if (nextTask) playTaskNotificationSound()
    setGameState((prev) => ({
      ...prev,
      todaysTasksCompleted: prev.todaysTasksCompleted + 1,
      tasksGeneratedToday: prev.tasksGeneratedToday + (nextTask ? 1 : 0),
      dispatchQueue: nextTask ? [nextTask] : [],
      currentTaskType: nextTask?.type ?? prev.currentTaskType,
      currentEmailId: nextTask?.type === 'email' ? nextTask.id : null,
      currentPasswordId: nextTask?.type === 'password' ? nextTask.id : null,
      currentDocumentId: nextTask?.type === 'data-classification' ? nextTask.id : null,
    }))
  }

  const handleSelectTask = (taskType: 'email' | 'password' | 'data-classification') => {
    setGameState((prev) => ({
      ...prev,
      currentTaskType: taskType,
    }))
    setShowDispatchQueue(false)
  }

  const handleEndDay = async () => {
    let nextTask: DispatchItem | null
    try { nextTask = await createNextDispatchItem() } catch { return }
    console.log('[v0] End Day triggered')
    
    // Reset daily state while preserving graduation progress
    setGameState((prev) => ({
      ...prev,
      day: prev.day + 1,
      todaysTasksCompleted: 0,
      tasksGeneratedToday: nextTask ? 1 : 0,
      dispatchQueue: nextTask ? [nextTask] : [],
      currentTaskType: nextTask?.type ?? 'email',
      currentEmailId: nextTask?.type === 'email' ? nextTask.id : null,
      currentPasswordId: nextTask?.type === 'password' ? nextTask.id : null,
      currentDocumentId: nextTask?.type === 'data-classification' ? nextTask.id : null,
      investigatedCategories: new Set(),
      decision: null,
    }))
    
    usedIncidentsRef.current.clear()
    demoScenarioIndexRef.current = 0
    setInvestigationPerformance(createInitialInvestigationPerformance())
    setNotificationCount(0)
    
    // Reset investigation list
    setInvestigationList((prev) =>
      prev.map((item) => ({
        ...item,
        checked: false,
      }))
    )
    
    // Reset other state
    setShowFeedback(false)
    setShowDecisionModal(false)
    setLastDecision(null)
    setShowPasswordFeedback(false)
    setLastPasswordDecision(null)
    setShowDataClassificationFeedback(false)
    setLastDataClassificationDecision(null)
    setCheckedPasswordCharacteristics(new Set())
    
    console.log('[v0] New day started')
    setEmailAttempt(0)
    setLastEmailAttemptNumber(0)
    setLastEmailCorrect(false)
  }

  return (
    <div 
      className="w-[1920px] bg-background text-foreground flex flex-col" 
      style={{ height: aspectRatio === '16:9' ? '1080px' : '1200px' }}
    >
      {/* Header - Fixed height */}
      {connectionError && <div role="alert" className="bg-destructive p-3 text-white">{connectionError}</div>}
      <Header 
        currentTime={displayTime} 
        graduationProgress={gameState.graduationProgress}
        onSettingsClick={() => setShowSettings(true)}
      />

      {/* Main Content - 3 Column Layout: 320px | flexible | 320px with 16px gaps */}
      <div className="flex-1 flex gap-4 p-4 min-h-0">
        {/* Left Sidebar - Fixed 320px width */}
        <div className="w-80 flex flex-col gap-2 flex-shrink-0">
          <CompanyCard 
            companyName="KAKFUNG INDUSTRIES"
            department="OPERATIONS"
            role="Associate"
          />
          <TasksPanel 
            currentTaskType={gameState.currentTaskType} 
            onSelectTask={handleSelectTask}
            dispatchQueue={gameState.dispatchQueue}
          />
          <button
            onClick={() => {
              setShowDispatchQueue(true)
            }}
            className={`py-3 px-4 rounded font-bold text-base transition-colors uppercase tracking-wider flex-shrink-0 border ${
              showDispatchQueue
                ? 'bg-[#171b1d] border-[#3a3f42] text-muted-foreground hover:opacity-90'
                : 'bg-[#171b1d] border-[#3a3f42] text-muted-foreground hover:opacity-75'
            }`}
          >
            View Queue
          </button>
          <ProgressPanel 
            tasksCompleted={gameState.todaysTasksCompleted}
            tasksTotal={15}
          />
        </div>

        {/* Center Content - Task-specific UI or Dispatch Queue */}
        <div className="flex-1 overflow-hidden">
          {showDispatchQueue ? (
            <DispatchQueueView
              queue={gameState.dispatchQueue}
              selectedQueueId={selectedQueueItemId}
              onSelectQueue={setSelectedQueueItemId}
            />
          ) : gameState.currentTaskType === 'email' ? (
            <EmailInvestigation
              emails={gameState.dispatchQueue
                .filter((item) => item.type === 'email')
                .map((item) => item.payload as Email)
              }
              selectedEmailId={gameState.currentEmailId}
              currentEmail={currentEmail}
              onSelectEmail={handleSelectEmail}
              onInvestigate={handleInvestigate}
              investigatedCategories={gameState.investigatedCategories}
            />
          ) : gameState.currentTaskType === 'password' ? (
            <div className="flex flex-col gap-4 h-full overflow-hidden">
              <PasswordStrengthTask
                password={
                  gameState.dispatchQueue
                    .find((item) => item.id === gameState.currentPasswordId && item.type === 'password')
                    ?.payload as Password | undefined
                }
                checkedCharacteristics={checkedPasswordCharacteristics}
                onToggleCharacteristic={handleTogglePasswordCharacteristic}
              />
              <PasswordDecisionPanel onMakeDecision={handlePasswordDecision} />
            </div>
          ) : gameState.currentTaskType === 'data-classification' ? (
            <DataClassificationTask
              document={
                gameState.dispatchQueue
                  .find((item) => item.id === gameState.currentDocumentId && item.type === 'data-classification')
                  ?.payload as DataClassification | undefined
              }
            />
          ) : null}
        </div>

        {/* Right Sidebar - Fixed 430px width */}
        <div className="w-[430px] flex-shrink-0 min-h-0">
          {showDispatchQueue ? (
            <TaskDetailsPanel selectedQueueItem={gameState.dispatchQueue.find(q => q.id === selectedQueueItemId) || null} />
          ) : gameState.currentTaskType === 'email' ? (
            <InvestigationPanel
              investigationList={investigationList}
              onMakeDecision={() => setShowDecisionModal(true)}
              onCheckboxChange={handleCheckboxChange}
              onVerify={() => setShowContactModal(true)}
            />
          ) : gameState.currentTaskType === 'password' ? (
            <PasswordPolicyPanel />
          ) : gameState.currentTaskType === 'data-classification' ? (
            <DataClassificationDetailsPanel
              document={
                gameState.dispatchQueue
                  .find((item) => item.id === gameState.currentDocumentId && item.type === 'data-classification')
                  ?.payload as DataClassification | undefined
              }
              onClassify={handleDataClassification}
            />
          ) : null}
        </div>
      </div>

      {/* Bottom - Employee Handbook */}
      {/* {showHandbook && (
        <EmployeeHandbook onClose={() => setShowHandbook(false)} />
      )} */}

      {/* Decision Modal */}
      {showDecisionModal && currentEmail && (
        <DecisionModal
          email={currentEmail}
          onDecide={handleMakeDecision}
          onClose={() => setShowDecisionModal(false)}
        />
      )}

      {/* Feedback Modal */}
      {showFeedback && currentEmail && lastDecision && (
          <FeedbackModal
            email={currentEmail}
            userDecision={lastDecision}
            attemptNumber={lastEmailAttemptNumber}
            isCorrect={lastEmailCorrect}
            checkedInvestigationIds={investigationList.filter((item) => item.checked).map((item) => item.id)}
            onContinue={handleContinueAfterFeedback}
          />
      )}

      {/* Password Feedback Modal */}
      {showPasswordFeedback && gameState.currentTaskType === 'password' && lastPasswordDecision && (
        <PasswordFeedbackModal
          password={
            (gameState.dispatchQueue
              .find((item) => item.id === gameState.currentPasswordId && item.type === 'password')
              ?.payload as Password) || mockPasswords[0]
          }
          userDecision={lastPasswordDecision}
          onContinue={handleContinueAfterPasswordFeedback}
        />
      )}

      {/* Data Classification Feedback Modal */}
      {showDataClassificationFeedback && gameState.currentTaskType === 'data-classification' && lastDataClassificationDecision && (
        <DataClassificationFeedbackModal
          document={
            (gameState.dispatchQueue
              .find((item) => item.id === gameState.currentDocumentId && item.type === 'data-classification')
              ?.payload as DataClassification) || mockDataClassifications[0]
          }
          userClassification={lastDataClassificationDecision}
          onContinue={handleContinueAfterDataClassificationFeedback}
        />
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <ContactModal
          contacts={verificationContacts}
          onClose={() => setShowContactModal(false)}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSaveSettings={handleSaveSettings}
        currentAspectRatio={aspectRatio}
      />

      {/* Persistent Desk UI */}
      <DeskUI 
        progressPercentage={gameState.graduationProgress} 
        onEndDay={handleEndDay}
        tasksCompleted={gameState.todaysTasksCompleted}
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />
    </div>
  )
}
