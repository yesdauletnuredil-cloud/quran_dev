import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./ui";

/**
 * Confirmation before an action with consequences: cancelling or lowering a subscription (the safe
 * "keep" choice is the primary button), or checking a purchase / sponsorship before it runs
 * (primary="confirm": the action is the primary button, "back" stays secondary).
 * role="alertdialog"; focus starts on the safe choice, Tab stays inside, Esc / backdrop / × keep
 * things as they are, and focus goes back to the control that opened it.
 */
export function ConfirmDialog({ title, children, confirmLabel, keepLabel, closeLabel, onConfirm, onClose, primary = "keep", className = "" }: {
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  keepLabel: string;
  closeLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  primary?: "keep" | "confirm";
  className?: string;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const keepRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    keepRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (opener?.isConnected) opener.focus();
    };
  }, [onClose]);

  const trapTab = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const items = [...dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]")];
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  return createPortal(
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div aria-describedby="confirm-body" aria-labelledby="confirm-title" aria-modal="true" className={`auth-modal confirm-modal ${className}`} onKeyDown={trapTab} onMouseDown={(e) => e.stopPropagation()} ref={dialogRef} role="alertdialog">
        <button aria-label={closeLabel} className="modal-close icon-button" onClick={onClose} type="button"><Icon name="close" /></button>
        <h2 id="confirm-title">{title}</h2>
        <div className="confirm-body" id="confirm-body">{children}</div>
        <div className="confirm-actions">
          {primary === "confirm" && <button className="button button--primary" data-confirm onClick={onConfirm} type="button"><span>{confirmLabel}</span></button>}
          <button className={`button ${primary === "keep" ? "button--primary" : "button--secondary"}`} onClick={onClose} ref={keepRef} type="button"><span>{keepLabel}</span></button>
          {primary === "keep" && <button className="button button--secondary" data-confirm onClick={onConfirm} type="button"><span>{confirmLabel}</span></button>}
        </div>
      </div>
    </div>,
    document.querySelector(".app") ?? document.body,
  );
}
