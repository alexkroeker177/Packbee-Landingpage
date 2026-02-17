import React from "react";
import {
  LayoutDashboard,
  Package,
  History,
  Settings,
  PanelLeftClose,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  return (
    <div className="hidden lg:flex w-[170px] bg-[#f8f9fb] border-r border-gray-200 flex-col shrink-0">
      {/* Logo */}
      <div className="h-12 px-4 flex items-center gap-2 border-b border-gray-200">
        <div className="h-6 w-6 rounded-md bg-blue-600 flex items-center justify-center">
          <Package className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="font-bold text-[13px] text-slate-800">PackBee</span>
        <button className="ml-auto text-gray-400">
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <div className="px-3 pt-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
          Navigation
        </p>
        <nav className="flex flex-col gap-0.5">
          <NavItem icon={<LayoutDashboard size={16} />} label="Dashboard" />
          <NavItem
            icon={<Package size={16} />}
            label="Packen"
            active
          />
          <NavItem icon={<History size={16} />} label="Verlauf" />
          <NavItem icon={<Settings size={16} />} label="Einstellungen" />
        </nav>
      </div>

      {/* User at bottom */}
      <div className="mt-auto px-3 pb-3">
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg">
          <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-[11px] font-bold text-blue-700">
            A
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-700 truncate">
              Alex
            </p>
            <p className="text-[9px] text-gray-400 truncate">
              alex@packbee.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) => (
  <div
    className={[
      "flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] font-medium cursor-default",
      active
        ? "bg-blue-50 text-blue-700"
        : "text-gray-500 hover:bg-gray-100",
    ].join(" ")}
  >
    {icon}
    {label}
  </div>
);
