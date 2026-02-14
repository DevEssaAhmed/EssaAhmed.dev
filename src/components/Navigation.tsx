"use client";

import { useState, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from '@/lib/router-compat';
import { Button } from '@/components/ui/button';
import {
  Menu,
  X,
  Sun,
  Moon,
  Home,
  Box,
  BookOpen,
  Layers,
  Tag,
  Info,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { HashLink } from '@/lib/hash-link-compat';
import { motion, AnimatePresence } from 'framer-motion';
const NavIcon = ({ name }: { name: string }) => {
  const map: Record<string, any> = { Home, Box, BookOpen, Layers, Tag, Info };
  const Cmp = map[name] || Home;
  return <Cmp className='w-4.5 h-4.5' />;
};

const Navigation = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { profile } = useProfile();

  const isHome = location.pathname === '/';

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Set initial state immediately (important when navigating back to home)
    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navItems = [
    { name: 'Home', path: '/', icon: 'Home' },
    { name: 'Projects', path: '/projects', icon: 'Box' },
    { name: 'Articles', path: '/articles', icon: 'BookOpen' },
    { name: 'Categories', path: '/categories', icon: 'Layers' },
    { name: 'Series', path: '/series', icon: 'Layers' },
    { name: 'Tags', path: '/tags', icon: 'Tag' },
    { name: 'About', path: '/about', icon: 'Info' },
  ];

  const navBase =
    isHome && !scrolled
      ? 'bg-transparent border-transparent'
      : 'bg-background/70 backdrop-blur-xl border-b border-border';

  // IMPORTANT: AnimatePresence expects ReactElements, not a ReactPortal.
  // So we portal a subtree that contains AnimatePresence.
  const mobileMenu =
    typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence mode='wait'>
            {isOpen ? (
              <>
                {/* Backdrop */}
                <motion.div
                  key='mobile-nav-backdrop'
                  className='fixed inset-0 bg-black/60 backdrop-blur-sm'
                  style={{ zIndex: 9998 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setIsOpen(false)}
                  aria-hidden='true'
                />

                {/* Menu Panel */}
                <motion.div
                  key='mobile-nav-panel'
                  className='fixed top-0 right-0 bottom-0 w-[320px] max-w-[85vw] bg-background border-l border-border shadow-2xl'
                  style={{ zIndex: 9999 }}
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  role='dialog'
                  aria-modal='true'
                  aria-label='Mobile navigation menu'
                >
                  <div className='h-full flex flex-col overflow-hidden'>
                    {/* Header */}
                    <div className='flex items-center justify-between p-4 border-b border-border bg-muted/30'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center'>
                          <Menu className='w-5 h-5 text-primary' />
                        </div>
                        <span className='font-bold text-base text-foreground'>Menu</span>
                      </div>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setIsOpen(false)}
                        className='hover:bg-muted rounded-xl'
                        aria-label='Close navigation menu'
                      >
                        <X className='w-5 h-5' />
                      </Button>
                    </div>

                    {/* Navigation Items */}
                    <div className='flex-1 overflow-y-auto overscroll-contain p-3 space-y-1'>
                      {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <button
                            key={item.name}
                            onClick={() => {
                              setIsOpen(false);
                              navigate(item.path);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                              isActive
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-muted text-foreground/80 hover:text-foreground'
                            }`}
                          >
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                                isActive
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted/50'
                              }`}
                            >
                              <NavIcon name={item.icon} />
                            </div>
                            <span className='text-sm font-medium'>{item.name}</span>
                            {isActive && (
                              <motion.div
                                className='ml-auto w-1.5 h-1.5 rounded-full bg-primary'
                                layoutId='activeDot'
                                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Action Buttons */}
                    <div className='p-4 border-t border-border bg-muted/30 space-y-2'>
                      <HashLink smooth to='/#contact' className='block'>
                        <Button
                          size='default'
                          className='w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all'
                          onClick={() => setIsOpen(false)}
                          aria-label='Contact me for hiring'
                        >
                          ðŸ’¼ Hire Me
                        </Button>
                      </HashLink>
                      {user && (
                        <Button
                          size='default'
                          variant='outline'
                          className='w-full rounded-xl font-medium border-border hover:bg-muted transition-all'
                          onClick={() => {
                            setIsOpen(false);
                            navigate('/admin');
                          }}
                          aria-label='Go to admin dashboard'
                        >
                          âš™ï¸ Admin Panel
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </>
            ) : null}
          </AnimatePresence>,
          document.body
        )
      : null;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[1000] isolate text-foreground transition-all duration-300 ${navBase}`}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          <button
            className='font-extrabold text-lg sm:text-xl bg-gradient-primary bg-clip-text text-transparent tracking-tight hover:scale-[1.02] transition-transform truncate max-w-[150px] sm:max-w-none'
            onClick={() => navigate('/')}
            aria-label="Navigate to home page"
          >
            {profile?.name || 'Portfolio'}
          </button>

          {/* Desktop Navigation */}
          <div className='hidden lg:flex items-center gap-1'>
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className='group relative text-foreground/80 hover:text-primary font-medium transition-all duration-300 text-sm tracking-wide px-2 xl:px-3 py-2 rounded-lg hover:bg-primary/5'
                aria-label={`Navigate to ${item.name}`}
              >
                <span className='absolute inset-x-2 -bottom-[1px] h-px bg-gradient-primary opacity-0 group-hover:opacity-80 transition-opacity' />
                <span className='hidden xl:inline'>{item.name.toUpperCase()}</span>
                <span className='xl:hidden'>{item.name}</span>
              </button>
            ))}
          </div>

          {/* Theme toggle & CTAs */}
          <div className='hidden lg:flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              onClick={toggleTheme}
              className='hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-lg'
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className='w-5 h-5' />
              ) : (
                <Moon className='w-5 h-5' />
              )}
            </Button>
            <HashLink smooth to='/#contact'>
              <Button
                size='sm'
                className='bg-gradient-primary hover:shadow-soft transition-all duration-300 rounded-lg'
                aria-label="Contact me for hiring"
              >
                <span className='hidden xl:inline'>Hire Me</span>
                <span className='xl:hidden'>Hire</span>
              </Button>
            </HashLink>
            {user && (
              <Button
                size='sm'
                variant='outline'
                onClick={() => navigate('/admin')}
                className='hover:shadow-soft transition-all duration-300 rounded-lg'
                aria-label="Go to admin dashboard"
              >
                Admin
              </Button>
            )}
          </div>

          {/* Mobile toggles */}
          <div className='flex items-center gap-2 lg:hidden'>
            <Button
              variant='ghost'
              size='icon'
              onClick={toggleTheme}
              className='hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-lg'
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className='w-4 h-4' />
              ) : (
                <Moon className='w-4 h-4' />
              )}
            </Button>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setIsOpen(!isOpen)}
              className='rounded-lg relative z-50'
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isOpen ? (
                <X className='w-5 h-5' />
              ) : (
                <Menu className='w-5 h-5' />
              )}
            </Button>
          </div>
        </div>

      </div>
      {mobileMenu}
    </nav>
    </>
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;


