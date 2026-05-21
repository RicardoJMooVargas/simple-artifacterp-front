import { Menu, ShieldCheck } from "lucide-react";
import { useSession } from "../auth/auth";

const roleLabels = {
  1: "Administrador",
  2: "Publico",
  3: "Invitado",
};

function TopNav({ title, subtitle, menuIcon: MenuIcon = Menu, onMenuToggle }) {
  const { session } = useSession();
  const roleLabel = roleLabels[session?.role] ?? "Invitado";

  return (
    <header className="top-nav">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          SA
        </span>
        <div>
          <p className="brand-title">Simple Artifact ERP</p>
          <p className="brand-subtitle">Operacion comercial</p>
        </div>
      </div>
      <div className="section-info">
        <p className="section-title">{title}</p>
        <p className="section-subtitle">{subtitle}</p>
      </div>
      <button
        type="button"
        className="mobile-menu"
        onClick={onMenuToggle}
        aria-label="Mostrar menu"
      >
        <MenuIcon size={20} />
      </button>
      <div className="nav-actions">
        <div className="session-indicator">
          <ShieldCheck size={18} />
          <div>
            <p className="session-name">
              {session?.user?.name ? session.user.name : "Sin sesion"}
            </p>
            <p className="session-role">{roleLabel}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopNav;
