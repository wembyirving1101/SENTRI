import { Settings } from 'lucide-react';
interface HeaderProps {
    currentTime: string;
    graduationProgress: number;
    progressLabel?: string;
    onSettingsClick?: () => void;
    onHelpClick?: () => void;
}
export default function Header({ currentTime, graduationProgress, progressLabel = 'TRUST LEVEL', onSettingsClick, onHelpClick }: HeaderProps) {
    const trust = Math.max(0, Math.min(100, graduationProgress));
    return <header className="console-header metal-frame">
    <div className="console-brand">
      <h1>SENTRI DISPATCH CONSOLE</h1>
      <span suppressHydrationWarning>{currentTime}</span>
    </div>
    <div className="trust-meter">
      <span className="console-label">{progressLabel}</span>
      <div className="trust-meter-row">
        <span className="trust-number">{Math.floor(trust)}%</span>
        <div className="trust-track" role="progressbar" aria-label={progressLabel} aria-valuemin={0} aria-valuemax={100} aria-valuenow={trust}>
          <div className="trust-fill" style={{ width: `${trust}%` }}/>
          {[25, 50, 75].map(mark => <i key={mark} className="trust-milestone" style={{ left: `${mark}%` }} aria-hidden="true"/>)}
        </div>
      </div>
    </div>
    <div className="header-controls">
      {onHelpClick && <button className="console-button header-button" onClick={onHelpClick} aria-label="Help" title="Help"><span className="help-question" aria-hidden="true">?</span></button>}
      {onSettingsClick && <button className="console-button header-button" onClick={onSettingsClick} aria-label="Settings" title="Settings"><Settings size={32} aria-hidden="true"/></button>}
    </div>
  </header>;
}
