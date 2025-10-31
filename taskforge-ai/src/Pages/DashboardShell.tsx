import React, { useEffect, useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import { Menu, X } from "lucide-react";

const DashboardShell: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);
  const toggleSidebar = useCallback(() => setIsSidebarOpen((v) => !v), []);

  return (
    <div className="relative z-10 flex h-screen w-full bg-[#0B0F14]">
      <div className="fixed left-0 top-0 z-40 flex h-12 w-full items-center justify-between border-b border-white/10 bg-black/30 px-3 backdrop-blur md:hidden">
        <button
          onClick={toggleSidebar}
          className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/90 active:translate-y-px"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span>{isSidebarOpen ? "Close" : "Menu"}</span>
        </button>
        <div className="pointer-events-none select-none text-xs font-medium text-white/70">
          Dashboard
        </div>
        <div className="w-[76px]" />
      </div>
      <div className="relative hidden shrink-0 md:block">
        <Sidebar />
      </div>
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[84%] max-w-[320px] transform bg-[#0E141B] shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
          <div className="flex h-12 items-center justify-between border-b border-white/10 px-3">
          <span className="text-sm font-medium text-white/85">Your Projects</span>
          <button
            onClick={closeSidebar}
            className="rounded-md p-1.5 text-white/80 hover:bg-white/10"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <Sidebar />
      </div>
      {isSidebarOpen && (
        <button
          aria-label="Close overlay"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}
      <button
        onClick={openSidebar}
        aria-label="Open menu"
        className={`fixed left-0 top-1/2 z-10000 -translate-y-1/2 rounded-r-xl border border-l-0 border-white/10 bg-white/5 p-2 text-white/90 shadow transition-opacity md:hidden ${
          isSidebarOpen ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto p-4 pt-14 md:pt-4">
          <div
            className={`transition duration-200 ${
              isSidebarOpen ? "pointer-events-none opacity-40 md:opacity-100" : "opacity-100"
            }`}
          >
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardShell;
