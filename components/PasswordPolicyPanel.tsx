export default function PasswordPolicyPanel() {
  return (
    <div className="flex-1 h-full bg-[#171b1d] border border-[#3a3f42] rounded flex flex-col min-h-0">
      {/* Header */}
      <div className="bg-[#171b1d] border-b border-[#3a3f42] px-4 py-5 flex-shrink-0">
        <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase">PASSWORD POLICY</h2>
      </div>

      {/* Layer 1/2 Content Area - Beige with margin showing dark border */}
      <div className="flex-1 flex bg-[#d3cdc1] m-1 rounded min-h-0">
        {/* Policy Content */}
        <div className="flex-1 flex flex-col p-3 gap-2 overflow-y-auto">
          <div className="bg-[#d3cdc1] rounded border border-[#c5b8a8] p-2">
            <p className="font-bold text-[#000000] text-sm">📏 Minimum 12 characters</p>
            <p className="text-[#666666] text-xs mt-1">Longer passwords are harder to crack</p>
          </div>
          <div className="bg-[#d3cdc1] rounded border border-[#c5b8a8] p-2">
            <p className="font-bold text-[#000000] text-sm">Aa Include uppercase and lowercase letters</p>
            <p className="text-[#666666] text-xs mt-1">Mix character types for complexity</p>
          </div>
          <div className="bg-[#d3cdc1] rounded border border-[#c5b8a8] p-2">
            <p className="font-bold text-[#000000] text-sm">123 Include at least one number</p>
            <p className="text-[#666666] text-xs mt-1">Numbers increase entropy</p>
          </div>
          <div className="bg-[#d3cdc1] rounded border border-[#c5b8a8] p-2">
            <p className="font-bold text-[#000000] text-sm">!@# Include at least one special character</p>
            <p className="text-[#666666] text-xs mt-1">Symbols make passwords stronger</p>
          </div>
          <div className="bg-[#d3cdc1] rounded border border-[#c5b8a8] p-2">
            <p className="font-bold text-[#000000] text-sm">📚 Avoid dictionary words</p>
            <p className="text-[#666666] text-xs mt-1">Common words are easy to guess</p>
          </div>
          <div className="bg-[#d3cdc1] rounded border border-[#c5b8a8] p-2">
            <p className="font-bold text-[#000000] text-sm">👤 Avoid personal or company information</p>
            <p className="text-[#666666] text-xs mt-1">Don&apos;t use names, birthdates, or usernames</p>
          </div>
          <div className="bg-[#d3cdc1] rounded border border-[#c5b8a8] p-2">
            <p className="font-bold text-[#000000] text-sm">1️⃣ Avoid sequential characters</p>
            <p className="text-[#666666] text-xs mt-1">e.g., 123456, abcdef</p>
          </div>
          <div className="bg-[#d3cdc1] rounded border border-[#c5b8a8] p-2">
            <p className="font-bold text-[#000000] text-sm">⌨️ Avoid keyboard patterns</p>
            <p className="text-[#666666] text-xs mt-1">e.g., qwerty, asdfgh</p>
          </div>
          <div className="bg-[#d3cdc1] rounded border border-[#c5b8a8] p-2">
            <p className="font-bold text-[#000000] text-sm">↻ Do not reuse old passwords</p>
            <p className="text-[#666666] text-xs mt-1">Create unique passwords for each account</p>
          </div>
          <div className="bg-[#d3cdc1] rounded border border-[#c5b8a8] p-2">
            <p className="font-bold text-[#000000] text-sm">⚠️ Do not use leaked or common passwords</p>
            <p className="text-[#666666] text-xs mt-1">Check against known breach databases</p>
          </div>
        </div>
      </div>
    </div>
  )
}
