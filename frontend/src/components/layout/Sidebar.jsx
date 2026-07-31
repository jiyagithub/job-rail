import { NavLink } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuBuilding2,
  LuSkull,
  LuChartBar,
  LuUser,
} from "react-icons/lu";

const navItems = [
  { label: "Dashboard", icon: LuLayoutDashboard, path: "/", ready: true },
  { label: "Organizations", icon: LuBuilding2, path: "/organizations", ready: true },
  { label: "Dead Letter Queue", icon: LuSkull, path: "/dead-letter", ready: true },
  { label: "Analytics", icon: LuChartBar, path: "/analytics", ready: true },
  { label: "Profile", icon: LuUser, path: "/profile", ready: true },
];

function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Backdrop — only visible when sidebar is open, clicking it closes the sidebar */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-64 z-50 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <span className="text-xl font-bold text-brand-600 dark:text-brand-400">
          JobRail
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(({ label, icon: Icon, path, ready }) => {
          if (!ready) {
            return (
              <div
                key={label}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-400 dark:text-gray-600 cursor-not-allowed select-none"
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  {label}
                </span>
                <span className="text-[10px] uppercase font-semibold bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                  Soon
                </span>
              </div>
            );
          }

          return (
            <NavLink
              key={label}
              to={path}
              end={path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
    </>
  );
}

export default Sidebar;