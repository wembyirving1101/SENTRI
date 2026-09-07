import { Settings, HelpCircle } from 'lucide-react'

interface HeaderProps {
  currentTime: string
  graduationProgress: number
  onSettingsClick?: () => void
}

export default function Header({ currentTime, graduationProgress, onSettingsClick }: HeaderProps) {
  return (
    <header className="w-[1920px] h-20 border-b border-border bg-card px-8 py-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        {/* Left: Logo and Time */}
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-black tracking-widest text-foreground">
            SENTRI DISPATCH CONSOLE
          </h1>
          <span className="font-mono text-base font-bold text-muted-foreground" suppressHydrationWarning>
            {currentTime}
          </span>
        </div>

        {/* Center: Graduation Progress Bar */}
        <div className="flex-1 mx-8">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="bg-secondary rounded h-8 border border-border">
                <div
                  className="bg-success h-full transition-all duration-300"
                  style={{ width: `${graduationProgress}%` }}
                />
              </div>
            </div>
            <span className="font-mono text-base font-black text-success min-w-12">
              {graduationProgress}%
            </span>
          </div>
        </div>

        {/* Right: Buttons */}
        <div className="flex items-center gap-4">
          <button
            className="p-2 hover:bg-secondary rounded transition-colors"
            title="Help"
            aria-label="Help"
          >
            <HelpCircle size={24} className="text-muted-foreground hover:text-foreground" />
          </button>
          <button
            onClick={onSettingsClick}
            className="p-2 hover:bg-secondary rounded transition-colors"
            title="Settings"
            aria-label="Settings"
          >
            <Settings size={24} className="text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      </div>
    </header>
  )
}
