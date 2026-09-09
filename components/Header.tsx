import { Settings, CircleHelp } from 'lucide-react';
interface HeaderProps {
    currentTime: string;
    graduationProgress: number;
    onSettingsClick?: () => void;
    onHelpClick?: () => void;
}
export default function Header({ currentTime, graduationProgress, onSettingsClick, onHelpClick }: HeaderProps) {
    const trust = Math.max(0, Math.min(100, graduationProgress));
    return <header className="console-header metal-frame">
    <div className="console-brand">
      <h1>SENTRI DISPATCH CONSOLE</h1>
      <span suppressHydrationWarning>{currentTime}</span>
    </div>
    <div className="trust-meter">
      <span className="console-label">TRUST LEVEL</span>
      <div className="trust-meter-row">
        <span className="trust-number">{Math.round(trust)}%</span>
        <div className="trust-track" role="progressbar" aria-label="Trust level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={trust}>
          <div className="trust-fill" style={{ width: `${trust}%` }}/>
          {[25, 50, 75].map(mark => <i key={mark} className="trust-milestone" style={{ left: `${mark}%` }} aria-hidden="true"/>)}
        </div>
      </div>
    </div>
    <div className="header-controls">
      <button className="console-button header-button" onClick={onHelpClick} aria-label="Help"><CircleHelp size={34}/><span>HELP</span></button>
      <button className="console-button header-button" onClick={onSettingsClick} aria-label="Settings"><Settings size={34}/><span>SETTINGS</span></button>
    </div>
  </header>;
}
