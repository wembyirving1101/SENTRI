'use client'

import { Password } from '@/lib/types'
import { Check } from 'lucide-react'

interface PasswordStrengthTaskProps {
  password: Password | undefined
  checkedCharacteristics: Set<string>
  onToggleCharacteristic: (id: string) => void
}

export default function PasswordStrengthTask({
  password,
  checkedCharacteristics,
  onToggleCharacteristic,
}: PasswordStrengthTaskProps) {
  if (!password) {
    return (
      <div className="flex-1 h-full bg-[#171b1d] border border-[#3a3f42] rounded flex flex-col">
        {/* Header */}
        <div className="bg-[#171b1d] border-b border-[#3a3f42] px-4 py-5 z-10 flex items-center gap-3">
          <h2 className="text-base font-bold tracking-widest text-muted-foreground uppercase">
            PASSWORD STRENGTH ASSESSMENT
          </h2>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center bg-[#d3cdc1] m-1 rounded">
          <p className="text-[#666666] text-center text-base">No password tasks available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 h-full bg-[#171b1d] border border-[#3a3f42] rounded flex flex-col">
      {/* Header */}
      <div className="bg-[#171b1d] border-b border-[#3a3f42] px-4 py-5 z-10 flex items-center gap-3">
        <h2 className="text-base font-bold tracking-widest text-muted-foreground uppercase">
          PASSWORD STRENGTH ASSESSMENT
        </h2>
      </div>

      {/* Layer 1/2 Content Area - Beige with margin showing dark border */}
      <div className="flex-1 flex bg-[#d3cdc1] m-1 rounded">
        {/* Left Column - Password Assessment */}
        <div className="flex-1 flex flex-col gap-2 p-3">
          {/* Employee Info Card */}
          <div className="bg-[#d3cdc1] rounded border border-[#c5b8a8] p-2">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-[#c5b8a8] rounded-full flex items-center justify-center text-lg flex-shrink-0">👤</div>
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-3 text-base">
                  <div>
                    <span className="text-[#666666] uppercase text-sm font-bold">EMPLOYEE</span>
                    <p className="text-[#000000] font-bold mt-1">{password.employee}</p>
                  </div>
                  <div>
                    <span className="text-[#666666] uppercase text-sm font-bold">DEPARTMENT</span>
                    <p className="text-[#000000] font-bold mt-1">{password.department}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#666666] uppercase text-xs font-bold">SUBMITTED</span>
                    <p className="text-[#000000] font-bold mt-1">{password.timestamp}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Password Display Card */}
          <div className="bg-[#d3cdc1] rounded border border-[#c5b8a8] p-2">
            <span className="text-[#666666] uppercase text-xs font-bold block mb-1">SUBMITTED PASSWORD</span>
            <div className="bg-[#d3cdc1] rounded border border-[#c5b8a8] p-2 font-mono text-[#000000] text-base tracking-widest">
              {password.submitted}
            </div>
          </div>

          {/* Password Characteristics Card */}
          <div className="bg-[#d3cdc1] rounded border border-[#c5b8a8] p-2 flex-1">
            <span className="text-[#666666] uppercase text-xs font-bold block mb-2">PASSWORD CHARACTERISTICS</span>
            <div className="space-y-2">
              {password.characteristics.map((char) => (
                <label
                  key={char.id}
                  className="flex items-start gap-3 p-2 rounded hover:bg-[#c5b8a8] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checkedCharacteristics.has(char.id)}
                    onChange={() => onToggleCharacteristic(char.id)}
                    className="w-4 h-4 mt-1 cursor-pointer flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#000000] text-sm">{char.label}</p>
                    <p className="text-[#666666] text-xs mt-0.5">{char.description}</p>
                  </div>
                  {char.present && (
                    <div className="flex-shrink-0 text-[#000000]">
                      <Check size={16} />
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}
