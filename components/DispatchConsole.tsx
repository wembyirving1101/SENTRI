'use client'

import { useState, useEffect, useRef } from 'react'
import { useDialogFocus } from '@/lib/useDialogFocus'
import dayjs from 'dayjs'
import { mockEmails, verificationContacts } from '@/lib/mockEmails'
import { mockPasswords } from '@/lib/mockPasswords'
import { mockDataClassifications } from '@/lib/mockDataClassification'
import { GameState, InvestigationCategory, Email, Password, DataClassification } from '@/lib/types'
import { createInitialInvestigationPerformance, selectAdaptiveEmail, getRandomDelay, updateInvestigationPerformance } from '@/lib/gameHelpers'
import { useCorrectAnswerSound } from '@/lib/useCorrectAnswerSound'
import { useWrongAnswerSound } from '@/lib/useWrongAnswerSound'
import { useTaskNotificationSound } from '@/lib/useTaskNotificationSound'
import { useBackgroundMusic } from '@/lib/useBackgroundMusic'
import Header from '@/components/Header'
import CompanyCard from '@/components/CompanyCard'
import TasksPanel from '@/components/TasksPanel'
import SentriPanel from '@/components/SentriPanel'
import GameIcon from '@/components/GameIcon'
import DispatchQueueView from '@/components/DispatchQueueView'
import TaskDetailsPanel from '@/components/TaskDetailsPanel'
import EmailInvestigation from '@/components/EmailInvestigation'
import InvestigationPanel from '@/components/InvestigationPanel'
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

const previewQueue: DispatchItem[] = [
  { id: 'preview-email', type: 'email', priority: 'HIGH', timestamp: 0, payload: { ...mockEmails[0], id: 'preview-email', subject: 'Invoice from “ACME Corp”', from: 'Vendor', timestamp: '09:15' } },
  { id: 'preview-password', type: 'password', priority: 'MEDIUM', timestamp: 0, payload: { ...mockPasswords[0], id: 'preview-password', employee: 'System', timestamp: '09:10' } },
  { id: 'preview-document', type: 'data-classification', priority: 'MEDIUM', timestamp: 0, payload: { ...mockDataClassifications[0], id: 'preview-document', timestamp: '09:00' } },
]

