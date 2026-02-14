import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  Search, 
  Share2, 
  Image as ImageIcon, 
  Twitter, 
  Facebook,
  Instagram,
  Github,
  Linkedin,
  Save,
  RefreshCw,
  Settings,
  Eye,
  Zap,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SEOSettingsData {
  site_name: string;
  site_description: string;
  site_url: string;
  author_name: string;
  author_bio: string;
  default_title: string;
  default_description: string;
  default_keywords: string;
  default_image: string;
  twitter_handle: string;
  facebook_page: string;
  instagram_handle: string;
  github_username: string;
  linkedin_profile: string;
  auto_generate_descriptions: boolean;
  include_author_meta: boolean;
  enable_json_ld: boolean;
  enable_twitter_cards: boolean;
  enable_og_tags: boolean;
  google_analytics_id: string;
  google_search_console_id: string;
  custom_head_tags: string;
}

const defaultSEOSettings: SEOSettingsData = {
  site_name: "Essa Ahmed - Portfolio & Blog",
  site_description: "Explore articles, projects, and insights about web development, data science, and technology.",
  site_url: typeof window !== 'undefined' ? window.location.origin : '',
  author_name: "Essa Ahmed",
  author_bio: "Full-stack developer and data scientist passionate about creating innovative solutions.",
  default_title: "Portfolio & Blog",
  default_description: "Explore articles, projects, and insights about web development, data science, and technology.",
  default_keywords: "web development, data science, portfolio, blog, react, python, javascript, technology",
  default_image: "/placeholder.svg",
  twitter_handle: "@essaahmed",
  facebook_page: "",
  instagram_handle: "",
  github_username: "essaahmed",
  linkedin_profile: "",
  auto_generate_descriptions: true,
  include_author_meta: true,
  enable_json_ld: true,
  enable_twitter_cards: true,
  enable_og_tags: true,
  google_analytics_id: "",
  google_search_console_id: "",
  custom_head_tags: "",
};

