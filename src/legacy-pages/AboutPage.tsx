import { OptimizedImage } from "@/components/OptimizedImage";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Linkedin, Mail, MapPin, Globe } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import SEO from "@/components/SEO";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import Footer from '@/components/Footer'
import { Link } from "@/lib/router-compat";

const AboutPage = () => {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center">
          <p className="text-muted-foreground">Profile not found.</p>
        </div>
      </div>
    );
  }

  const fullName = profile.name || "Profile";
  const title = profile.title || "About";
  const bio = profile.bio || "";
  const skills: string[] = Array.isArray(profile.skills) ? (profile.skills as string[]) : [];
  const avatar = profile.avatar_url || "/placeholder.svg";
  const aboutMarkdown: string | undefined = (profile as any).about_markdown;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <SEO title={`About ${fullName}`} description={bio.substring(0, 160) || `${fullName} — ${title}`} image={avatar} url="/about" type="website" />
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-16">
            <OptimizedImage src={avatar} alt={fullName} className="w-32 h-32 rounded-full mx-auto mb-8 border-4 border-primary/20 object-cover" loading="lazy" />
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">About {fullName}</h1>
            {title && (<p className="text-lg text-primary font-medium">{title}</p>)}
            {bio && (<p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-3">{bio}</p>)}
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-semibold mb-6">My Story</h2>
                  <div className="space-y-4 text-muted-foreground">
                    {aboutMarkdown ? (
                      <div className="prose prose-lg max-w-none dark:prose-invert">
                        <MarkdownRenderer content={aboutMarkdown} />
                      </div>
                    ) : bio ? (
                      <p>{bio}</p>
                    ) : (
                      <p className="italic">No about content yet. Add it from your profile settings.</p>
                    )}
                  </div>

                  <div className="mt-8 p-4 rounded-xl border border-border/60 bg-muted/25">
                    <p className="text-sm text-muted-foreground">
                      I keep a quiet public diary of ongoing experiments and life notes.
                    </p>
                    <Link
                      to="/diary"
                      className="inline-block mt-2 text-sm font-medium text-primary hover:underline"
                    >
                      Open diary timeline
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
                  <div className="space-y-3">
                    {profile.email && (<div className="flex items-center gap-3"><Mail className="w-4 h-4 text-primary" /><a href={`mailto:${profile.email}`} className="text-sm hover:underline">{profile.email}</a></div>)}
                    {profile.location && (<div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-primary" /><span className="text-sm">{profile.location}</span></div>)}
                    {profile.github_url && (<div className="flex items-center gap-3"><Github className="w-4 h-4 text-primary" /><a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">GitHub</a></div>)}
                    {profile.linkedin_url && (<div className="flex items-center gap-3"><Linkedin className="w-4 h-4 text-primary" /><a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">LinkedIn</a></div>)}
                    {profile.website_url && (<div className="flex items-center gap-3"><Globe className="w-4 h-4 text-primary" /><a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">Website</a></div>)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Top Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.length > 0 ? (skills.map((skill) => (<Badge key={skill} variant="secondary">{skill}</Badge>))) : (<p className="text-sm text-muted-foreground">No skills yet. Add some from your profile settings.</p>)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      <Footer />
      </div>
    </div>
  );
};

export default AboutPage;
