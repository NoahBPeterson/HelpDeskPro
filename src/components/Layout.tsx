import React, { memo, useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Inbox, Plus, Settings, Search, Home, LogOut, UserPlus, Users } from "lucide-react";
import { signOut, supabase } from "../lib/supabase";
import { useUser } from "../contexts/AuthContext";
import { useTicketSearch } from "../hooks/useTicketSearch";
import { useAuth } from "../contexts/AuthContext";

const LayoutContent = memo(({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex-1 overflow-y-hidden overflow-x-hidden">
      <div className="max-w-7xl mx-auto p-4">{children}</div>
    </div>
  );
});

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useUser();
  const { session } = useAuth();
  const [workspaceId, setWorkspaceId] = useState<string>();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    selectedIndex,
    setSelectedIndex
  } = useTicketSearch(workspaceId);

  useEffect(() => {
    async function getWorkspaceId() {
      if (!session?.user?.id) return;
      
      const { data } = await supabase
        .from('users')
        .select('workspace_id')
        .eq('id', session.user.id)
        .single();

      if (data?.workspace_id) {
        setWorkspaceId(data.workspace_id);
      }
    }

    getWorkspaceId();
  }, [session?.user?.id]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/login');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!searchResults.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          const result = searchResults[selectedIndex];
          navigate(`/ticket/${result.ticket_id}`);
          setSearchQuery('');
          setSelectedIndex(-1);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setSearchQuery('');
        setSelectedIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="flex h-full w-full bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">HelpDesk Pro</h1>
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
          {role && role !== 'end_user' && (
            <>
              <Link
                to="/invite"
                className={`flex items-center space-x-2 p-2 rounded-lg mb-2 ${location.pathname === "/invite" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <UserPlus size={20} />
                <span>Invite Users</span>
              </Link>
              <Link
                to="/teams"
                className={`flex items-center space-x-2 p-2 rounded-lg mb-2 ${location.pathname === "/teams" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <Users size={20} />
                <span>Teams</span>
              </Link>
            </>
          )}
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
              <div className="relative w-full max-w-xl">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedIndex(-1);
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search
                  className="absolute right-3 top-2.5 text-gray-400"
                  size={20}
                />
              </div>
              {searchQuery && (
                <div 
                  ref={resultsRef}
                  className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-auto"
                >
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((result, index) => (
                        <button
                          key={result.ticket_id}
                          onClick={() => {
                            navigate(`/ticket/${result.ticket_id}`);
                            setSearchQuery('');
                            setSelectedIndex(-1);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex flex-col border-b last:border-b-0
                            ${index === selectedIndex ? 'bg-blue-50' : ''}`}
                        >
                          <span className="font-medium text-gray-900">{result.title}</span>
                          {result.matched_comment_content ? (
                            <span className="text-sm text-gray-500 truncate">
                              Found in comment: {result.matched_comment_content}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500 truncate">
                              {result.description}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : searchQuery ? (
                    <div className="p-4 text-center text-gray-500">
                      No results found
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
        <LayoutContent>{children}</LayoutContent>
      </main>
    </div>
  );
}
