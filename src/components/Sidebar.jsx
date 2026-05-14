import { NavLink } from 'react-router-dom'
import {
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
  UserCircle2,
} from 'lucide-react'
import { useSession } from '../auth/auth'
import { Button } from './ui/button'

const roleLabels = {
  0: 'Admin',
  1: 'Publico',
  3: 'Invitado',
}

function Sidebar({
  items = [],
  collapsed = false,
  isOpen = false,
  onCollapseToggle,
  onNavigate,
}) {
  const { session, signIn, signOut } = useSession()
  const displayName = session?.user?.name ?? 'Invitado'
  const roleLabel = roleLabels[session?.role] ?? 'Invitado'
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <aside
      className={`side-nav${collapsed ? ' is-collapsed' : ''}${
        isOpen ? ' is-open' : ''
      }`}
    >
      <div className="side-header">
        <div className="side-brand">
          <span className="side-brand-mark">A</span>
          {!collapsed && <span className="side-brand-text">Artifacterp</span>}
        </div>
        <button
          type="button"
          className="side-toggle"
          onClick={onCollapseToggle}
          aria-label={collapsed ? 'Expandir menu' : 'Contraer menu'}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>
      <p className="side-title">Modulos</p>
      <ul className="side-list">
        {items.map((item, index) => {
          const Icon = item.icon
          const target = item.to ?? item.path
          const content = (
            <>
              <Icon size={18} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.locked && (
                <Lock size={14} className="side-lock" />
              )}
            </>
          )

          if (item.disabled) {
            return (
              <li key={item.label} style={{ '--i': index }}>
                <div className="side-link is-disabled">{content}</div>
              </li>
            )
          }

          return (
            <li key={target ?? item.label} style={{ '--i': index }}>
              <NavLink
                to={target}
                className={({ isActive }) =>
                  `side-link${isActive ? ' is-active' : ''}`
                }
                onClick={onNavigate}
              >
                {content}
              </NavLink>
            </li>
          )
        })}
      </ul>
      <div className="side-footer">
        <div className="side-profile">
          <div className="side-avatar">
            {initials || <UserCircle2 size={18} />}
          </div>
          {!collapsed && (
            <div>
              <p className="side-name">{displayName}</p>
              <p className="side-role">{roleLabel}</p>
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="primary"
          size="sm"
          className="side-action"
          onClick={session?.role === 0 ? signOut : signIn}
        >
          {session?.role === 0 ? 'Salir' : 'Ingresar'}
        </Button>
      </div>
    </aside>
  )
}

export default Sidebar
