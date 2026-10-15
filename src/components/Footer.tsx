"use client";

import Link from 'next/link';
import {
  Database,
  Link as LinkIcon,
  Terminal,
  AtSign,
  CheckCircle2,
  Twitter,
  Globe,
} from 'lucide-react';
import { useProfile } from '@/contexts/ProfileContext';

const Footer = () => {
  const { profile } = useProfile();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Data Projects', href: '/projects' },
    { name: 'Architecture Notes', href: '/articles' },
    { name: 'About & Resume', href: '/about' },
  ];

  const capabilities = [
    'dbt & Data Modeling',
    'Warehouse Architecture',
    'Telemetry & Metrics Layer',
    'BI & Executive Cockpits',
  ];

  const connect = [
    ...(profile?.linkedin_url ? [{ name: 'LinkedIn', href: profile.linkedin_url, icon: LinkIcon, external: true }] : []),
    ...(profile?.github_url ? [{ name: 'GitHub', href: profile.github_url, icon: Terminal, external: true }] : []),
    ...(profile?.twitter_url ? [{ name: 'Twitter', href: profile.twitter_url, icon: Twitter, external: true }] : []),
    ...(profile?.website_url ? [{ name: 'Website', href: profile.website_url, icon: Globe, external: true }] : []),
    { name: 'Email Contact', href: profile?.email ? `mailto:${profile.email}` : '/#contact', icon: AtSign, external: false },
  ];

  return (
    <footer className="w-full bg-surface-lowest border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-surface-high border border-border flex items-center justify-center text-champagne">
                <Database className="w-[18px] h-[18px]" />
              </div>
              <span className="font-display text-base font-bold text-white tracking-tight">
                {profile?.name || 'Essa Ahmed'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-ink-soft font-light max-w-sm leading-relaxed">
              {profile?.bio ||
                'Senior Analytics Engineer specializing in enterprise decision systems, scalable data transformation, and reliable warehouse modeling. Turning operational data into trusted telemetry.'}
            </p>
            <div className="flex items-center gap-2 font-mono text-xs text-tertiary mt-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Production Pipelines Operational</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-3">
            <span className="font-display text-sm font-semibold text-white tracking-wide">Navigation</span>
            <ul className="flex flex-col gap-2.5 text-xs text-ink-soft font-light">
              {navigation.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-champagne transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Capabilities */}
          <div className="flex flex-col gap-3">
            <span className="font-display text-sm font-semibold text-white tracking-wide">Capabilities</span>
            <ul className="flex flex-col gap-2.5 text-xs text-ink-soft font-light">
              {capabilities.map((item) => (
                <li key={item}>
                  <span className="hover:text-white transition-colors">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="flex flex-col gap-3">
            <span className="font-display text-sm font-semibold text-white tracking-wide">Connect</span>
            <ul className="flex flex-col gap-2.5 text-xs text-ink-soft font-light">
              {connect.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 hover:text-champagne transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{link.name}</span>
                      </a>
                    ) : (
                      <a
                        href={link.href}
                        className="flex items-center gap-1.5 hover:text-champagne transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{link.name}</span>
                      </a>
                    )}
                  </li>
                );
              })}
              {profile?.location && (
                <li>
                  <span className="font-mono text-[11px] text-ink-muted mt-1 block">{profile.location}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-ink-muted">
          <p>
            © {new Date().getFullYear()} {profile?.name || 'Essa Ahmed'}. Analytics Architecture &amp; Engineering. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-champagne" />
              <span>Data-first Precision</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
              <span>99.9% Uptime SLA</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
