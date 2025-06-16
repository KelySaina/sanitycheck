import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Activity, Home, AppWindow, LogOut, ListChecks } from "lucide-react";
import { supabase } from "../lib/supabase";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login"); // redirige vers login après déconnexion
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link
                to="/"
                className="flex items-center px-4 text-xl font-bold text-gray-900"
              >
                <Activity className="h-8 w-8 text-blue-600 mr-2" />
                SanityTracker
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                    isActive("/") && location.pathname === "/"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Home className="h-4 w-4 mr-1" />
                  Accueil
                </Link>
                <Link
                  to="/applications"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                    isActive("/applications")
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <AppWindow className="h-4 w-4 mr-1" />
                  Applications
                </Link>
                <Link
                  to="/sanity-checks"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                    isActive("/sanity-checks")
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <ListChecks className="h-4 w-4 mr-1" />
                  Sanity Checks
                </Link>
              </div>
            </div>

            {/* Bouton logout à droite */}
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                title="Se déconnecter"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
