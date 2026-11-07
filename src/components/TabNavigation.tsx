import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LayoutGrid,
  PenTool,
  User2,
  ExternalLink,
  Github,
  MapPin,
  Mail,
  Globe,
  Linkedin,
} from 'lucide-react';
import RecentProjects from '@/components/home/RecentProjects';
import RecentArticles from '@/components/RecentArticles';
import { useProfile } from '@/contexts/ProfileContext';
import { cn } from '@/lib/utils';

interface TabNavigationProps {
  className?: string;
  initialProjects?: any[];
  initialProjectCategories?: string[];
  initialArticles?: any[];
}

const TabNavigation = ({
  className = '',
  initialProjects,
  initialProjectCategories,
  initialArticles,
}: TabNavigationProps) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'articles' | 'about'>(
    'projects'
  );

  const tabs = [
    { id: 'projects' as const, label: 'PROJECTS', badge: 'REPOS', icon: LayoutGrid },
    { id: 'articles' as const, label: 'ARTICLES', badge: 'DOCS', icon: PenTool },
    { id: 'about' as const, label: 'ABOUT', badge: 'BIO', icon: User2 },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'projects':
        return (
          <div
            id="tabpanel-projects"
            role="tabpanel"
            aria-labelledby="tab-projects"
            className="animate-fade-up"
          >
            <RecentProjects
              showAll={false}
              initialProjects={initialProjects}
              initialCategories={initialProjectCategories}
            />
          </div>
        );
      case 'articles':
        return (
          <div
            id="tabpanel-articles"
            role="tabpanel"
            aria-labelledby="tab-articles"
            className="animate-fade-up"
          >
            <RecentArticles
              showAll={false}
              initialArticles={initialArticles}
            />
          </div>
        );
      case 'about':
        return (
          <div
            id="tabpanel-about"
            role="tabpanel"
            aria-labelledby="tab-about"
            className="animate-fade-up"
          >
            <AboutSection />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Navigation Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
        <div className="flex items-center justify-center">
          <div
            role="tablist"
            aria-label="Portfolio sections"
            className="flex items-center gap-1.5 sm:gap-2 bg-surface-container-low/90 backdrop-blur-xl border border-outline-variant/60 rounded-2xl p-1.5 sm:p-2 shadow-ambient overflow-x-auto max-w-full scrollbar-none"
          >
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "shrink-0 flex items-center gap-2 sm:gap-3 px-3.5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold tracking-wider transition-all duration-200 whitespace-nowrap",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                    isActive
                      ? "bg-primary text-on-primary shadow-md border border-primary"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60 border border-transparent hover:border-outline-variant/60"
                  )}
                >
                  <IconComponent className="w-4 h-4 shrink-0" />
                  <span className="font-sans">{tab.label}</span>
                  <span
                    className={cn(
                      "font-mono text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded transition-colors",
                      isActive
                        ? "bg-on-primary/15 text-on-primary font-bold"
                        : "bg-surface-container-high text-on-surface-variant border border-outline-variant/60"
                    )}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">{renderTabContent()}</div>
    </div>
  );
};

const AboutSection = () => {
  const { profile } = useProfile();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* About Content Card */}
        <Card className="bg-surface-container-low/90 backdrop-blur-md border border-outline-variant/40 hover:border-primary/40 transition-colors duration-300 rounded-2xl shadow-ambient">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <User2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-on-surface">About Me</h2>
                <p className="text-xs font-mono text-primary/80 tracking-wide uppercase mt-0.5">
                  ANALYTICS ENGINEERING & ARCHITECTURE
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-base text-on-surface-variant leading-relaxed">
                {profile?.bio ||
                  'I write about data, build dashboards, and turn insights into action.'}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-on-surface-variant pt-1">
                {profile?.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary/80" />
                    {profile.location}
                  </span>
                )}
                {profile?.title && (
                  <>
                    <span className="text-outline-variant">•</span>
                    <span className="text-on-surface font-medium">{profile.title}</span>
                  </>
                )}
              </div>

              {Array.isArray(profile?.skills) && profile!.skills.length > 0 && (
                <div className="pt-2 border-t border-outline-variant/40">
                  <div className="text-xs font-mono text-on-surface-variant mb-3 uppercase tracking-wider">
                    Core Technical Competencies
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile!.skills.slice(0, 16).map((skill: string) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="font-mono text-xs px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant border-outline-variant/40 hover:border-primary/40 transition-colors"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Links Card */}
        <Card className="bg-surface-container-low/90 backdrop-blur-md border border-outline-variant/40 hover:border-primary/40 transition-colors duration-300 rounded-2xl shadow-ambient">
          <CardContent className="p-6 sm:p-8">
            <h3 className="text-xl font-display font-bold text-on-surface mb-6 flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" />
              Connect With Me
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-surface-container/60 hover:bg-surface-container border border-outline-variant/40 hover:border-primary/40 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary group-hover:border-primary/40 transition-colors shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-on-surface group-hover:text-primary transition-colors">
                      Email
                    </p>
                    <p className="text-xs font-mono text-on-surface-variant truncate">
                      {profile.email}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-auto text-on-surface-variant group-hover:text-primary transition-colors shrink-0" />
                </a>
              )}

              {profile?.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-surface-container/60 hover:bg-surface-container border border-outline-variant/40 hover:border-primary/40 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary group-hover:border-primary/40 transition-colors shrink-0">
                    <Linkedin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-on-surface group-hover:text-primary transition-colors">
                      LinkedIn
                    </p>
                    <p className="text-xs font-mono text-on-surface-variant">
                      Professional Network
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-auto text-on-surface-variant group-hover:text-primary transition-colors shrink-0" />
                </a>
              )}

              {profile?.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-surface-container/60 hover:bg-surface-container border border-outline-variant/40 hover:border-primary/40 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary group-hover:border-primary/40 transition-colors shrink-0">
                    <Github className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-on-surface group-hover:text-primary transition-colors">
                      GitHub
                    </p>
                    <p className="text-xs font-mono text-on-surface-variant">
                      Repositories & Code
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-auto text-on-surface-variant group-hover:text-primary transition-colors shrink-0" />
                </a>
              )}

              {profile?.website_url && (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-surface-container/60 hover:bg-surface-container border border-outline-variant/40 hover:border-primary/40 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary group-hover:border-primary/40 transition-colors shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-on-surface group-hover:text-primary transition-colors">
                      Website
                    </p>
                    <p className="text-xs font-mono text-on-surface-variant">
                      Portfolio & Telemetry
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-auto text-on-surface-variant group-hover:text-primary transition-colors shrink-0" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TabNavigation;
