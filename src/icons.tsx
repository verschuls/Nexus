/* Inline SVG icons — 1.5 stroke, no icon dependency, no emoji. */
export type IconProps = { className?: string };

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const IconFilm = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...S}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" /></svg>
);
export const IconTv = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...S}><rect x="2" y="6" width="20" height="13" rx="2" /><path d="M8 3l4 3 4-3" /></svg>
);
export const IconClip = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...S}><path d="M4 5h16v14H4z" /><path d="M9 5v14M4 12h5" /></svg>
);
export const IconShort = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...S}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="m10 8 5 4-5 4z" /></svg>
);
export const IconCal = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...S}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
);
export const IconClock = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...S}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const IconLoop = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...S}><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></svg>
);
export const IconBranch = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...S}><circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="8" r="2.5" /><path d="M6 8.5v7M6 12h6a3 3 0 0 0 3-3v-.5" /></svg>
);
export const IconSearch = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...S}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
);
export const IconChevron = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...S}><path d="m6 9 6 6 6-6" /></svg>
);
export const IconCheck = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...S}><path d="m5 13 4 4L19 7" /></svg>
);
export const IconSliders = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...S}><path d="M4 8h16M4 16h16" /><circle cx="9" cy="8" r="2.2" /><circle cx="15" cy="16" r="2.2" /></svg>
);
export const IconCoffee = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...S}><path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z" /><path d="M17 9h2a2.5 2.5 0 0 1 0 5h-2" /><path d="M7.5 2.5c-.5.6-.5 1.2 0 1.8M11 2.5c-.5.6-.5 1.2 0 1.8M14.5 2.5c-.5.6-.5 1.2 0 1.8" /></svg>
);
export const IconGithub = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} fill="currentColor" aria-hidden><path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.92 1.24 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.29 0 .32.22.7.83.58C20.56 22.29 24 17.8 24 12.5 24 5.87 18.63.5 12 .5Z" /></svg>
);
