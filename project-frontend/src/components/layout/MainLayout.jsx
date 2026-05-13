import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Upload, LayoutDashboard, ClipboardList, PieChart, User, BrainCircuit, Moon, Sun, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { useResume } from '../../context/ResumeContext';
import { useState, useEffect } from 'react';

/* ── Inline SVG decorative background for the sidebar ── */
function SidebarDecor() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-15" viewBox="0 0 230 800" preserveAspectRatio="none" fill="none">
      <defs>
        <linearGradient id="sd1" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fff" stopOpacity="0.5"/>
          <stop offset="1" stopColor="#fff" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* Floating rings */}
      <circle cx="200" cy="120" r="80"  stroke="url(#sd1)" strokeWidth="1"/>
      <circle cx="200" cy="120" r="50"  stroke="url(#sd1)" strokeWidth="0.5"/>
      <circle cx="-20"  cy="600" r="120" stroke="url(#sd1)" strokeWidth="1"/>
      {/* Diagonal grid lines */}
      {[0,40,80,120,160,200,240].map(x => (
        <line key={x} x1={x} y1="0" x2={x-80} y2="800" stroke="white" strokeWidth="0.4" strokeOpacity="0.2"/>
      ))}
      {/* Dots */}
      {[[30,200],[180,350],[60,500],[150,650],[90,750]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="2.5" fill="white" opacity="0.4"/>
      ))}
      {/* Corner accent */}
      <path d="M230 0 L230 80 L150 0 Z" fill="white" opacity="0.05"/>
      <path d="M0 800 L0 720 L80 800 Z" fill="white" opacity="0.05"/>
    </svg>
  );
}

