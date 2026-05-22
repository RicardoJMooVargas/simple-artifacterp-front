import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import {
  Boxes,
  FileText,
  Home,
  LayoutGrid,
  Settings,
  ShoppingBag,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import { useSession } from "./auth/auth";
import Catalogos from "./pages/Catalogos";
import ConfiguracionSistema from "./pages/ConfiguracionSistema";
import Cotizaciones from "./pages/Cotizaciones";
import Inventario from "./pages/Inventario";
import Publico from "./pages/Publico";
import Ventas from "./pages/Ventas";
import Login from "./pages/Login";

function App() {
  const { session } = useSession();
  const location = useLocation();
  const role = session?.role ?? 3;
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleQuotesModalToggle = (event) => {
      if (event?.detail?.open) {
        setIsSidebarOpen(false);
        setIsSidebarCollapsed(true);
      }
    };

    window.addEventListener(
      "quotes-edit-modal-toggle",
      handleQuotesModalToggle,
    );
    return () => {
      window.removeEventListener(
        "quotes-edit-modal-toggle",
        handleQuotesModalToggle,
      );
    };
  }, []);

  const adminRoutes = [
    {
      path: "/ventas",
      label: "Ventas",
      icon: ShoppingCart,
      element: <Ventas />,
      section: {
        title: "Ventas",
        subtitle: "Gestion comercial",
      },
    },
    {
      path: "/cotizaciones",
      label: "Cotizaciones",
      icon: FileText,
      element: <Cotizaciones />,
      section: {
        title: "Cotizaciones",
        subtitle: "Propuestas y seguimiento",
      },
    },
    {
      path: "/inventario",
      label: "Inventario",
      icon: Boxes,
      element: <Inventario />,
      section: {
        title: "Inventario",
        subtitle: "Stock y almacenes",
      },
    },
    {
      path: "/catalogos",
      label: "Catalogos",
      icon: LayoutGrid,
      element: <Catalogos />,
      section: {
        title: "Catalogos",
        subtitle: "Productos y listas",
      },
    },
    {
      path: "/configuracion-sistema",
      label: "Configuracion",
      icon: Settings,
      element: <ConfiguracionSistema />,
      section: {
        title: "Configuracion",
        subtitle: "Parametros del sistema",
      },
    },
  ];

  const publicBase = {
    path: "/publico",
    label: "Inicio",
    icon: Home,
    element: <Publico />,
    section: {
      title: "Portal publico",
      subtitle: "Experiencia de cliente",
    },
  };

  const publicNav = [
    publicBase,
    {
      to: "/publico",
      label: "Mis compras",
      icon: ShoppingBag,
      disabled: role === 3,
      locked: role === 3,
    },
    {
      to: "/publico",
      label: "Perfil",
      icon: UserRound,
      disabled: role === 3,
      locked: role === 3,
    },
  ];

  const activeRoutes = role === 1 ? adminRoutes : [publicBase];
  const navItems = role === 1 ? adminRoutes : publicNav;

  const currentRoute =
    activeRoutes.find((route) => route.path === location.pathname) ??
    activeRoutes[0];
  const currentSection = currentRoute?.section;
  const CurrentIcon = currentRoute?.icon;

  const defaultPath = activeRoutes[0]?.path ?? "/publico";

  return (
    <div
      className="app-shell"
      style={{ "--side-width": isSidebarCollapsed ? "84px" : "220px" }}
    >
      <TopNav
        title={currentSection?.title ?? "Artifacterp"}
        subtitle={currentSection?.subtitle ?? "Panel principal"}
        menuIcon={CurrentIcon}
        onMenuToggle={() => setIsSidebarOpen((prev) => !prev)}
      />
      <div className="app-body">
        <Sidebar
          items={navItems}
          collapsed={isSidebarCollapsed}
          isOpen={isSidebarOpen}
          onCollapseToggle={() => setIsSidebarCollapsed((prev) => !prev)}
          onNavigate={() => setIsSidebarOpen(false)}
        />
        {isSidebarOpen && (
          <button
            type="button"
            className="side-backdrop"
            aria-label="Cerrar menu"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <main className="app-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to={defaultPath} replace />} />
            {activeRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
            <Route path="*" element={<Navigate to={defaultPath} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
