import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Inbox, Plus, Settings, Search, Home, LogOut, UserPlus } from "lucide-react";
import { signOut } from "../lib/supabase";

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/login');
    }
  };

  return (
    <div className="flex h-full w-full bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Help Desk</h1>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            to="/"
            className={`flex items-center space-x-2 p-2 rounded-lg mb-2 ${location.pathname === "/" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <Home size={20} />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/tickets"
            className={`flex items-center space-x-2 p-2 rounded-lg mb-2 ${location.pathname === "/tickets" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <Inbox size={20} />
            <span>Tickets</span>
          </Link>
          <Link
            to="/create"
            className={`flex items-center space-x-2 p-2 rounded-lg mb-2 ${location.pathname === "/create" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <Plus size={20} />
            <span>New Ticket</span>
          </Link>
          <Link
            to="/invite"
            className={`flex items-center space-x-2 p-2 rounded-lg mb-2 ${location.pathname === "/invite" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <UserPlus size={20} />
            <span>Invite Users</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200 space-y-4 flex-shrink-0">
          <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 w-full">
            <Settings size={20} />
            <span>Settings</span>
          </button>
          <button 
            onClick={handleSignOut}
            className="flex items-center space-x-2 text-red-600 hover:text-red-800 w-full"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b bg-white flex-shrink-0">
          <div className="max-w-4xl mx-auto flex items-center">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search tickets..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={20}
              />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4">{children}</div>
        </div>
      </main>
    </div>
  );
}
