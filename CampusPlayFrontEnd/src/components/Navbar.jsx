import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Award, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleIcon = (role) => {
    if (role === 'ADMIN') {
      return <Award className="w-4 h-4 text-blue-600" />;
    }
    return <User className="w-4 h-4 text-emerald-600" />;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <NavLink to="/" className="flex items-center gap-2 font-bold text-lg text-slate-900 tracking-tight">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white font-extrabold text-sm">CP</span>
            🏟 CampusPlay
          </NavLink>

          {/* Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {user.role === 'STUDENT' && (
                <>
                  <NavLink
                    to="/book"
                    className={({ isActive }) =>
                      `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    Book Slots
                  </NavLink>
                  <NavLink
                    to="/history"
                    className={({ isActive }) =>
                      `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    My Bookings
                  </NavLink>
                </>
              )}
              {user.role === 'ADMIN' && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  Admin Dashboard
                </NavLink>
              )}
            </nav>
          )}
        </div>

        {/* User Info & Logout */}
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700">
                {getRoleIcon(user.role)}
                <span>{user.name}</span>
              </span>

              <button
                onClick={handleLogout}
                className="p-2 border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
