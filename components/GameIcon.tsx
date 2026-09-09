import type { CSSProperties } from 'react';
type IconName = 'email' | 'password' | 'folder' | 'building' | 'file' | 'public' | 'shield' | 'music' | 'notes';
/** Small, deliberately pixel-aligned console pictograms. */
export default function GameIcon({ name, size = 32, className = '' }: {
    name: IconName;
    size?: number;
    className?: string;
}) {
    const common = { stroke: '#252a29', strokeWidth: 1.5, strokeLinejoin: 'miter' as const };
    return <svg aria-hidden="true" viewBox="0 0 32 32" width={size} height={size} className={`game-icon ${className}`} style={{ '--icon-size': `${size}px` } as CSSProperties}>
    {name === 'email' && <g {...common}><path fill="#c6c1ad" d="M2 6h28v21H2z"/><path fill="#ddd6c3" d="m3 7 13 12L29 7"/><path fill="none" d="m3 26 9-11m17 11-9-11"/><path stroke="#8b7250" d="M5 28h23"/></g>}
    {name === 'folder' && <g {...common}><path fill="#aa8952" d="M2 7h11l3 4h14v18H2z"/><path fill="#c3a36a" d="M2 13h29l-2 16H2z"/><path stroke="#e0c99b" d="M4 15h24"/></g>}
    {name === 'password' && <g {...common}><path fill="none" stroke="#bdb8a6" strokeWidth="3" d="M9 15V8a7 7 0 0 1 14 0v7"/><path fill="#bdb8a6" d="M5 14h22v16H5z"/><path fill="#252a29" d="M14 19h4v4h-1v4h-2v-4h-1z"/></g>}
    {name === 'building' && <g {...common}><path fill="#afa58b" d="M3 12h8v18H3zM12 2h12v28H12zM25 17h5v13h-5z"/>{[6, 12, 18, 24].flatMap(y => [15, 20].map(x => <path key={`${x}-${y}`} fill="#303330" stroke="none" d={`M${x} ${y}h2v3h-2z`}/>))}<path fill="#282c2b" d="M16 26h4v4h-4z"/></g>}
    {(name === 'file' || name === 'notes') && <g {...common}><path fill="#c2bdac" d="M6 2h14l7 7v21H6z"/><path fill="#979582" d="M20 2v8h7"/><path stroke="#57594f" d="M10 15h13M10 20h13M10 25h9"/></g>}
    {name === 'public' && <g {...common}><circle cx="13" cy="9" r="6" fill="#a9b290"/><path fill="#929d7b" d="M2 27v-7l6-6h11l5 6v7z"/><circle cx="23" cy="23" r="8" fill="#829ba0"/><path fill="none" d="M15 23h16m-8-8c-5 5-5 11 0 16m0-16c5 5 5 11 0 16"/></g>}
    {name === 'shield' && <g {...common}><path fill="#aa7667" d="m16 2 12 5v12l-4 7-8 5-8-5-4-7V7z"/><path fill="#c9bc9f" d="M11 14h10v10H11z"/><path fill="none" stroke="#c9bc9f" strokeWidth="2" d="M13 14v-3a3 3 0 0 1 6 0v3"/></g>}
    {name === 'music' && <g fill="#bdb7a0"><path d="M13 5v20h4V11l10-2v12h4V1z"/><ellipse cx="10" cy="26" rx="7" ry="5"/><ellipse cx="24" cy="22" rx="7" ry="5"/></g>}
  </svg>;
}