const SEOSettings: React.FC = () => {
  const [settings, setSettings] = useState<SEOSettingsData>(defaultSEOSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: existingSettings, error } = await supabase.from('seo_settings').select('*').single();

      if (error) {
        const { error: insertError } = await supabase.from('seo_settings').insert([{ ...defaultSEOSettings, id: 1 }]);
        if (insertError) {
          toast({ title: 'SEO settings unavailable', description: 'Database not ready. Using defaults in UI only.', variant: 'destructive' });
        }
        setSettings(defaultSEOSettings);
      } else {
        setSettings({ ...defaultSEOSettings, ...existingSettings });
      }
    } catch (error) {
      toast({ title: 'SEO settings load failed', description: 'Falling back to in-memory defaults.', variant: 'destructive' });
      setSettings(defaultSEOSettings);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      const { error } = await supabase.from('seo_settings').upsert([{ ...settings, id: 1 }], { onConflict: 'id' });
      if (error) {
        toast({ title: 'Failed to save SEO settings', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'SEO settings updated', description: 'Your SEO configuration has been saved successfully.' });
    } catch (error: any) {
      toast({ title: 'Failed to save SEO settings', description: error.message || 'Unknown error', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings(defaultSEOSettings);
    toast({ title: 'Settings reset', description: 'SEO settings have been reset to defaults.' });
  };

  const preview = {
    title: `${settings.default_title} | ${settings.site_name}`,
    description: settings.default_description,
    url: settings.site_url,
    image: settings.default_image,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading SEO settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6" /> SEO Settings
          </h2>
          <p className="text-muted-foreground mt-1">Configure search engine optimization and social media settings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RefreshCw className="w-4 h-4 mr-2" /> Reset
          </Button>
          <Button onClick={saveSettings} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Preview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Eye className="w-5 h-5" /> SEO Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Google Search Result</h3>
              <div className="space-y-1">
                <div className="text-blue-600 dark:text-blue-400 text-lg hover:underline cursor-pointer">{preview.title}</div>
                <div className="text-green-600 dark:text-green-400 text-sm">{preview.url}</div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">{preview.description}</div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Social Media Card</h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-200 dark:bg-gray-700 h-32 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
                <div className="p-3">
                  <div className="font-medium text-sm mb-1">{preview.title}</div>
                  <div className="text-gray-600 dark:text-gray-300 text-xs">{preview.description}</div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">{preview.url}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
        {/* General */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" /> Site Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="site_name">Site Name</Label>
                  <Input id="site_name" value={settings.site_name} onChange={(e) => setSettings((p) => ({ ...p, site_name: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="site_url">Site URL</Label>
                  <Input id="site_url" value={settings.site_url} onChange={(e) => setSettings((p) => ({ ...p, site_url: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label htmlFor="site_description">Site Description</Label>
                <Textarea id="site_description" value={settings.site_description} onChange={(e) => setSettings((p) => ({ ...p, site_description: e.target.value }))} rows={3} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="author_name">Author Name</Label>
                  <Input id="author_name" value={settings.author_name} onChange={(e) => setSettings((p) => ({ ...p, author_name: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="default_image">Default OG Image</Label>
                  <Input id="default_image" value={settings.default_image} onChange={(e) => setSettings((p) => ({ ...p, default_image: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label htmlFor="author_bio">Author Bio</Label>
                <Textarea id="author_bio" value={settings.author_bio} onChange={(e) => setSettings((p) => ({ ...p, author_bio: e.target.value }))} rows={2} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" /> Default Meta Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="default_title">Default Title</Label>
                <Input id="default_title" value={settings.default_title} onChange={(e) => setSettings((p) => ({ ...p, default_title: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="default_description">Default Description</Label>
                <Textarea id="default_description" value={settings.default_description} onChange={(e) => setSettings((p) => ({ ...p, default_description: e.target.value }))} rows={3} />
              </div>
              <div>
                <Label htmlFor="default_keywords">Default Keywords</Label>
                <Input id="default_keywords" value={settings.default_keywords} onChange={(e) => setSettings((p) => ({ ...p, default_keywords: e.target.value }))} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social */}
        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" /> Social Media Profiles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="twitter_handle" className="flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-blue-400" /> Twitter Handle
                  </Label>
                  <Input id="twitter_handle" value={settings.twitter_handle} onChange={(e) => setSettings((p) => ({ ...p, twitter_handle: e.target.value }))} placeholder="@username" />
                </div>
                <div>
                  <Label htmlFor="github_username" className="flex items-center gap-2">
                    <Github className="w-4 h-4" /> GitHub Username
                  </Label>
                  <Input id="github_username" value={settings.github_username} onChange={(e) => setSettings((p) => ({ ...p, github_username: e.target.value }))} placeholder="username" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkedin_profile" className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-blue-600" /> LinkedIn Profile
                  </Label>
                  <Input id="linkedin_profile" value={settings.linkedin_profile} onChange={(e) => setSettings((p) => ({ ...p, linkedin_profile: e.target.value }))} placeholder="https://linkedin.com/in/username" />
                </div>
                <div>
                  <Label htmlFor="instagram_handle" className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-500" /> Instagram Handle
                  </Label>
                  <Input id="instagram_handle" value={settings.instagram_handle} onChange={(e) => setSettings((p) => ({ ...p, instagram_handle: e.target.value }))} placeholder="@username" />
                </div>
              </div>
              <div>
                <Label htmlFor="facebook_page" className="flex items-center gap-2">
                  <Facebook className="w-4 h-4 text-blue-600" /> Facebook Page
                </Label>
                <Input id="facebook_page" value={settings.facebook_page} onChange={(e) => setSettings((p) => ({ ...p, facebook_page: e.target.value }))} placeholder="https://facebook.com/yourpage" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" /> SEO Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: 'auto_generate_descriptions', label: 'Auto-generate meta descriptions', description: 'Automatically create descriptions from content' },
                { key: 'include_author_meta', label: 'Include author metadata', description: 'Add author information to meta tags' },
                { key: 'enable_json_ld', label: 'Enable JSON-LD structured data', description: 'Help search engines understand your content' },
                { key: 'enable_twitter_cards', label: 'Enable Twitter Cards', description: 'Rich previews when shared on Twitter' },
                { key: 'enable_og_tags', label: 'Enable Open Graph tags', description: 'Rich previews on social platforms' },
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{setting.label}</div>
                    <div className="text-sm text-muted-foreground">{setting.description}</div>
                  </div>
                  <Switch
                    checked={(settings as any)[setting.key] as boolean}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, [setting.key]: checked }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> Analytics &amp; Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                <Input id="google_analytics_id" value={settings.google_analytics_id} onChange={(e) => setSettings((p) => ({ ...p, google_analytics_id: e.target.value }))} placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X" />
              </div>
              <div>
                <Label htmlFor="google_search_console_id">Google Search Console ID</Label>
                <Input id="google_search_console_id" value={settings.google_search_console_id} onChange={(e) => setSettings((p) => ({ ...p, google_search_console_id: e.target.value }))} placeholder="Search Console verification ID" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom */}
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Head Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="custom_head_tags">Additional HTML Head Tags</Label>
                <Textarea id="custom_head_tags" value={settings.custom_head_tags} onChange={(e) => setSettings((p) => ({ ...p, custom_head_tags: e.target.value }))} placeholder="<meta name='custom' content='value' />" rows={6} className="font-mono text-sm" />
                <p className="text-xs text-muted-foreground mt-2">Add custom meta tags, verification codes, or other HTML elements to the head section.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SEOSettings;



