import { GithubLogoIcon } from "@phosphor-icons/react";
import logo from "../../assets/logo.png";

/* Logo | title | split | GitHub. */
export function Brand({ className }: { className?: string }) {
  return (
    <div className={`glass flex items-center gap-3 rounded-card pl-3 pr-1.5 ${className ?? ""}`}>
      <img src={logo} alt="Nexus" draggable={false} className="h-10 w-10 select-none" />
      <div>
        <h1 className="text-base font-bold leading-none tracking-tight text-fg-1">NEXUS</h1>
        <p className="mt-1 text-xs text-fg-3">MCU timeline</p>
      </div>
      <div className="mx-1 h-9 w-px bg-white/10" />
      <a
        href="https://github.com/verschuls/nexus"
        target="_blank"
        rel="noreferrer"
        aria-label="GitHub repository"
        data-tip="GitHub repository"
        data-tip-side="bottom"
        className="-ml-3 grid size-9 shrink-0 place-items-center rounded-control text-fg-2 transition-colors hover:bg-white/6 hover:text-fg-1"
      >
        <GithubLogoIcon size={20} />
      </a>
    </div>
  );
}
