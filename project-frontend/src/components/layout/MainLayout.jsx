import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Upload, LayoutDashboard, Mic, PieChart, User, BrainCircuit, Moon, Sun } from 'lucide-react';
import { clsx } from 'clsx';
import { useResume } from '../../context/ResumeContext';
import { useState, useEffect } from 'react';

const navItems = [
  { path: '/upload', label: 'Upload resume', icon: Upload },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/interview', label: 'Mock interview', icon: Mic },
  { path: '/results', label: 'Results', icon: PieChart },
];

export function MainLayout() {
  const location = useLocation();
  const { parsedResume } = useResume();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial state from classList (set by index.html script)
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      root.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  const getPageConfig = () => {
    switch (location.pathname) {
      case '/upload': return { title: 'Upload Resume', subtitle: 'Start your analysis or interview session', badge: null };
      case '/dashboard': return { title: 'Dashboard', subtitle: 'Detailed resume analysis breakdown', badge: 'Active' };
      case '/interview': return { title: 'Mock Interview', subtitle: 'Practice with AI-generated questions', badge: 'Active' };
      case '/results': return { title: 'Results', subtitle: 'Your comprehensive feedback report', badge: 'Completed' };
      default: return { title: 'Smart Resume', subtitle: '', badge: null };
    }
  };

  const { title, subtitle, badge } = getPageConfig();

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F4F6FB] dark:bg-slate-950 font-sans overflow-hidden transition-colors duration-300 w-full">
      {/* Sidebar - left on desktop, bottom on mobile */}
      <nav className="order-last md:order-first w-full md:w-[220px] h-16 md:h-full glass border-t md:border-t-0 md:border-r border-[0.5px] border-white/50 dark:border-slate-700/50 flex md:flex-col justify-between shrink-0 fixed md:static bottom-0 z-50">
        
        <div className="hidden md:flex items-center p-6 border-b border-[0.5px] border-white/40">
          <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-primary to-purple-500 text-white flex items-center justify-center shadow-lg shadow-brand-primary/20 mr-3 shrink-0 group">
            <BrainCircuit className="w-5 h-5 absolute z-10 transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-extrabold text-gradient text-[19px] tracking-tight">Analyzer</span>
        </div>

        <div className="flex md:flex-col flex-1 justify-around md:justify-start p-2 md:p-4 gap-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => clsx(
                "flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 py-2 md:py-3 rounded-xl transition-colors",
                isActive 
                  ? "bg-brand-light dark:bg-brand-primary/20 text-brand-primary dark:text-brand-light font-medium border border-transparent dark:border-brand-primary/30 shadow-sm" 
                  : "text-brand-mid dark:text-gray-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-brand-dark dark:hover:text-gray-200 border border-transparent"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] md:text-sm whitespace-nowrap">{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="hidden md:flex flex-col gap-2 p-4 m-4 mt-auto rounded-2xl glass-card shrink-0">
          <button 
            onClick={toggleTheme}
            className="flex items-center justify-between p-2 rounded-xl bg-white/50 dark:bg-slate-800/80 hover:bg-white/80 dark:hover:bg-slate-700/80 transition-colors border border-white/40 dark:border-slate-600/50 cursor-pointer"
          >
            <span className="text-sm text-brand-dark dark:text-gray-200 font-medium ml-1">Theme</span>
            <div className="w-8 h-8 rounded-lg bg-brand-light dark:bg-slate-700 flex items-center justify-center text-brand-primary dark:text-brand-light shadow-sm">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </div>
          </button>
          
          <div className="flex items-center p-2">
            <div className="w-8 h-8 rounded-full bg-brand-light dark:bg-slate-700 flex items-center justify-center text-brand-primary dark:text-gray-200 mr-3 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="text-xs truncate w-full">
              <div className="font-medium text-brand-dark dark:text-gray-100 truncate">{parsedResume?.name || 'Guest User'}</div>
              <div className="text-brand-mid dark:text-slate-400 truncate">Candidate</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[calc(100vh-4rem)] md:h-screen w-full overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 md:h-20 glass border-b border-[0.5px] border-white/50 dark:border-slate-700/50 flex items-center px-4 md:px-8 shrink-0 z-10 w-full relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white dark:via-slate-600 to-transparent" />
          <div className="flex items-center justify-between w-full relative z-10">
            <div className="truncate pr-4">
              <div className="flex items-center gap-3">
                <h1 className="text-lg md:text-xl font-bold text-brand-dark dark:text-gray-100 truncate">{title}</h1>
                {badge && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r from-brand-light dark:from-slate-800 to-white dark:to-slate-700 text-brand-primary dark:text-brand-light border border-white dark:border-slate-600 shadow-sm shrink-0 uppercase tracking-widest">
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-brand-mid dark:text-gray-400 hidden sm:block mt-0.5 truncate">{subtitle}</p>
            </div>
            
            <div className="md:hidden flex items-center shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-primary to-purple-500 text-white flex items-center justify-center font-bold shadow-md">
                {parsedResume?.name?.substring(0,2).toUpperCase() || <BrainCircuit className="w-4 h-4" />}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto w-full pb-16 md:pb-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
