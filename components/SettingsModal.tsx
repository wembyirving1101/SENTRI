'use client'

import { useState } from 'react'
import { X, Volume2, Music, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { borderVariants } from '@/lib/borderVariants'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSaveSettings?: (settings: { aspectRatio: '16:9' | '16:10'; audioSettings: AudioSettings }) => void
  currentAspectRatio?: '16:9' | '16:10'
}

interface AudioSettings {
  masterVolume: number
  musicVolume: number
  soundEffectsVolume: number
}

export default function SettingsModal({
  isOpen,
  onClose,
  onSaveSettings,
  currentAspectRatio = '16:9',
}: SettingsModalProps) {
  const [activeCategory, setActiveCategory] = useState<'audio' | 'display' | 'accessibility' | 'system'>('audio')
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    masterVolume: 80,
    musicVolume: 60,
    soundEffectsVolume: 80,
  })
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '16:10'>(currentAspectRatio)

  const handleSaveChanges = () => {
    onSaveSettings?.({ aspectRatio, audioSettings })
    onClose()
  }

  if (!isOpen) return null

  const categories = [
    { id: 'audio', label: 'AUDIO', icon: '🔊' },
    { id: 'display', label: 'DISPLAY', icon: '📺' },
    { id: 'accessibility', label: 'ACCESSIBILITY', icon: '👤' },
    { id: 'system', label: 'SYSTEM', icon: '⚙️' },
  ] as const

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" 
      style={{ transform: 'scale(1)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className={cn('w-[1400px] h-[800px] bg-[#171b1d] rounded flex flex-col', borderVariants({ variant: 'emphasis' }))}>
        {/* Header */}
        <div className={cn('px-8 py-6 bg-[#171b1d] flex items-center justify-between', borderVariants({ variant: 'divider' }), 'border-b flex-shrink-0')}>
          <h1 className="text-2xl font-bold tracking-widest text-foreground flex items-center gap-3">
            <span>⚙️</span> SETTINGS
          </h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded transition-colors"
            aria-label="Close"
          >
            <X size={24} className="text-muted-foreground" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-4 p-6 min-h-0">
          {/* Left Sidebar - Categories */}
          <div className="w-56 flex flex-col gap-2 flex-shrink-0">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  'px-4 py-4 rounded text-left font-bold tracking-wide transition-colors flex items-center gap-3',
                  activeCategory === category.id
                    ? 'bg-success text-black'
                    : cn('bg-[#2a2f32] text-foreground hover:bg-[#323839]', borderVariants({ variant: 'divider' }), 'border')
                )}
              >
                <span>{category.icon}</span>
                <span className="text-sm uppercase">{category.label}</span>
              </button>
            ))}
          </div>

          {/* Right Content Area */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Audio Settings */}
            {activeCategory === 'audio' && (
              <div className="flex flex-col gap-6">
                <h2 className="text-xl font-bold tracking-widest text-success uppercase">AUDIO SETTINGS</h2>
                
                {/* Master Volume */}
                <div className={cn('p-6 rounded bg-[#0f1213]', borderVariants({ variant: 'divider' }), 'border')}>
                  <div className="flex items-center gap-4 mb-4">
                    <Volume2 size={24} className="text-[#c1b5a8] flex-shrink-0" />
                    <label className="text-lg font-bold tracking-wider text-foreground uppercase">
                      Master Volume
                    </label>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={audioSettings.masterVolume}
                      onChange={(e) => setAudioSettings(prev => ({ ...prev, masterVolume: parseInt(e.target.value) }))}
                      className="flex-1 h-3 bg-[#2a2f32] rounded-lg appearance-none cursor-pointer accent-success"
                    />
                    <span className="text-success font-bold text-lg min-w-16 text-right">{audioSettings.masterVolume}%</span>
                  </div>
                </div>

                {/* Music Volume */}
                <div className={cn('p-6 rounded bg-[#0f1213]', borderVariants({ variant: 'divider' }), 'border')}>
                  <div className="flex items-center gap-4 mb-4">
                    <Music size={24} className="text-[#c1b5a8] flex-shrink-0" />
                    <label className="text-lg font-bold tracking-wider text-foreground uppercase">
                      Music Volume
                    </label>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={audioSettings.musicVolume}
                      onChange={(e) => setAudioSettings(prev => ({ ...prev, musicVolume: parseInt(e.target.value) }))}
                      className="flex-1 h-3 bg-[#2a2f32] rounded-lg appearance-none cursor-pointer accent-success"
                    />
                    <span className="text-success font-bold text-lg min-w-16 text-right">{audioSettings.musicVolume}%</span>
                  </div>
                </div>

                {/* Sound Effects Volume */}
                <div className={cn('p-6 rounded bg-[#0f1213]', borderVariants({ variant: 'divider' }), 'border')}>
                  <div className="flex items-center gap-4 mb-4">
                    <Zap size={24} className="text-[#c1b5a8] flex-shrink-0" />
                    <label className="text-lg font-bold tracking-wider text-foreground uppercase">
                      Sound Effects Volume
                    </label>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={audioSettings.soundEffectsVolume}
                      onChange={(e) => setAudioSettings(prev => ({ ...prev, soundEffectsVolume: parseInt(e.target.value) }))}
                      className="flex-1 h-3 bg-[#2a2f32] rounded-lg appearance-none cursor-pointer accent-success"
                    />
                    <span className="text-success font-bold text-lg min-w-16 text-right">{audioSettings.soundEffectsVolume}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Display Settings */}
            {activeCategory === 'display' && (
              <div className="flex flex-col gap-6">
                <h2 className="text-xl font-bold tracking-widest text-success uppercase">DISPLAY SETTINGS</h2>
                
                <div className={cn('p-6 rounded bg-[#0f1213]', borderVariants({ variant: 'divider' }), 'border')}>
                  <label className="text-lg font-bold tracking-wider text-foreground uppercase block mb-4">
                    Aspect Ratio
                  </label>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setAspectRatio('16:9')}
                      className={cn('px-6 py-3 rounded font-bold tracking-wider transition-colors', 
                        aspectRatio === '16:9' 
                          ? 'bg-success text-black hover:bg-[#5ee75e]'
                          : cn('bg-[#2a2f32] text-foreground hover:bg-[#323839]', borderVariants({ variant: 'divider' }), 'border')
                      )}
                    >
                      16:9 (1920×1080)
                    </button>
                    <button 
                      onClick={() => setAspectRatio('16:10')}
                      className={cn('px-6 py-3 rounded font-bold tracking-wider transition-colors', 
                        aspectRatio === '16:10'
                          ? 'bg-success text-black hover:bg-[#5ee75e]'
                          : cn('bg-[#2a2f32] text-foreground hover:bg-[#323839]', borderVariants({ variant: 'divider' }), 'border')
                      )}
                    >
                      16:10 (1920×1200)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Accessibility Settings */}
            {activeCategory === 'accessibility' && (
              <div className="flex flex-col gap-6">
                <h2 className="text-xl font-bold tracking-widest text-success uppercase">ACCESSIBILITY</h2>
                
                <div className={cn('p-6 rounded bg-[#0f1213]', borderVariants({ variant: 'divider' }), 'border')}>
                  <label className="text-lg font-bold tracking-wider text-foreground uppercase block mb-4">
                    Text Size
                  </label>
                  <div className="flex gap-2">
                    {(['Small', 'Normal', 'Large'] as const).map((size) => (
                      <button
                        key={size}
                        className={cn('px-4 py-2 rounded font-bold tracking-wider transition-colors',
                          size === 'Normal'
                            ? 'bg-success text-black'
                            : cn('bg-[#2a2f32] text-foreground hover:bg-[#323839]', borderVariants({ variant: 'divider' }), 'border')
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={cn('p-6 rounded bg-[#0f1213]', borderVariants({ variant: 'divider' }), 'border')}>
                  <label className="text-lg font-bold tracking-wider text-foreground uppercase block mb-4">
                    Colorblind Mode
                  </label>
                  <button className={cn('px-6 py-2 rounded font-bold tracking-wider transition-colors', cn('bg-[#2a2f32] text-foreground hover:bg-[#323839]', borderVariants({ variant: 'divider' }), 'border'))}>
                    Off
                  </button>
                </div>

                <div className={cn('p-6 rounded bg-[#0f1213]', borderVariants({ variant: 'divider' }), 'border')}>
                  <label className="text-lg font-bold tracking-wider text-foreground uppercase block mb-4">
                    Reduce Motion
                  </label>
                  <button className={cn('px-6 py-2 rounded font-bold tracking-wider transition-colors', cn('bg-[#2a2f32] text-foreground hover:bg-[#323839]', borderVariants({ variant: 'divider' }), 'border'))}>
                    Off
                  </button>
                </div>
              </div>
            )}

            {/* System Settings */}
            {activeCategory === 'system' && (
              <div className="flex flex-col gap-6">
                <h2 className="text-xl font-bold tracking-widest text-success uppercase">SYSTEM</h2>
                
                <div className={cn('p-6 rounded bg-[#0f1213]', borderVariants({ variant: 'divider' }), 'border')}>
                  <label className="text-lg font-bold tracking-wider text-foreground uppercase block mb-4">
                    Language
                  </label>
                  <button className={cn('px-6 py-2 rounded font-bold tracking-wider transition-colors bg-success text-black')}>
                    English
                  </button>
                </div>

                <div className={cn('p-6 rounded bg-[#0f1213]', borderVariants({ variant: 'divider' }), 'border')}>
                  <label className="text-lg font-bold tracking-wider text-foreground uppercase block mb-4">
                    Reset Settings
                  </label>
                  <button className={cn('px-6 py-2 rounded font-bold tracking-wider transition-colors bg-destructive text-white hover:bg-[#ef4444]')}>
                    Reset to Defaults
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={cn('px-8 py-6 bg-[#171b1d] flex items-center justify-between', borderVariants({ variant: 'divider' }), 'border-t flex-shrink-0')}>
          <div className={cn('flex items-center gap-4 p-4 rounded bg-[#0f1213]', borderVariants({ variant: 'divider' }), 'border')}>
            <span className="text-2xl">🤖</span>
            <div>
              <p className="font-bold text-success uppercase tracking-wider">SENTRI TIP</p>
              <p className="text-sm text-muted-foreground">Adjust audio levels to your preference.</p>
            </div>
          </div>
          <button
            onClick={handleSaveChanges}
            className={cn('px-6 py-3 rounded font-bold tracking-wider text-black transition-colors bg-success hover:bg-[#5ee75e]', borderVariants({ variant: 'divider' }), 'border')}
          >
            ✓ SAVE CHANGES
          </button>
        </div>
      </div>
    </div>
  )
}
