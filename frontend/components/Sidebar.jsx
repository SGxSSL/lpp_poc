"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  LineChart,
  Settings,
  Menu,
  X,
  PhoneCall,
} from "lucide-react";
import Link from "next/link";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "Leads", icon: PhoneCall, href: "/leads" },
  { name: "Officers", icon: Users, href: "/officers" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  return (
    <>
      {/* Mobile toggle button */}
      <div className="md:hidden p-4 bg-white shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-semibold text-indigo-600">AI CRM</h1>
        <button
          onClick={() => setOpen(!open)}
          className="text-gray-600 hover:text-indigo-600 transition"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar container */}
      <aside
        className={`fixed z-40 md:static bg-white shadow-md h-full md:h-screen flex flex-col justify-between transition-all duration-300
        ${open ? "w-64" : "w-0 md:w-20 overflow-hidden"}`}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center justify-center md:justify-start p-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-indigo-600 hidden md:block">
              AI CRM
            </h2>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col p-2 space-y-1 mt-2">
            {navItems.map(({ name, icon: Icon, href }) => (
              <Link
                key={name}
                href={href}
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
              >
                <Icon size={20} />
                <span className="hidden md:inline text-sm font-medium">
                  {name}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer / Profile section */}
        <div className="border-t border-gray-200 p-3 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
            SG
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium">Saurabh Goyal</p>
            <p className="text-xs text-gray-500">Loan Officer</p>
          </div>
        </div>
      </aside>
    </>
  );
}
