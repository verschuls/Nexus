// The few MonoGlass-style pieces Nexus uses, rebuilt without motion. The
// materials (.glass, .control, .sunken, .glass-sheet) and tooltips
// ([data-tip]) are plain CSS in index.css.
import { useEffect, useId, useRef, type ComponentProps, type ReactNode } from "react";
import { XIcon } from "@phosphor-icons/react";

const VARIANT = {
  glass: "control text-fg-1",
  ghost: "text-fg-2 hover:bg-white/6 hover:text-fg-1",
};
const SIZE = {
  sm: "h-8 gap-1.5 px-3 text-xs",
  md: "h-10 gap-2 px-4 text-sm",
  icon: "size-8",
};

export function Button({
  variant = "glass",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof VARIANT; size?: keyof typeof SIZE }) {
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 cursor-pointer select-none items-center justify-center whitespace-nowrap rounded-control font-medium transition-[background-color,color,scale] duration-200 active:scale-[0.97] [&_svg]:shrink-0 ${VARIANT[variant]} ${SIZE[size]} ${className}`}
      {...props}
    />
  );
}

/** Glass sheet on native <dialog>: focus trap, Esc and inert background come
 * from the platform. Title + Close sit above the scroll area so they never
 * scroll away, and the page behind can't scroll while it's open. */
export function Modal(props: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return props.open ? <Sheet {...props} /> : null;
}

function Sheet({ onClose, title, description, children }: Parameters<typeof Modal>[0]) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    ref.current?.showModal();
    const root = document.documentElement.style;
    const prev = root.overflow;
    root.overflow = "hidden";
    return () => {
      root.overflow = prev;
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className="modal m-auto max-h-[min(720px,calc(100dvh-32px))] w-[min(600px,calc(100vw-32px))] overflow-visible bg-transparent p-0 text-fg-1"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-sheet flex max-h-[inherit] flex-col rounded-card">
        <header className="flex shrink-0 items-start justify-between gap-4 px-6 pb-5 pt-6">
          <div className="grid gap-1.5">
            <h2 id={titleId} className="text-lg font-semibold tracking-tight">
              {title}
            </h2>
            {description && <p className="text-sm text-fg-2">{description}</p>}
          </div>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose} className="-mr-2 -mt-1">
            <XIcon size={16} />
          </Button>
        </header>
        <div className="scroll-fade flex min-h-0 flex-col overflow-auto px-6 pb-6">{children}</div>
      </div>
    </dialog>
  );
}
