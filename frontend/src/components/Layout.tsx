
import { Outlet, NavLink } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-emerald-500/30">
      <nav className="border-b border-gray-800 bg-black/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo area */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xl font-bold tracking-tighter italic">
                GAP<span className="text-emerald-500">WRAP</span>
              </span>
            </div>

            {/* Navigation Links */}
            <div className="flex space-x-1 md:space-x-8">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all duration-200 px-3 py-1 rounded hover:bg-gray-800/50 ${isActive ? 'text-emerald-400 border border-emerald-500/30 bg-emerald-900/10' : 'text-gray-500 hover:text-gray-300 border border-transparent'
                  }`
                }
              >
                Protocol Info
              </NavLink>
              <NavLink
                to="/slippage-estimates"
                className={({ isActive }) =>
                  `text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all duration-200 px-3 py-1 rounded hover:bg-gray-800/50 ${isActive ? 'text-emerald-400 border border-emerald-500/30 bg-emerald-900/10' : 'text-gray-500 hover:text-gray-300 border border-transparent'
                  }`
                }
              >
                Slippage
              </NavLink>
              <NavLink
                to="/best-practices"
                className={({ isActive }) =>
                  `text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all duration-200 px-3 py-1 rounded hover:bg-gray-800/50 ${isActive ? 'text-emerald-400 border border-emerald-500/30 bg-emerald-900/10' : 'text-gray-500 hover:text-gray-300 border border-transparent'
                  }`
                }
              >
                Assistant
              </NavLink>
              <NavLink
                to="/sources"
                className={({ isActive }) =>
                  `text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all duration-200 px-3 py-1 rounded hover:bg-gray-800/50 ${isActive ? 'text-emerald-400 border border-emerald-500/30 bg-emerald-900/10' : 'text-gray-500 hover:text-gray-300 border border-transparent'
                  }`
                }
              >
                Sources
              </NavLink>
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;