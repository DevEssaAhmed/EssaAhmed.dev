import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
    section?: string;
  };
}

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

const defaultSettings: SEOSettingsData = {
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

// Helper to set or update a meta tag
const setMetaTag = (attribute: 'name' | 'property', value: string, content: string) => {
  let element = document.querySelector(`meta[${attribute}="${value}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
  return element;
};

// Helper to set or update link tags
const setLinkTag = (rel: string, href: string) => {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
  return element;
};

const SEO = ({ title, description, image, url, type = "website", article }: SEOProps) => {
  const [settings, setSettings] = useState<SEOSettingsData>(defaultSettings);
  const jsonLdScriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    loadSEOSettings();
  }, []);

  const loadSEOSettings = async () => {
    try {
      const { data: dbSettings } = await supabase.from('seo_settings').select('*').single();
      if (dbSettings) {
        setSettings({ ...defaultSettings, ...dbSettings });
        return;
      }
      setSettings(defaultSettings);
    } catch (error) {
      setSettings(defaultSettings);
    }
  };

  // Update document head when settings or props change
  useEffect(() => {
    const seoTitle = title || settings.default_title;
    const fullTitle = seoTitle === settings.default_title ? settings.site_name : `${seoTitle} | ${settings.site_name}`;
    const seoDescription = description || settings.default_description;
    const fullUrl = url ? `${settings.site_url}${url}` : (typeof window !== 'undefined' ? window.location.href : settings.site_url);
    const fullImage = image ? (image.startsWith('http') ? image : `${settings.site_url}${image}`) : `${settings.site_url}${settings.default_image}`;

    const finalDescription = settings.auto_generate_descriptions && !description && article
      ? `${seoDescription.substring(0, 120)}...`
      : seoDescription;

    // Set document title
    document.title = fullTitle;

    // Set basic meta tags
    setMetaTag('name', 'description', finalDescription);
    setMetaTag('name', 'keywords', settings.default_keywords);
    
    if (settings.include_author_meta) {
      setMetaTag('name', 'author', settings.author_name);
      setMetaTag('name', 'creator', settings.author_name);
    }

    // Set canonical link
    setLinkTag('canonical', fullUrl);

    // Set Open Graph tags
    if (settings.enable_og_tags) {
      setMetaTag('property', 'og:type', type);
      setMetaTag('property', 'og:title', fullTitle);
      setMetaTag('property', 'og:description', finalDescription);
      setMetaTag('property', 'og:image', fullImage);
      setMetaTag('property', 'og:url', fullUrl);
      setMetaTag('property', 'og:site_name', settings.site_name);
      setMetaTag('property', 'og:locale', 'en_US');

      if (type === "article" && article) {
        if (article.publishedTime) {
          setMetaTag('property', 'article:published_time', article.publishedTime);
        }
        if (article.modifiedTime) {
          setMetaTag('property', 'article:modified_time', article.modifiedTime);
        }
        setMetaTag('property', 'article:author', article.author || settings.author_name);
        if (article.section) {
          setMetaTag('property', 'article:section', article.section);
        }
      }
    }

    // Set Twitter Card tags
    if (settings.enable_twitter_cards) {
      setMetaTag('name', 'twitter:card', 'summary_large_image');
      setMetaTag('name', 'twitter:title', fullTitle);
      setMetaTag('name', 'twitter:description', finalDescription);
      setMetaTag('name', 'twitter:image', fullImage);
      if (settings.twitter_handle) {
        setMetaTag('name', 'twitter:site', settings.twitter_handle);
        setMetaTag('name', 'twitter:creator', settings.twitter_handle);
      }
    }

    // Set Google Search Console verification
    if (settings.google_search_console_id) {
      setMetaTag('name', 'google-site-verification', settings.google_search_console_id);
    }

    // Set JSON-LD structured data
    if (settings.enable_json_ld) {
      const structuredData = {
        "@context": "https://schema.org",
        "@type": type === "article" ? "Article" : "WebSite",
        "name": fullTitle,
        "description": finalDescription,
        "url": fullUrl,
        "image": fullImage,
        ...(type === "article" && article && {
          "headline": seoTitle,
          "datePublished": article.publishedTime,
          "dateModified": article.modifiedTime || article.publishedTime,
          "author": { "@type": "Person", "name": article.author || settings.author_name, "description": settings.author_bio },
          "publisher": { "@type": "Organization", "name": settings.site_name, "logo": { "@type": "ImageObject", "url": `${settings.site_url}/logo.png` } },
          "keywords": article.tags?.join(", ") || settings.default_keywords,
          "articleSection": article.section,
        }),
        ...(type === "website" && {
          "author": { "@type": "Person", "name": settings.author_name, "url": settings.site_url, "description": settings.author_bio },
        }),
      };

      // Remove old JSON-LD script if it exists
      if (jsonLdScriptRef.current) {
        jsonLdScriptRef.current.remove();
      }

      // Create new JSON-LD script
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
      jsonLdScriptRef.current = script;
    }

    // Cleanup function
    return () => {
      if (jsonLdScriptRef.current) {
        jsonLdScriptRef.current.remove();
        jsonLdScriptRef.current = null;
      }
    };
  }, [settings, title, description, image, url, type, article]);

  // This component doesn't render anything visible
  return null;
};

export default SEO;