export default function DispatchConsole({ designPreview = false }: { designPreview?: boolean }) {
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
    graduationProgress: designPreview ? 82 : 0,
    currentTaskType: 'email',
    currentEmailId: designPreview ? 'preview-email' : null,
    currentPasswordId: designPreview ? 'preview-password' : null,
    currentDocumentId: designPreview ? 'preview-document' : null,
    investigatedCategories: new Set(),
    decision: null,
    day: 7,
    todaysTasksCompleted: 0,
    tasksGeneratedToday: designPreview ? 3 : 0,
    dispatchQueue: designPreview ? previewQueue : [],
  })
  const [checkedPasswordCharacteristics, setCheckedPasswordCharacteristics] = useState<Set<string>>(new Set())
  const [showHelp, setShowHelp] = useState(false)
  useDialogFocus(showHelp, () => setShowHelp(false))
  const [isLoadingTask, setIsLoadingTask] = useState(!designPreview)
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
  const [showDispatchQueue, setShowDispatchQueue] = useState(true)
  const [selectedQueueItemId, setSelectedQueueItemId] = useState<string | null>(designPreview ? 'preview-document' : null)
  const usedIncidentsRef = useRef<Set<string>>(new Set())
  const demoScenarioIndexRef = useRef(0)
  const [investigationPerformance, setInvestigationPerformance] = useState(createInitialInvestigationPerformance)

  const generationRef = useRef(false)
  const databaseExhaustedRef = useRef(false)
  const gameStateRef = useRef(gameState)
  gameStateRef.current = gameState
  const performanceRef = useRef(investigationPerformance)
  performanceRef.current = investigationPerformance
  const knownAssignmentsRef = useRef<Set<string>>(new Set())
  const taskSequence = ['email', 'email', 'data-classification', 'email', 'email', 'password', 'email', 'data-classification', 'email', 'email'] as const

  const createMockDispatchItem = (): DispatchItem | null => {
    const type = taskSequence[gameStateRef.current.tasksGeneratedToday % taskSequence.length]
    if (type !== 'email') {
      const catalog = type === 'password' ? mockPasswords : mockDataClassifications
      const available = catalog.filter(item => !gameStateRef.current.dispatchQueue.some(active => active.id === item.id))
      const payload = available[Math.floor(Math.random() * available.length)]
      return payload ? { type, id: payload.id, timestamp: Date.now(), payload } : null
    }
    const availableEmails = mockEmails.filter(email => !gameStateRef.current.dispatchQueue.some(item => item.id === email.id))
    const fixedDemoIds = ['email-2', 'email-1', 'email-4']
    let email: Email | null = null

    if (demoScenarioIndexRef.current < fixedDemoIds.length) {
      email = availableEmails.find((candidate) => candidate.id === fixedDemoIds[demoScenarioIndexRef.current]) ?? null
      demoScenarioIndexRef.current += 1
    } else {
      email = selectAdaptiveEmail(availableEmails, performanceRef.current, usedIncidentsRef.current)
    }

    if (!email) {
      const lastIncidentId = Array.from(usedIncidentsRef.current).at(-1)
      usedIncidentsRef.current.clear()
      email = selectAdaptiveEmail(availableEmails, performanceRef.current, usedIncidentsRef.current)
      if (email && email.id === lastIncidentId) {
        usedIncidentsRef.current.add(email.id)
        email = selectAdaptiveEmail(availableEmails, performanceRef.current, usedIncidentsRef.current)
      }
    }

    if (!email) return null
    usedIncidentsRef.current.add(email.id)
    return { type: 'email' as const, id: email.id, timestamp: Date.now(), payload: email }
  }

  const createNextDispatchItem = async (): Promise<DispatchItem | null> => {
    if (designPreview) return createMockDispatchItem()
    if (databaseExhaustedRef.current) return null
    setIsLoadingTask(true)
    try {
      await pendingSave.current
      const item = await requestPersonalizedTask(demoUserCode, {
        knownAssignmentIds: [...knownAssignmentsRef.current],
      })
      setConnectionError(null)
      return item
    } catch (error) {
      // A database response of 404 means there is no eligible persisted task for
      // this request. Do not silently replace it with local catalog data: doing
      // so makes the UI show tasks that cannot appear in Neon. Mock data is only
      // allowed when the developer explicitly enables the fallback flag.
      if (error instanceof Error && 'status' in error && error.status === 404) {
        if (process.env.NEXT_PUBLIC_ALLOW_MOCK_FALLBACK === 'true') {
          setConnectionError(null)
          return createMockDispatchItem()
        }
        databaseExhaustedRef.current = true
        setConnectionError('No more eligible database tasks are available for this user.')
        return null
      }
      setConnectionError(error instanceof Error ? error.message : 'Unable to load the next task')
      if (process.env.NEXT_PUBLIC_ALLOW_MOCK_FALLBACK === 'true') return createMockDispatchItem()
      throw error
    } finally {
      setIsLoadingTask(false)
    }
  }

  const saveDecision = (id: string | null, decision: string, categories: string[] = [], attemptNumber = 1) => {
    const item = gameState.dispatchQueue.find((entry) => entry.id === id)
    if (designPreview || !item?.attemptId) return
    pendingSave.current = submitTaskDecision({ attemptId: item.attemptId, decision, investigatedCategories: categories, attemptNumber })
      .then((result) => {
        if (result) setGameState((prev) => ({ ...prev, graduationProgress: result.graduationPercentage }))
        setConnectionError(null)
      })
    void pendingSave.current.catch(() => setConnectionError('Your answer could not be saved. Refresh to resume this task.'))
  }

  useEffect(() => {
    if (designPreview) return
    void fetchPlayerProfile(demoUserCode).then((profile) => {
      setGameState((prev) => ({ ...prev, graduationProgress: profile.graduationPercentage }))
    }).catch((error) => setConnectionError(error.message))
  }, [demoUserCode, designPreview])

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

  // Keep tasks arriving while the player works, up to 20 per day.
  useEffect(() => {
    if (designPreview) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>
    const generate = async () => {
      if (cancelled) return
      if (!generationRef.current && gameStateRef.current.tasksGeneratedToday < 20) {
        generationRef.current = true
        try {
          const nextTask = await createNextDispatchItem()
          if (!cancelled && nextTask) {
            if (nextTask.assignmentId) knownAssignmentsRef.current.add(nextTask.assignmentId)
            setGameState(prev => {
              if (prev.dispatchQueue.some(item => item.id === nextTask.id)) return prev
              const empty = prev.dispatchQueue.length === 0
              return {
                ...prev,
                tasksGeneratedToday: prev.tasksGeneratedToday + 1,
                dispatchQueue: [...prev.dispatchQueue, nextTask],
                ...(empty ? {
                  currentTaskType: nextTask.type,
                  currentEmailId: nextTask.type === 'email' ? nextTask.id : null,
                  currentPasswordId: nextTask.type === 'password' ? nextTask.id : null,
                  currentDocumentId: nextTask.type === 'data-classification' ? nextTask.id : null,
                } : {}),
              }
            })
            playTaskNotificationSound()
          }
        } catch { /* Keep the queue usable and retry on the next interval. */ }
        finally { generationRef.current = false }
      }
      if (!cancelled) timer = setTimeout(generate, getRandomDelay())
    }
    void generate()
    return () => { cancelled = true; clearTimeout(timer) }
  }, [designPreview])

  const completeQueuedTask = (id: string | null) => {
    setGameState(prev => {
      const queue = prev.dispatchQueue.filter(item => item.id !== id)
      const next = queue[0]
      return { ...prev, dispatchQueue: queue,
        todaysTasksCompleted: prev.todaysTasksCompleted + 1,
        currentTaskType: next?.type ?? prev.currentTaskType,
        currentEmailId: next?.type === 'email' ? next.id : null,
        currentPasswordId: next?.type === 'password' ? next.id : null,
        currentDocumentId: next?.type === 'data-classification' ? next.id : null,
      }
    })
    setShowDispatchQueue(true)
  }

  useEffect(() => {
    setSelectedQueueItemId(current => gameState.dispatchQueue.some(item => item.id === current)
      ? current : gameState.dispatchQueue[0]?.id ?? null)
  }, [gameState.dispatchQueue])

  const handleStartQueueTask = (item: DispatchItem) => {
    setGameState(prev => ({ ...prev, currentTaskType: item.type,
      currentEmailId: item.type === 'email' ? item.id : prev.currentEmailId,
      currentPasswordId: item.type === 'password' ? item.id : prev.currentPasswordId,
      currentDocumentId: item.type === 'data-classification' ? item.id : prev.currentDocumentId,
    }))
    setShowDispatchQueue(false)
  }

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
  const displayTime = designPreview ? 'DAY 07 • 09:30 AM' : currentTime || 'DAY -- • --:-- --'

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
    try { await pendingSave.current } catch { return } finally { savingRef.current = false }
    setShowFeedback(false)
    setLastDecision(null)

    setEmailAttempt(0)
    setLastEmailAttemptNumber(0)
    setLastEmailCorrect(false)
    setInvestigationList((prev) => prev.map((item) => ({ ...item, checked: false })))
    
    // Move to the next case after a correct answer or the fourth wrong attempt
    completeQueuedTask(gameState.currentEmailId)
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
    try { await pendingSave.current } catch { return } finally { savingRef.current = false }
    setShowPasswordFeedback(false)
    setLastPasswordDecision(null)
    setCheckedPasswordCharacteristics(new Set())
    
    completeQueuedTask(gameState.currentPasswordId)
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
    try { await pendingSave.current } catch { return } finally { savingRef.current = false }
    setShowDataClassificationFeedback(false)
    setLastDataClassificationDecision(null)
    
    completeQueuedTask(gameState.currentDocumentId)
  }

  const handleSelectTask = (taskType: 'email' | 'password' | 'data-classification') => {
    setGameState((prev) => ({
      ...prev,
      currentTaskType: taskType,
    }))
    setShowDispatchQueue(false)
  }

  const handleEndDay = async () => {
    if (generationRef.current || gameState.dispatchQueue.length > 0) return
    console.log('[v0] End Day triggered')
    
    // Reset daily state while preserving graduation progress
    setGameState((prev) => ({
      ...prev,
      day: prev.day + 1,
      todaysTasksCompleted: 0,
      tasksGeneratedToday: 0,
      dispatchQueue: [],
      currentTaskType: 'email',
      currentEmailId: null,
      currentPasswordId: null,
      currentDocumentId: null,
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
      className="sentri-console w-[1920px] text-foreground flex flex-col" 
      style={{ height: aspectRatio === '16:9' ? '1080px' : '1200px' }}
    >
      {designPreview && <span className="design-preview-label">DESIGN PREVIEW · SAMPLE DATA</span>}
      {/* Header - Fixed height */}
      {connectionError && <div role="alert" className="connection-notice"><span>{connectionError}</span><button onClick={() => window.location.reload()}>RETRY</button></div>}
      <Header 
        currentTime={displayTime} 
        graduationProgress={gameState.graduationProgress}
        onSettingsClick={() => setShowSettings(true)}
        onHelpClick={() => setShowHelp(true)}
      />

      {/* Main Content - 3 Column Layout: 320px | flexible | 320px with 16px gaps */}
      <div className="console-workspace">
        {/* Left Sidebar - Fixed 320px width */}
        <div className="console-sidebar">
          <CompanyCard 
            companyName="KAHFUNG INDUSTRIES"
            department="OPERATIONS"
            role="Associate"
          />
          <TasksPanel 
            currentTaskType={gameState.currentTaskType} 
            onSelectTask={handleSelectTask}
            dispatchQueue={gameState.dispatchQueue}
            isQueueOpen={showDispatchQueue}
          />
          <button onClick={() => setShowDispatchQueue(true)} className={`view-queue-button metal-frame ${showDispatchQueue ? 'is-active' : ''}`} aria-current={showDispatchQueue ? 'page' : undefined}>
            <GameIcon name="file" size={32} /><span>VIEW QUEUE</span><span>{gameState.dispatchQueue.length}</span>
          </button>
          <SentriPanel isQueueOpen={showDispatchQueue} />
        </div>

        {/* Center Content - Task-specific UI or Dispatch Queue */}
        <div className="console-center">
          {showDispatchQueue ? (
            <DispatchQueueView
              queue={gameState.dispatchQueue}
              selectedQueueId={selectedQueueItemId}
              onSelectQueue={setSelectedQueueItemId}
              isLoading={isLoadingTask}
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
        <div className="console-details">
          {showDispatchQueue ? (
            <TaskDetailsPanel selectedQueueItem={gameState.dispatchQueue.find(q => q.id === selectedQueueItemId) || null} onStartTask={handleStartQueueTask} />
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

      {showHelp && <div className="console-modal-backdrop" onClick={() => setShowHelp(false)}><section className="console-modal metal-frame" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={event => event.stopPropagation()}><div className="modal-title"><h2 id="help-title">WELCOME TO YOUR DISPATCH CONSOLE</h2><button className="console-button" aria-label="Close help" onClick={() => setShowHelp(false)}>✕</button></div><div className="paper-surface handbook-pages"><p>Open View Queue to see your assignments. Select a task, review its details, then choose Start Task.</p><p>Investigate emails, review passwords, and classify documents. SENTRI will guide you as you collect evidence and make a decision.</p><p>Your trust level reflects your training progress. The markers show milestones at 25%, 50%, and 75%.</p><p>Use the handbook for company policies and Notes to record your observations.</p></div></section></div>}

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
        tasksTotal={gameState.todaysTasksCompleted + gameState.dispatchQueue.length}
        isBusy={isLoadingTask}
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />
    </div>
  )
}
