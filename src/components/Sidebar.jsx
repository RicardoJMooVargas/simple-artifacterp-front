import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Lock, UserCircle2, LogOut, X } from "lucide-react";
import { useSession } from "../auth/auth";
import { Button } from "./ui/button";

const roleLabels = {
  1: "Administrador",
  2: "Publico",
  3: "Invitado",
};

function Sidebar({
  items = [],
  collapsed = false,
  isOpen = false,
  onCollapseToggle,
  onNavigate,
}) {
  const { session, signOut } = useSession();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const displayName = session?.user?.name ?? "Invitado";
  const roleLabel = roleLabels[session?.role] ?? "Invitado";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogoutClick = () => {
    if (session?.role === 1) {
      setShowLogoutModal(true);
    } else {
      navigate("/login");
    }
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    signOut();
  };

  return (
    <aside
      className={`side-nav${collapsed ? " is-collapsed" : ""}${
        isOpen ? " is-open" : ""
      }`}
    >
      <div className="side-header">
        <div className="side-brand">
          <button
            type="button"
            className="side-brand-mark"
            onClick={onCollapseToggle}
            aria-label={collapsed ? "Expandir menu" : "Contraer menu"}
            title={collapsed ? "Expandir menu" : "Contraer menu"}
          >
            A
          </button>
          {!collapsed && <span className="side-brand-text">Artifacterp</span>}
        </div>
      </div>
      <p className="side-title">Modulos</p>
      <ul className="side-list">
        {items.map((item, index) => {
          const Icon = item.icon;
          const target = item.to ?? item.path;
          const content = (
            <>
              <Icon size={18} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.locked && (
                <Lock size={14} className="side-lock" />
              )}
            </>
          );

          if (item.disabled) {
            return (
              <li key={item.label} style={{ "--i": index }}>
                <div className="side-link is-disabled">{content}</div>
              </li>
            );
          }

          return (
            <li key={target ?? item.label} style={{ "--i": index }}>
              <NavLink
                to={target}
                className={({ isActive }) =>
                  `side-link${isActive ? " is-active" : ""}`
                }
                onClick={onNavigate}
              >
                {content}
              </NavLink>
            </li>
          );
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
          onClick={handleLogoutClick}
        >
          {session?.role === 1 ? "Salir" : "Ingresar"}
        </Button>
      </div>

      {showLogoutModal && (
        <div
          className="logout-modal"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="logout-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="logout-modal-header">
              <LogOut size={20} />
              <h3>¿Cerrar sesión?</h3>
              <button
                type="button"
                className="logout-modal-close"
                onClick={() => setShowLogoutModal(false)}
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            <p className="logout-modal-text">
              ¿Estás seguro de que deseas cerrar sesión? Tendrás que volver a
              iniciar sesión para acceder al sistema.
            </p>
            <div className="logout-modal-actions">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleConfirmLogout}
              >
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
