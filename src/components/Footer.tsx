"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Github,
  Linkedin,
  Twitter,
  Mail,
  Heart,
  ArrowUp,
  Code,
  Database,
  BarChart3,
  Palette,
  Globe
} from 'lucide-react';
import { useProfile } from '@/contexts/ProfileContext';

const Footer = () => {
  const { profile } = useProfile();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Projects', href: '/projects' },
    { name: 'Articles', href: '/articles' },
    { name: 'About', href: '/about' },
  ];

  const services = [
    { name: 'Data Analysis', icon: BarChart3 },
    { name: 'Python Development', icon: Code },
    { name: 'Database Design', icon: Database },
    { name: 'Data Visualization', icon: Palette },
  ];

  const socialLinks = [
    ...(profile?.github_url ? [{ name: 'GitHub', href: profile.github_url, icon: Github, color: 'hover:text-gray-900 dark:hover:text-gray-100' }] : []),
    ...(profile?.linkedin_url ? [{ name: 'LinkedIn', href: profile.linkedin_url, icon: Linkedin, color: 'hover:text-blue-600' }] : []),
    ...(profile?.website_url ? [{ name: 'Website', href: profile.website_url, icon: Globe, color: 'hover:text-green-500' }] : []),
    ...(profile?.email ? [{ name: 'Email', href: `mailto:${profile.email}`, icon: Mail, color: 'hover:text-red-500' }] : []),
    ...(profile?.twitter_url ? [{ name: 'Twitter', href: profile.twitter_url, icon: Twitter, color: 'hover:text-sky-500' }] : []),
  ];

  return (
    <footer className="bg-background border-t border-border/50 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Compact Footer Content */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center">
                <BarChart3 className="w-4.5 h-4.5 text-white" />
              </div>
              <h3 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                {profile?.name || 'Portfolio'}
              </h3>
            </div>
            <p className="text-sm text-foreground/70 mb-4 leading-relaxed">
              {profile?.bio || 'Selected work and writing on data analysis and development.'}
            </p>
            <div className="flex gap-2">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-9 h-9 rounded-md bg-muted/30 hover:bg-muted/50 flex items-center justify-center transition-all duration-300 ${link.color}`}
                    aria-label={link.name}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/70 hover:text-primary transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">Services</h4>
            <ul className="space-y-2">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <li key={service.name} className="flex items-center gap-2 text-sm">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-foreground/70">{service.name}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/30 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-foreground/70">
            <span>Â© {new Date().getFullYear()} {profile?.name || 'Portfolio'}. Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
            <span>Next JS & TypeScript</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={scrollToTop}
            className="hover:shadow-soft transition-all duration-300"
          >
            <ArrowUp className="w-4 h-4 mr-2" /> Back to Top
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
