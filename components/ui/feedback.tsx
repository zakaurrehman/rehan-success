'use client'
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Icon } from '@/components/brand/icons'
import { Button } from '@/components/ui/Button'

/* ============================================================================
   Feedback layer: toasts + promise-based confirm / prompt dialogs.
   Replaces window.alert / confirm / prompt with accessible, on-brand UI.
   ========================================================================== */

type ToastTone = 'success' | 'error' | 'info'
type Toast = { id: number; tone: ToastTone; message: string }

type ConfirmOptions = {
  title: string
  message?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'primary'
}
type PromptOptions = {
  title: string
  message?: ReactNode
  label?: string
  placeholder?: string
  defaultValue?: string
  confirmLabel?: string
  inputType?: 'text' | 'number'
  required?: boolean
}

type FeedbackApi = {
  toast: (message: string, tone?: ToastTone) => void
  confirm: (opts: ConfirmOptions) => Promise<boolean>
  prompt: (opts: PromptOptions) => Promise<string | null>
}

const FeedbackContext = createContext<FeedbackApi | null>(null)

export function useFeedback(): FeedbackApi {
  const ctx = useContext(FeedbackContext)
  if (!ctx) throw new Error('useFeedback must be used inside <FeedbackProvider>')
  return ctx
}

type DialogState =
  | { kind: 'confirm'; opts: ConfirmOptions; resolve: (v: boolean) => void }
  | { kind: 'prompt'; opts: PromptOptions; resolve: (v: string | null) => void }
  | null

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [dialog, setDialog] = useState<DialogState>(null)
  const nextId = useRef(1)

  const toast = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = nextId.current++
    setToasts((t) => [...t, { id, tone, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600)
  }, [])

  const confirm = useCallback(
    (opts: ConfirmOptions) => new Promise<boolean>((resolve) => setDialog({ kind: 'confirm', opts, resolve })),
    []
  )
  const prompt = useCallback(
    (opts: PromptOptions) => new Promise<string | null>((resolve) => setDialog({ kind: 'prompt', opts, resolve })),
    []
  )

  return (
    <FeedbackContext.Provider value={{ toast, confirm, prompt }}>
      {children}

      {dialog?.kind === 'confirm' && (
        <ConfirmDialog
          opts={dialog.opts}
          onClose={(v) => {
            dialog.resolve(v)
            setDialog(null)
          }}
        />
      )}
      {dialog?.kind === 'prompt' && (
        <PromptDialog
          opts={dialog.opts}
          onClose={(v) => {
            dialog.resolve(v)
            setDialog(null)
          }}
        />
      )}

      <div className="toast-wrap" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <Icon
              name={t.tone === 'error' ? 'alert' : t.tone === 'info' ? 'info' : 'checkCircle'}
              size={18}
              style={{ color: t.tone === 'error' ? 'var(--rs-danger)' : t.tone === 'info' ? 'var(--rs-primary-bright)' : 'var(--rs-success)' }}
            />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </FeedbackContext.Provider>
  )
}

export function Modal({
  open = true,
  onClose,
  title,
  children,
  width = 440,
  labelledBy = 'modal-title',
}: {
  open?: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  width?: number
  labelledBy?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={title ? labelledBy : undefined} style={{ maxWidth: width }}>
        {title ? (
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 id={labelledBy} className="text-lg font-bold">{title}</h2>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm btn-icon -mr-2 -mt-1" aria-label="Close">
              <Icon name="close" size={18} />
            </button>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  )
}

function ConfirmDialog({ opts, onClose }: { opts: ConfirmOptions; onClose: (v: boolean) => void }) {
  const danger = opts.tone !== 'primary'
  return (
    <Modal onClose={() => onClose(false)}>
      <div className="flex gap-3.5">
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: danger ? 'var(--rs-danger-tint)' : 'var(--rs-primary-tint)', color: danger ? 'var(--rs-danger-text)' : 'var(--rs-primary)' }}
        >
          <Icon name={danger ? 'alert' : 'info'} size={20} />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold">{opts.title}</h2>
          {opts.message ? <div className="text-muted text-sm mt-1.5 leading-relaxed whitespace-pre-line">{opts.message}</div> : null}
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">
        <Button variant="secondary" onClick={() => onClose(false)}>{opts.cancelLabel || 'Cancel'}</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={() => onClose(true)}>{opts.confirmLabel || 'Confirm'}</Button>
      </div>
    </Modal>
  )
}

function PromptDialog({ opts, onClose }: { opts: PromptOptions; onClose: (v: string | null) => void }) {
  const [value, setValue] = useState(opts.defaultValue ?? '')
  const inputRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => { inputRef.current?.focus() }, [])
  return (
    <Modal onClose={() => onClose(null)} title={opts.title}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (opts.required && !value.trim()) return
          onClose(value)
        }}
      >
        {opts.message ? <p className="text-muted text-sm mb-4 leading-relaxed">{opts.message}</p> : null}
        {opts.label ? <label className="field-label" htmlFor="prompt-input">{opts.label}</label> : null}
        <input
          id="prompt-input"
          ref={inputRef}
          className="field"
          type={opts.inputType || 'text'}
          step={opts.inputType === 'number' ? 'any' : undefined}
          placeholder={opts.placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required={opts.required}
        />
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={() => onClose(null)}>Cancel</Button>
          <Button type="submit">{opts.confirmLabel || 'Save'}</Button>
        </div>
      </form>
    </Modal>
  )
}
