import GameIcon from './GameIcon';
import { useClickSound } from '@/lib/useClickSound';
import { DispatchItem, TaskType } from '@/lib/types';
interface TasksPanelProps {
    currentTaskType: TaskType;
    onSelectTask: (taskType: TaskType) => void;
    dispatchQueue: DispatchItem[];
    isQueueOpen?: boolean;
}
export default function TasksPanel({ currentTaskType, onSelectTask, dispatchQueue, isQueueOpen }: TasksPanelProps) {
    const playClickSound = useClickSound();
    const tasks = [
        { id: 'email' as const, icon: 'email' as const, label: 'Email Investigation' },
        { id: 'password' as const, icon: 'password' as const, label: 'Password Review' },
        { id: 'data-classification' as const, icon: 'folder' as const, label: 'Data Classification' },
    ];
    return <nav className="navigation-window metal-frame" aria-label="Task navigation">
    <h2 className="console-label">NAVIGATION</h2>
    <div className="navigation-slots">{tasks.map(task => {
            const count = dispatchQueue.filter(item => item.type === task.id).length;
            const active = !isQueueOpen && currentTaskType === task.id;
            return <button key={task.id} className={`navigation-task ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined} onClick={() => { playClickSound(); onSelectTask(task.id); }}>
        <GameIcon name={task.icon} size={32}/><span>{task.label}</span>{count > 0 && <span className="notification-badge">{count}</span>}
      </button>;
        })}<div className="reserved-task-slot" aria-hidden="true"/></div>
  </nav>;
}
