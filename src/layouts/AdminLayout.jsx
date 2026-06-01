import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  Wrench,
  MessageSquareQuote,
  Mail,
  Calendar,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';

// Map each admin route → its matching public page URL + label
const PREVIEW_MAP = {
  '/admin/dashboard':    { url: '/',              label: 'Home' },
  '/admin':              { url: '/',              label: 'Home' },
  '/admin/projects':     { url: '/projects',      label: 'Projects Page' },
  '/admin/services':     { url: '/services',      label: 'Services Page' },
  '/admin/testimonials': { url: '/testimonials',  label: 'Testimonials Page' },
  '/admin/inquiries':    { url: '/contact',       label: 'Contact Page' },
  '/admin/bookings':     { url: '/booking',       label: 'Booking Page' },
};

const sidebarLinks = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard',         preview: '/' },
  { href: '/admin/projects',  icon: FolderKanban,    label: 'Projects',          preview: '/projects' },
  { href: '/admin/services',  icon: Wrench,          label: 'Services',          preview: '/services' },
  { href: '/admin/testimonials', icon: MessageSquareQuote, label: 'Testimonials', preview: '/testimonials' },
  { href: '/admin/inquiries', icon: Mail,            label: 'Contact Inquiries', preview: '/contact' },
  { href: '/admin/bookings',  icon: Calendar,        label: 'Bookings',          preview: '/booking' },
];

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [previewToast,  setPreviewToast]  = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (href) => {
    if (href === '/admin/dashboard') {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    }
    return location.pathname === href;
  };

  // Work out which public page to preview based on current admin path
  const currentPreview =
    PREVIEW_MAP[location.pathname] ||
    PREVIEW_MAP['/admin/dashboard'];

  const handlePreview = () => {
    // Open public page in new tab — admin session in this tab is untouched
    const base = window.location.origin;
    window.open(base + currentPreview.url, '_blank', 'noopener,noreferrer');
    // Show brief toast confirmation
    setPreviewToast(true);
    setTimeout(() => setPreviewToast(false), 2500);
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ── Mobile Sidebar Overlay ─────────────────────────────────────── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 w-64 bg-card border-r border-border z-50 transform transition-transform duration-300 lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">

          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <Link to="/admin" className="flex items-center gap-2">
              <span className="text-xl font-serif font-bold text-primary">Modplint</span>
              <span className="text-xl font-serif font-light text-foreground">Admin</span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav links — each has a tiny "eye" preview icon */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <div key={link.href} className="flex items-center gap-1">
                  <Link
                    to={link.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      'flex-1 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )}
                  >
                    <link.icon className="w-5 h-5 flex-shrink-0" />
                    {link.label}
                    {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Link>

                  {/* Per-row quick preview icon — always visible on hover */}
                  <a
                    href={link.preview}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Preview ${link.label} on website`}
                    className="p-2 rounded-lg text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    style={{ opacity: active ? 1 : undefined }}
                    tabIndex={0}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-semibold">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground">{user?.name || 'Admin'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || 'admin@modplint.com'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <div className="lg:pl-64">

        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between h-full px-4 lg:px-8 gap-3">

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/admin" className="hover:text-foreground transition-colors">Admin</Link>
              {location.pathname !== '/admin' && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-foreground capitalize">
                    {location.pathname.split('/').pop()?.replace('-', ' ')}
                  </span>
                </>
              )}
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-2 ml-auto">

              {/* ── PREVIEW BUTTON ── */}
              <button
                onClick={handlePreview}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  'bg-gold/10 text-gold border border-gold/30',
                  'hover:bg-gold hover:text-charcoal hover:border-gold',
                  'active:scale-95'
                )}
                title={`Open ${currentPreview.label} in a new tab`}
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Preview {currentPreview.label}</span>
                <span className="sm:hidden">Preview</span>
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* ── Preview toast notification ────────────────────────────────── */}
      <AnimatePresence>
        {previewToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 20,  scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-charcoal text-white px-5 py-3 rounded-2xl shadow-2xl border border-gold/30"
          >
            <ExternalLink className="w-4 h-4 text-gold flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">
                Opening <span className="text-gold">{currentPreview.label}</span>
              </p>
              <p className="text-xs text-white/60">You stay logged in on this tab</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
