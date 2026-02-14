import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import RecentArticles from '@/components/home/RecentArticles';
import { useProfile } from '@/contexts/ProfileContext';

interface TabNavigationProps {
  className?: string;
}

const TabNavigation = ({ className = '' }: TabNavigationProps) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'articles' | 'about'>(
    'projects'
  );

  const tabs = [
    { id: 'projects' as const, label: 'PROJECTS', icon: LayoutGrid },
    { id: 'articles' as const, label: 'ARTICLES', icon: PenTool },
    { id: 'about' as const, label: 'ABOUT', icon: User2 },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'projects':
        return (
          <div className='animate-fade-up'>
            <RecentProjects showAll={false} />
          </div>
        );
      case 'articles':
        return (
          <div className='animate-fade-up'>
            <RecentArticles showAll={false} />
          </div>
        );
      case 'about':
        return (
          <div className='animate-fade-up'>
            <AboutSection />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Navigation */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 mb-12'>
        <div className='flex items-center justify-center'>
          <div className='flex items-center bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-1 sm:p-2 shadow-soft overflow-x-auto max-w-full'>
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <Button
                  key={tab.id}
                  variant={isActive ? 'default' : 'ghost'}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 sm:gap-3 px-3 sm:px-8 py-3 sm:py-4 rounded-xl text-xs sm:text-sm font-semibold tracking-wider transition-all duration-300 whitespace-nowrap
                    ${
                      isActive
                        ? 'bg-gradient-primary text-white shadow-soft transform scale-105'
                        : 'text-foreground/70 hover:text-foreground hover:bg-muted/50'
                    }
                  `}
                >
                  <IconComponent className='w-4 h-4' />
                  <span className='hidden sm:inline'>{tab.label}</span>
                  <span className='sm:hidden'>{tab.label.slice(0, 8)}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className='min-h-[600px]'>{renderTabContent()}</div>
    </div>
  );
};

const AboutSection = () => {
  const { profile } = useProfile();

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6'>
      <div className='max-w-4xl mx-auto'>
        {/* About Content */}
        <div className='space-y-8'>
          <Card className='bg-card/50 backdrop-blur-sm border-primary/20 shadow-soft'>
            <CardContent className='p-8'>
              <div className='flex items-center gap-4 mb-6'>
                <div className='w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center'>
                  <User2 className='w-6 h-6 text-white' />
                </div>
                <h2 className='text-2xl font-bold text-foreground'>About Me</h2>
              </div>
              <div className='space-y-6'>
                <p className='text-foreground/80 leading-relaxed'>
                  {profile?.bio ||
                    'I write about data, build dashboards, and turn insights into action.'}
                </p>
                <div className='flex items-center gap-3 text-sm text-muted-foreground'>
                  {profile?.location && (
                    <span className='flex items-center gap-1'>
                      <MapPin className='w-4 h-4' />
                      {profile.location}
                    </span>
                  )}
                  {profile?.title && (
                    <>
                      <span>•</span>
                      <span>{profile.title}</span>
                    </>
                  )}
                </div>
                {Array.isArray(profile?.skills) &&
                  profile!.skills.length > 0 && (
                    <div className='flex flex-wrap gap-2 pt-2'>
                      {profile!.skills.slice(0, 12).map((skill: string) => (
                        <Badge
                          key={skill}
                          variant='secondary'
                          className='px-3 py-1'
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Links */}
          <Card className='bg-card/50 backdrop-blur-sm border-primary/20 shadow-soft'>
            <CardContent className='p-8'>
              <h3 className='text-xl font-semibold mb-6 flex items-center gap-3'>
                <Globe className='w-5 h-5 text-primary' />
                Connect With Me
              </h3>
              <div className='space-y-4'>
                {profile?.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className='flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group'
                  >
                    <div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors'>
                      <Mail className='w-5 h-5 text-primary' />
                    </div>
                    <div>
                      <p className='font-medium text-foreground'>Email</p>
                      <p className='text-sm text-muted-foreground'>
                        {profile.email}
                      </p>
                    </div>
                    <ExternalLink className='w-4 h-4 ml-auto text-muted-foreground group-hover:text-foreground transition-colors' />
                  </a>
                )}
                {profile?.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group'
                  >
                    <div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors'>
                      <Linkedin className='w-5 h-5 text-primary' />
                    </div>
                    <div>
                      <p className='font-medium text-foreground'>LinkedIn</p>
                      <p className='text-sm text-muted-foreground'>
                        Connect professionally
                      </p>
                    </div>
                    <ExternalLink className='w-4 h-4 ml-auto text-muted-foreground group-hover:text-foreground transition-colors' />
                  </a>
                )}
                {profile?.github_url && (
                  <a
                    href={profile.github_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group'
                  >
                    <div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors'>
                      <Github className='w-5 h-5 text-primary' />
                    </div>
                    <div>
                      <p className='font-medium text-foreground'>GitHub</p>
                      <p className='text-sm text-muted-foreground'>
                        Check out my code
                      </p>
                    </div>
                    <ExternalLink className='w-4 h-4 ml-auto text-muted-foreground group-hover:text-foreground transition-colors' />
                  </a>
                )}
                {profile?.website_url && (
                  <a
                    href={profile.website_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group'
                  >
                    <div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors'>
                      <Globe className='w-5 h-5 text-primary' />
                    </div>
                    <div>
                      <p className='font-medium text-foreground'>Website</p>
                      <p className='text-sm text-muted-foreground'>
                        Visit my portfolio
                      </p>
                    </div>
                    <ExternalLink className='w-4 h-4 ml-auto text-muted-foreground group-hover:text-foreground transition-colors' />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;
