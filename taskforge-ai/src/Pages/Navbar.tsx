"use client";
import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useParams, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ListChecks, Users2, Bot, LogOut } from "lucide-react";
import { toast } from "sonner";

const Navbar: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("Token");
    toast.success("Logged out successfully");
    navigate("/auth/login");
  };

  const navItems = [
    { name: "Tasks", icon: <ListChecks size={18} />, to: `/dashboard/${projectId}/tasks` },
    { name: "Members", icon: <Users2 size={18} />, to: `/dashboard/${projectId}/members` },
    { name: "AI Tools", icon: <Bot size={18} />, to: `/dashboard/${projectId}/ai` },
  ];

  return (
    <div className="relative flex h-full min-h-0 flex-col text-[#E4E4E7] font-[Inter]">
      <nav className="relative z-[10001] flex items-center justify-between rounded-2xl border border-white/10 bg-[#0e131c] px-5 py-3 shadow-[inset_2px_2px_6px_rgba(255,255,255,0.05),_inset_-2px_-2px_6px_rgba(0,0,0,0.4),_0_6px_16px_rgba(0,0,0,0.6)] md:px-8">
        <div className="flex select-none items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-[#12B67F] shadow-[0_0_8px_#12B67F]" />
          <h1 className="text-sm font-semibold tracking-wide text-[#F3F6FD] sm:text-base">
            Project <span className="text-[#4FA1F9]">#{projectId?.slice(13, 15)}</span>
          </h1>
        </div>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-lg p-2 text-[#E4E4E7] transition hover:bg-white/10 hover:text-[#4FA1F9] md:hidden"
          aria-label="Toggle Menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="hidden items-center gap-4 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-all duration-300 ${
                  isActive
                    ? "bg-[rgba(255,255,255,0.08)] text-[#12B67F] shadow-[0_0_10px_rgba(18,182,127,0.4)]"
                    : "hover:bg-[rgba(255,255,255,0.05)] hover:shadow-[0_0_10px_rgba(79,161,249,0.3)]"
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-[#E4E4E7] transition-all duration-300 hover:bg-[rgba(255,255,255,0.05)] hover:text-[#F87171] active:scale-95"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-[9000] bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      <div
        className={`fixed left-0 right-0 top-[64px] z-[10002] origin-top md:hidden ${
          menuOpen ? "scale-y-100 opacity-100" : "pointer-events-none scale-y-95 opacity-0"
        } transition-all duration-200`}
      >
        <div className="mx-3 rounded-2xl border border-white/10 bg-[rgba(26,26,27,0.98)] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col items-start gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-xl px-3 py-2 transition ${
                    isActive
                      ? "bg-[rgba(255,255,255,0.08)] text-[#12B67F] shadow-[0_0_10px_rgba(18,182,127,0.3)]"
                      : "text-[#E4E4E7] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#4FA1F9]"
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[#E4E4E7] transition hover:bg-[rgba(255,255,255,0.05)] hover:text-[#F87171]"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex-1 min-h-0">
        <div
          className={`rounded-2xl border border-white/10 bg-[#0e131c] p-4 shadow-[inset_2px_2px_6px_rgba(255,255,255,0.05),_inset_-2px_-2px_6px_rgba(0,0,0,0.4)] transition-opacity md:backdrop-blur-xl ${
            menuOpen ? "opacity-40 md:opacity-100" : "opacity-100"
          }`}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
