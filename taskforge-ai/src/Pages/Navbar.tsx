"use client";
import React, { useState } from "react";
import { NavLink, Outlet, useParams, useNavigate } from "react-router-dom";
import { Menu, X, ListChecks, Users2, Bot, LogOut } from "lucide-react";
import { toast } from "sonner";
const Navbar: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
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
    <div className="flex flex-col h-full text-[#E4E4E7] font-[Inter]">
      <nav
        className="
          relative flex items-center justify-between
          px-5 py-3 md:px-8 rounded-2xl border border-white/10
          bg-[#0e131c] backdrop-blur-xl
          shadow-[inset_2px_2px_6px_rgba(255,255,255,0.05),_inset_-2px_-2px_6px_rgba(0,0,0,0.4),_0_6px_16px_rgba(0,0,0,0.6)]
        "
      >
        <div className="flex items-center gap-2 select-none">
          <div className="w-2.5 h-2.5 rounded-full bg-[#12B67F] shadow-[0_0_8px_#12B67F]" />
          <h1 className="text-sm sm:text-base font-semibold tracking-wide text-[#F3F6FD]">
            Project <span className="text-[#4FA1F9]">#{projectId?.slice(13, 15)}</span>
          </h1>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-[#E4E4E7] hover:text-[#4FA1F9] transition"
          aria-label="Toggle Menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="hidden md:flex items-center gap-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 text-sm rounded-xl 
                 transition-all duration-300
                 ${
                   isActive
                     ? "text-[#12B67F] bg-[rgba(255,255,255,0.08)] shadow-[0_0_10px_rgba(18,182,127,0.4)]"
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
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl text-[#E4E4E7]
                       hover:text-[#F87171] hover:bg-[rgba(255,255,255,0.05)]
                       transition-all duration-300 active:scale-95"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
        {menuOpen && (
          <div
            className="
              absolute top-full left-0 right-0 z-10 mt-2
              flex flex-col items-start gap-2 rounded-2xl
              border border-white/10 bg-[rgba(26,26,27,0.95)] backdrop-blur-lg
              p-4 shadow-[0_8px_24px_rgba(0,0,0,0.6)]
              md:hidden animate-[fadeIn_0.3s_ease]
            "
          >
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center w-full gap-3 px-3 py-2 rounded-xl transition
                   ${
                     isActive
                       ? "text-[#12B67F] bg-[rgba(255,255,255,0.08)] shadow-[0_0_10px_rgba(18,182,127,0.3)]"
                       : "text-[#E4E4E7] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#4FA1F9]"
                   }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[#E4E4E7]
                         hover:text-[#F87171] hover:bg-[rgba(255,255,255,0.05)]
                         transition-all duration-300"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </nav>
      <div
        className="
          flex-1 min-h-0 mt-4 rounded-2xl border border-white/10
          bg-[#0e131c] backdrop-blur-xl
          p-4 shadow-[inset_2px_2px_6px_rgba(255,255,255,0.05),_inset_-2px_-2px_6px_rgba(0,0,0,0.4)]
        "
      >
        <Outlet />
      </div>
    </div>
  );
};

export default Navbar;