/* ── SVG mesh grid for main page background ── */
function PageBackground({ isDark }) {
  const color = isDark ? '#14B8A6' : '#E11D48';
  const opacity = isDark ? 0.04 : 0.035;
  return (
    <svg className="fixed inset-0 w-full h-full pointer-events-none z-0" style={{ opacity }}>
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke={color} strokeWidth="0.8"/>
        </pattern>
        <radialGradient id="fade" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="1"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
        <mask id="gridmask">
          <rect width="100%" height="100%" fill="url(#fade)"/>
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" mask="url(#gridmask)"/>
    </svg>
  );
}

const navItems = [
  { path: '/upload',    label: 'Upload resume',  icon: Upload,         emoji: '📄' },
  { path: '/dashboard', label: 'Dashboard',      icon: LayoutDashboard,emoji: '📊' },
  { path: '/interview', label: 'Mock interview', icon: ClipboardList,  emoji: '📝' },
  { path: '/results',   label: 'Results',        icon: PieChart,       emoji: '🏆' },
];

export function MainLayout() {
  const location   = useLocation();
  const { parsedResume } = useResume();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const next = !isDark;
    if (next) { root.classList.add('dark'); localStorage.theme = 'dark'; }
    else       { root.classList.remove('dark'); localStorage.theme = 'light'; }
    setIsDark(next);
  };

  const getPageConfig = () => {
    switch (location.pathname) {
      case '/upload':    return { title: 'Upload Resume',   subtitle: 'Start your analysis or interview session', badge: null,        emoji: '📄' };
      case '/dashboard': return { title: 'Dashboard',       subtitle: 'Detailed resume analysis breakdown',       badge: 'Active',    emoji: '📊' };
      case '/interview': return { title: 'Mock Interview',  subtitle: 'Practice with AI-generated questions',    badge: 'Live',      emoji: '📝' };
      case '/results':   return { title: 'Results',         subtitle: 'Your comprehensive feedback report',      badge: 'Complete',  emoji: '🏆' };
      default:           return { title: 'Smart Resume',    subtitle: '',                                        badge: null,        emoji: '🧠' };
    }
  };
  const { title, subtitle, badge, emoji } = getPageConfig();

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden font-sans w-full"
         style={{ background: 'var(--page-bg)' }}>

      {/* ── Animated page grid background ── */}
      <PageBackground isDark={isDark} />

      {/* ══════════ SIDEBAR ══════════ */}
      <nav className="order-last md:order-first w-full md:w-[235px] h-16 md:h-full
                      flex md:flex-col shrink-0 fixed md:static bottom-0 z-50
                      sidebar-gradient shadow-2xl overflow-hidden relative"
           style={{ boxShadow: isDark
             ? '4px 0 40px rgba(20,184,166,0.2), inset -1px 0 0 rgba(20,184,166,0.1)'
             : '4px 0 40px rgba(225,29,72,0.2), inset -1px 0 0 rgba(255,255,255,0.1)' }}>

        {/* SVG decoration inside sidebar */}
        <SidebarDecor />

        {/* Floating blobs */}
        <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full blob opacity-20"
               style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.6), transparent)' }} />
          <div className="absolute bottom-24 -left-12 w-36 h-36 rounded-full blob opacity-15"
               style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4), transparent)', animationDelay: '4s' }} />
        </div>

        {/* ── Logo ── */}
        <div className="hidden md:flex items-center px-5 py-5 relative z-10 border-b border-white/10">
          <div className="relative w-11 h-11 rounded-2xl flex items-center justify-center mr-3 shrink-0 glow-pulse"
               style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-display font-black text-[20px] tracking-tight text-white">Analyzer</div>
            <div className="flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3 h-3 text-yellow-300" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-white/60">AI Powered</span>
            </div>
          </div>
        </div>

        {/* ── Nav items ── */}
        <div className="flex md:flex-col flex-1 justify-around md:justify-start p-2 md:p-4 gap-1 relative z-10 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path}
              className={({ isActive }) => clsx(
                "flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2.5 py-2.5 md:py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "bg-white/18 border border-white/25 shadow-xl"
                  : "border border-transparent hover:bg-white/10 hover:border-white/15"
              )}>
              {({ isActive }) => (
                <>
                  {/* Active shimmer */}
                  {isActive && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                      <div className="absolute inset-0 shimmer" />
                    </div>
                  )}
                  <div className={clsx(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
                    isActive ? "bg-white/20 shadow-lg" : "bg-white/8 group-hover:bg-white/15"
                  )}>
                    <item.icon className="w-4 h-4 text-white" style={{ opacity: isActive ? 1 : 0.75 }} />
                  </div>
                  <span className={clsx(
                    "text-[10.5px] md:text-[13px] font-semibold whitespace-nowrap leading-tight",
                    isActive ? "text-white" : "text-white/65 group-hover:text-white"
                  )}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* ── User card & theme toggle ── */}
        <div className="hidden md:block relative z-10 p-4 m-4 mt-auto rounded-2xl border border-white/12 backdrop-blur-sm"
             style={{ background: 'rgba(0,0,0,0.15)' }}>

          {/* Theme toggle */}
          <button onClick={toggleTheme}
            className="flex items-center justify-between w-full p-2.5 rounded-xl mb-3 transition-all group border border-white/10 hover:bg-white/12 hover:border-white/22">
            <span className="text-[13px] font-semibold text-white/90">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                 style={{ background: isDark ? 'rgba(20,184,166,0.25)' : 'rgba(255,255,255,0.2)' }}>
              {isDark ? <Sun className="w-4 h-4 text-teal-300" /> : <Moon className="w-4 h-4 text-white/80" />}
            </div>
          </button>

          {/* User info */}
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                 style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}>
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="truncate">
              <div className="font-semibold text-white truncate text-[13px]">
                {parsedResume?.name || 'Guest User'}
              </div>
              <div className="text-[11px] text-white/50 mt-0.5">Candidate</div>
            </div>
          </div>
        </div>
      </nav>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <main className="flex-1 flex flex-col h-[calc(100vh-4rem)] md:h-screen w-full overflow-hidden relative z-10">

        {/* Header — hidden on upload page (hero header is inside the page) */}
        <header className={`h-16 md:h-20 glass border-b shrink-0 relative ${location.pathname === '/upload' ? 'hidden' : ''}`}
                style={{ borderColor: isDark ? 'rgba(20,184,166,0.15)' : 'rgba(225,29,72,0.12)' }}>
          {/* Gradient line at bottom */}
          <div className="absolute bottom-0 left-0 w-full h-[2.5px]"
               style={{ background: isDark
                 ? 'linear-gradient(90deg, transparent, #14B8A6, #06B6D4, transparent)'
                 : 'linear-gradient(90deg, transparent, #E11D48, #FB923C, #FBBF24, transparent)' }} />

          <div className="flex items-center justify-between h-full px-4 md:px-8">
            <div className="flex items-center gap-4 truncate pr-4">
              {/* Page icon */}
              <div className="hidden md:flex w-12 h-12 rounded-xl items-center justify-center text-2xl shrink-0 glass-card"
                   style={{ boxShadow: 'none' }}>
                {emoji}
              </div>
              <div className="truncate">
                <div className="flex items-center gap-3">
                  <h1 className="text-[18px] md:text-[22px] font-display font-black truncate"
                      style={{ color: 'var(--text-primary)' }}>{title}</h1>
                  {badge && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0 text-white"
                          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                                   boxShadow: '0 2px 10px var(--accent-glow)' }}>
                      {badge}
                    </span>
                  )}
                </div>
                <p className="text-[13px] hidden sm:block mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                  {subtitle}
                </p>
              </div>
            </div>

            {/* Mobile logo */}
            <div className="md:hidden flex items-center shrink-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black shadow-lg text-white"
                   style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}>
                <BrainCircuit className="w-4 h-4" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto w-full pb-16 md:pb-0 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
