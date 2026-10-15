"use client";

import { useState, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useLocation } from '@/lib/router-compat';
import { Button } from '@/components/ui/button';
import {
  Menu,
  X,
  Home,
  Box,
  BookOpen,
  Info,
  Network,
  User,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { HashLink } from '@/lib/hash-link-compat';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const NavIcon = ({ name }: { name: string }) => {
  const map: Record<string, any> = { Home, Box, BookOpen, Info };
  const Cmp = map[name] || Home;
  return <Cmp className='w-4 h-4' />;
};

const navItems = [
  { name: 'Home', path: '/', icon: 'Home' },
  { name: 'Projects', path: '/projects', icon: 'Box' },
  { name: 'Articles', path: '/articles', icon: 'BookOpen' },
  { name: 'About', path: '/about', icon: 'Info' },
];

const Navigation = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { profile } = useProfile();
  const prefersReducedMotion = useReducedMotion();

  const isActivePath = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Close mobile menu if window resizes to desktop breakpoint (>= 768px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

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

  // IMPORTANT: AnimatePresence expects ReactElements, not a ReactPortal.
  // So we portal a subtree that contains AnimatePresence.
  const mobileMenu =
    mounted && typeof document !== 'undefined'
      ? createPortal(
        <AnimatePresence mode='wait'>
          {isOpen ? (
            <>
              {/* Backdrop with touch lock */}
              <motion.div
                key='mobile-nav-backdrop'
                className='fixed inset-0 bg-black/75 backdrop-blur-sm touch-none'
                style={{ zIndex: 9998 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                onClick={() => setIsOpen(false)}
                aria-hidden='true'
              />

              {/* Menu Panel */}
              <motion.div
                key='mobile-nav-panel'
                className='fixed top-0 right-0 bottom-0 h-full w-[320px] max-w-[85vw] bg-surface border-l border-border shadow-2xl flex flex-col'
                style={{ zIndex: 9999 }}
                initial={prefersReducedMotion ? { opacity: 0 } : { x: '100%' }}
                animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { x: '100%' }}
                transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', damping: 30, stiffness: 300 }}
                id='mobile-navigation'
                role='dialog'
                aria-modal='true'
                aria-label='Mobile navigation menu'
              >
                <div className='h-full flex flex-col overflow-hidden'>
                  {/* Drawer Header (64px / h-16) */}
                  <div className='h-16 flex items-center justify-between px-5 border-b border-border bg-surface-low shrink-0'>
                    <div className='flex items-center gap-3'>
                      <div className='w-9 h-9 rounded-md bg-surface-high border border-border flex items-center justify-center text-champagne'>
                        <Network className='w-[18px] h-[18px]' />
                      </div>
                      <div className='flex flex-col'>
                        <span className='font-display text-sm font-semibold text-platinum'>
                          {profile?.name || 'Essa Ahmed'}
                        </span>
                        <span className='font-mono text-[10px] uppercase tracking-[0.2em] text-champagne-dim'>
                          Analytics Engineer
                        </span>
                      </div>
                    </div>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => setIsOpen(false)}
                      className='hover:bg-surface-high text-platinum hover:text-white rounded-lg'
                      aria-label='Close navigation menu'
                    >
                      <X className='w-5 h-5' />
                    </Button>
                  </div>

                  {/* Navigation Items */}
                  <div className='flex-1 overflow-y-auto overscroll-contain p-4 space-y-1.5'>
                    <div className='px-2 py-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-ink-soft'>
                      Navigation
                    </div>
                    {navItems.map((item) => {
                      const isActive = isActivePath(item.path);
                      return (
                        <Link
                          key={item.name}
                          onClick={() => setIsOpen(false)}
                          href={item.path}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border ${isActive
                              ? 'bg-surface-high border-border text-champagne font-medium'
                              : 'border-transparent hover:bg-surface-container text-platinum/70 hover:text-white'
                            }`}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isActive
                                ? 'bg-champagne text-[#090c13] shadow-sm'
                                : 'bg-surface-container border border-border text-platinum/80'
                              }`}
                          >
                            <NavIcon name={item.icon} />
                          </div>
                          <span className='text-sm tracking-wide'>{item.name}</span>
                          {isActive && (
                            <motion.div
                              className='ml-auto w-2 h-2 rounded-full bg-champagne'
                              layoutId='activeDot'
                              transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', damping: 20, stiffness: 300 }}
                            />
                          )}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Drawer Footer / Action Buttons */}
                  <div className='p-4 border-t border-border bg-surface-low space-y-2 shrink-0'>
                    <HashLink smooth to='/#contact' className='block' onClick={() => setIsOpen(false)}>
                      <Button
                        size='default'
                        className='w-full bg-champagne hover:bg-white text-[#090c13] rounded-lg font-semibold transition-all'
                        aria-label='Get in touch'
                      >
                        Get in Touch
                      </Button>
                    </HashLink>
                    <Button asChild size='default' variant='outline' className='w-full rounded-lg font-medium border-border bg-surface-container hover:bg-surface-high text-platinum hover:text-white transition-all'>
                      <Link
                        href='/admin'
                        onClick={() => setIsOpen(false)}
                        aria-label={user ? 'Go to admin dashboard' : 'Go to admin login'}
                      >
                        {user ? 'Admin Panel' : 'Admin Login'}
                      </Link>
                    </Button>
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
        className='fixed top-0 left-0 right-0 z-[1000] isolate text-foreground bg-surface/80 backdrop-blur-2xl border-b border-border'
        aria-label="Main Navigation"
      >
        <div className='h-16 md:h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between'>
          {/* Brand + availability */}
          <div className='flex items-center gap-8 min-w-0'>
            <Link
              href='/'
              className='flex items-center gap-3 group min-w-0'
              aria-label="Navigate to home page"
            >
              <div className='w-9 h-9 shrink-0 rounded-md bg-surface-high border border-border flex items-center justify-center text-champagne group-hover:border-champagne/40 transition-colors'>
                <Network className='w-[19px] h-[19px]' />
              </div>
              <div className='flex flex-col min-w-0'>
                <span className='font-display text-[15px] font-semibold text-platinum tracking-tight truncate'>
                  {profile?.name || 'Essa Ahmed'}
                </span>
                <span className='font-mono text-[11px] text-champagne-dim tracking-wider uppercase'>
                  Analytics Engineer
                </span>
              </div>
            </Link>
            <div className='hidden xl:flex items-center gap-2 pl-4 border-l border-border'>
              <span className='w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse' />
              <span className='font-mono text-[11px] text-ink-soft tracking-wide'>
                Available for enterprise analytics roles &amp; advisory
              </span>
            </div>
          </div>

          <div className='flex items-center gap-8'>
            {/* Desktop Navigation */}
            <div className='hidden md:flex items-center gap-7'>
              {navItems.map((item) => {
                const active = isActivePath(item.path);
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`text-[13px] font-medium tracking-wide pb-1 transition-colors ${active
                        ? 'text-champagne border-b-2 border-champagne'
                        : 'text-platinum/70 hover:text-white border-b-2 border-transparent'
                      }`}
                    aria-label={`Navigate to ${item.name}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Desktop CTAs */}
            <div className='hidden md:flex items-center gap-3'>
              <HashLink smooth to='/#contact'>
                <span
                  className='inline-flex px-4 py-2 rounded-lg bg-surface-high border border-border hover:border-champagne/40 text-platinum text-[13px] font-medium tracking-wide transition-all'
                  aria-label="Get in touch"
                >
                  Get in Touch
                </span>
              </HashLink>
              <Link
                href='/admin'
                className='w-8 h-8 rounded-full bg-surface-high border border-border flex items-center justify-center text-ink-soft hover:text-champagne transition-colors'
                aria-label={user ? 'Go to admin dashboard' : 'Admin login'}
              >
                <User className='w-[17px] h-[17px]' />
              </Link>
            </div>

            {/* Mobile toggle */}
            <div className='flex items-center gap-2 md:hidden'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setIsOpen(!isOpen)}
                className='rounded-lg relative z-50 text-foreground hover:bg-surface-high hover:text-champagne transition-colors'
                aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-controls='mobile-navigation'
                aria-expanded={isOpen}
              >
                {isOpen ? (
                  <X className='w-5 h-5 text-champagne' />
                ) : (
                  <Menu className='w-5 h-5 text-platinum' />
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
