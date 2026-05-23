import React, { useState, useRef, useEffect, useCallback } from "react";
import { LogOut, Bell, Search, Menu, X, MessageCircle, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../../apiConfig";

const Header = ({ searchTerm, setSearchTerm }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const notificationsRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/notifications`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.length);
      }
    } catch (err) {
      console.error("Failed to sync notifications:", err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const email = localStorage.getItem("user_email");
    if (email) setUserEmail(email);
  }, []);

  const confirmLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
    navigate("/login");
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) setUnreadCount(0);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-4 md:px-6 py-3 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-4">
          <h1 className="text-lg md:text-xl font-bold text-gray-900 cursor-pointer" onClick={() => navigate('/')}>
            Facebook Sentiment <span className="text-indigo-600">Analysis</span>
          </h1>
          <span className="hidden md:inline text-[10px] bg-gray-100 px-2 py-1 rounded-md text-gray-500 uppercase font-black tracking-widest">
            {userEmail || "User"}
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-3 relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-gray-400 top-1/2 -translate-y-1/2" size={16} />
            <input
              type="text"
              placeholder="Search analytics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-1.5 bg-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition w-64 border border-transparent focus:border-indigo-100"
            />
          </div>

          <div className="relative" ref={notificationsRef}>
            <button
              className={`relative p-2 rounded-xl transition-all duration-300 ${
                showNotifications ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'
              }`}
              onClick={toggleNotifications}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn z-50">
                <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Recent Activity
                  </h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                
                <div className="max-h-[350px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((note) => (
                      <div
                        key={note.id}
                        className="p-4 border-b border-gray-50 hover:bg-indigo-50/30 transition cursor-pointer flex gap-3 group"
                      >
                        <div className={`p-2 rounded-lg flex-shrink-0 ${
                          note.sentiment === 'negative' ? 'bg-red-50 text-red-500' : 
                          note.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <MessageCircle size={16} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-700 leading-tight group-hover:text-gray-900 transition-colors">
                            {note.title}
                          </p>
                          <span className="text-[10px] text-gray-400 font-medium mt-1 block">
                            {note.time}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                        <Bell size={20} />
                      </div>
                      <p className="text-gray-400 text-xs font-medium italic">No new activity detected</p>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-gray-50/50 text-center border-t border-gray-50">
                  <button className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition">
                    View All Activity
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>

        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`p-2 rounded-xl transition-all duration-300 ${
              mobileOpen ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-2xl border-b border-gray-100 p-4 flex flex-col gap-4 animate-slideDown lg:hidden z-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 bg-gray-100 rounded-xl text-sm w-full outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <button className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition text-sm text-gray-700 font-medium">
                <Bell size={18} className="text-gray-400" />
                Notifications
                {unreadCount > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount}</span>}
              </button>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-3 p-3 hover:bg-red-50 rounded-xl transition text-sm text-red-600 font-medium"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 animate-scaleUp overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
            
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6">
                <AlertTriangle size={32} />
              </div>
              
              <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Confirm Logout</h3>
              <p className="text-gray-500 text-sm font-medium mb-8">
                Are you sure you want to end your current session? You will need to log back in to access your dashboard.
              </p>
              
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={confirmLogout}
                  className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-sm transition-all duration-300 shadow-lg shadow-red-200"
                >
                  Yes, Sign Me Out
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
