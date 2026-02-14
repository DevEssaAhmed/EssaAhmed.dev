import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail, MessageCircle, MapPin, Calendar, Globe } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import Image from "next/image";

interface HeroStat {
  label: string;
  value: string;
}

interface HeroStatsData {
  [key: string]: HeroStat;
}

const HeroSection = () => {
  const { profile, loading } = useProfile();
  
  const defaultStats: HeroStatsData = {
    projectsLed: { label: 'Projects Led', value: '15+' },
    hoursAnalyzed: { label: 'Hours Analyzed', value: '500+' },
    clientsServed: { label: 'Clients Served', value: '50+' }
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-hero flex items-center justify-center px-6 py-20">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </section>
    );
  }

  // Profile should always exist now due to fallback in ProfileContext
  if (!profile) {
    return (
      <section className="min-h-screen bg-gradient-hero flex items-center justify-center px-6 py-20">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading profile...</p>
        </div>
      </section>
    );
  }

  // Parse stats if it's stored as JSON (fallback to default stats)
  const stats = profile.stats ? (typeof profile.stats === 'string' ? JSON.parse(profile.stats) : profile.stats) : defaultStats;
  
  return (
    <section className="min-h-screen bg-gradient-hero flex items-center justify-center px-6 py-20">
      <div className="max-w-4xl mx-auto">
        {/* Instagram-style Profile Card */}
        <div className="bg-card rounded-3xl shadow-glow p-8 mb-8 animate-fade-up">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Image */}
            <div className="relative">
              <Image
                src={profile.avatar_url || "/placeholder.svg"}
                alt={profile.name}
                width={128}
                height={128}
                unoptimized
                className="w-32 h-32 rounded-full shadow-soft border-4 border-primary/20 object-cover"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-card"></div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-foreground">{profile.name}</h1>
                <Button 
                  size="sm" 
                  className="bg-gradient-primary hover:shadow-soft transition-all duration-300"
                  onClick={() => window.open(`mailto:${profile.email}`, '_blank')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground mb-3">
                <span>@{profile.username}</span>
                <span>•</span>
                <span>{profile.title || 'Professional'}</span>
              </div>

              <p className="text-foreground/90 mb-4 max-w-2xl">
                {profile.bio || 'No bio available'}
              </p>

              {profile.skills && profile.skills.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {(profile.skills as string[]).slice(0, 6).map((skill: string, index: number) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex justify-center md:justify-start gap-8 mb-6">
                {Object.entries(stats).map(([key, stat]) => {
                  const statValue = typeof stat === 'object' && stat !== null && 'value' in stat ? (stat as HeroStat).value : String(stat);
                  const statLabel = typeof stat === 'object' && stat !== null && 'label' in stat ? (stat as HeroStat).label : key;
                  
                  return (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                        {statValue}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {statLabel}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex justify-center md:justify-start gap-4 mt-6 pt-6 border-t border-border">
            {profile.github_url && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
                onClick={() => window.open(profile.github_url, '_blank')}
              >
                <Github className="w-5 h-5" />
              </Button>
            )}
            {profile.linkedin_url && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
                onClick={() => window.open(profile.linkedin_url, '_blank')}
              >
                <Linkedin className="w-5 h-5" />
              </Button>
            )}
            {profile.website_url && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
                onClick={() => window.open(profile.website_url, '_blank')}
              >
                <Globe className="w-5 h-5" />
              </Button>
            )}
            {profile.email && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
                onClick={() => window.open(`mailto:${profile.email}`, '_blank')}
              >
                <Mail className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;


