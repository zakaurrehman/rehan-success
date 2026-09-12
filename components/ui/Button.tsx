import Link from 'next/link'
import type { ReactNode, MouseEventHandler } from 'react'
import { Icon, type IconName } from '@/components/brand/icons'

export type ButtonVariant =
  | 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger' | 'danger-soft' | 'success-soft' | 'gold'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

const SIZE: Record<ButtonSize, string> = { xs: 'btn-xs', sm: 'btn-sm', md: '', lg: 'btn-lg' }
const ICON: Record<ButtonSize, number> = { xs: 13, sm: 15, md: 17, lg: 18 }

type ButtonProps = {
  children?: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
  icon?: IconName
  iconRight?: IconName
  loading?: boolean
  className?: string
  title?: string
  'aria-label'?: string
  /* link mode */
  href?: string
  external?: boolean
  /* button mode */
  type?: 'button' | 'submit' | 'reset'
  onClick?: MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  block = false,
  icon,
  iconRight,
  loading = false,
  className = '',
  title,
  href,
  external = false,
  type = 'button',
  onClick,
  disabled = false,
  ...rest
}: ButtonProps) {
  const cls = ['btn', `btn-${variant}`, SIZE[size], block ? 'btn-block' : '', !children ? 'btn-icon' : '', className]
    .filter(Boolean)
    .join(' ')
  const iconSize = ICON[size]

  const inner = (
    <>
      {loading ? (
        <span
          className="spinner inline-block rounded-full border-2 border-current border-t-transparent"
          style={{ width: iconSize - 2, height: iconSize - 2 }}
          aria-hidden="true"
        />
      ) : icon ? (
        <Icon name={icon} size={iconSize} />
      ) : null}
      {children ? <span>{children}</span> : null}
      {iconRight && !loading ? <Icon name={iconRight} size={iconSize} /> : null}
    </>
  )

  if (href !== undefined) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls} title={title} aria-label={rest['aria-label']}>
          {inner}
        </a>
      )
    }
    return (
      <Link href={href} className={cls} title={title} aria-label={rest['aria-label']}>
        {inner}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cls}
      title={title}
      aria-label={rest['aria-label']}
    >
      {inner}
    </button>
  )
}

export default Button
