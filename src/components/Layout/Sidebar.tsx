import React, { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import { useSidebar } from "@/hooks/useSidebar";
import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  FileText,
  CheckCircle,
  ClipboardList,
  X,
} from "lucide-react";

interface SidebarProps {
  userRole: "superadmin" | "formateur";
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const { isSidebarOpen, closeSidebar, isMobile } = useSidebar();
  const location = useLocation();

  // Ferme le menu latéral lors d'un changement de page sur mobile
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      closeSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const superadminMenus = [
    { path: "/dashboard/superadmin", icon: Home, label: "Tableau de bord" },
    {
      path: "/dashboard/superadmin/formateurs",
      icon: Users,
      label: "Formateurs",
    },
    {
      path: "/dashboard/superadmin/apprenants",
      icon: GraduationCap,
      label: "Apprenants",
    },
    {
      path: "/dashboard/superadmin/formations",
      icon: BookOpen,
      label: "Formations",
    },
    {
      path: "/dashboard/superadmin/sessions",
      icon: Calendar,
      label: "Sessions",
    },
    {
      path: "/dashboard/superadmin/rapports",
      icon: FileText,
      label: "Rapports",
    },
  ];

  const formateurMenus = [
    { path: "/dashboard/formateur", icon: Home, label: "Tableau de bord" },
    {
      path: "/dashboard/formateur/presence",
      icon: CheckCircle,
      label: "Marquer présence",
    },
    {
      path: "/dashboard/formateur/rapport",
      icon: ClipboardList,
      label: "Soumettre rapport",
    },
  ];

  const menus = userRole === "superadmin" ? superadminMenus : formateurMenus;

  return (
    <>
      {/* Overlay qui s'affiche derrière le menu sur mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm bg-opacity-50 transition-opacity lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out",
          "lg:top-16 lg:h-[calc(100vh-4rem)]", // Positionnement différent pour desktop
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0" // Toujours visible et statique sur desktop
        )}
      >
        <div className="flex flex-col h-full">
          {/* En-tête du menu avec bouton de fermeture sur mobile */}
          {isMobile && (
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button
                onClick={closeSidebar}
                className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>
          )}

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menus.map((menu) => (
              <NavLink
                key={menu.path}
                to={menu.path}
                end={
                  menu.path.endsWith("/superadmin") ||
                  menu.path.endsWith("/formateur")
                }
                className={({ isActive }) =>
                  clsx(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-50 text-gray-700 border-r-2 border-blue-600"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )
                }
              >
                <menu.icon className="w-5 h-5 mr-3" />
                <span>{menu.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t">
            <div className="text-xs text-gray-500 text-center">
              <p>Présence App</p>
              <p>Application PWA de gestion de la présence des apprenants</p>
              <p>v2.0.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
