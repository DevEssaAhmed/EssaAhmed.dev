export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12"
  }
  public: {
    Tables: {
      blog_post_tags: {
        Row: {
          blog_post_id: string
          tag_id: string
        }
        Insert: {
          blog_post_id: string
          tag_id: string
        }
        Update: {
          blog_post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          additional_images: string[] | null
          category_id: string | null
          content: string
          content_jsonb: Json | null
          created_at: string
          excerpt: string | null
          external_url: string | null
          featured_image_url: string | null
          id: string
          image_url: string | null
          is_external: boolean
          likes: number | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          pillar: string | null
          platform: string | null
          published: boolean | null
          reading_time: number | null
          series_id: string | null
          series_order: number | null
          slug: string
          title: string
          unlisted: boolean
          updated_at: string
          video_type: string | null
          video_url: string | null
          views: number | null
        }
        Insert: {
          additional_images?: string[] | null
          category_id?: string | null
          content: string
          content_jsonb?: Json | null
          created_at?: string
          excerpt?: string | null
          external_url?: string | null
          featured_image_url?: string | null
          id?: string
          image_url?: string | null
          is_external?: boolean
          likes?: number | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          pillar?: string | null
          platform?: string | null
          published?: boolean | null
          reading_time?: number | null
          series_id?: string | null
          series_order?: number | null
          slug: string
          title: string
          unlisted?: boolean
          updated_at?: string
          video_type?: string | null
          video_url?: string | null
          views?: number | null
        }
        Update: {
          additional_images?: string[] | null
          category_id?: string | null
          content?: string
          content_jsonb?: Json | null
          created_at?: string
          excerpt?: string | null
          external_url?: string | null
          featured_image_url?: string | null
          id?: string
          image_url?: string | null
          is_external?: boolean
          likes?: number | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          pillar?: string | null
          platform?: string | null
          published?: boolean | null
          reading_time?: number | null
          series_id?: string | null
          series_order?: number | null
          slug?: string
          title?: string
          unlisted?: boolean
          updated_at?: string
          video_type?: string | null
          video_url?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          article_count: number | null
          color: string | null
          created_at: string
          description: string | null
          featured: boolean | null
          icon: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          article_count?: number | null
          color?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          article_count?: number | null
          color?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          other_purpose: string | null
          purpose: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          other_purpose?: string | null
          purpose: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          other_purpose?: string | null
          purpose?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      diary_entries: {
        Row: {
          content: string
          created_at: string
          entry_date: string
          excerpt: string | null
          id: string
          image_alt: string | null
          image_url: string | null
          is_published: boolean
          title: string
          topic_tag: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          entry_date: string
          excerpt?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          is_published?: boolean
          title: string
          topic_tag?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          entry_date?: string
          excerpt?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          is_published?: boolean
          title?: string
          topic_tag?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profile: {
        Row: {
          about_content_jsonb: Json | null
          about_markdown: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          github_url: string | null
          id: string
          linkedin_url: string | null
          location: string | null
          name: string
          skills: string[] | null
          stats: Json | null
          title: string | null
          updated_at: string
          username: string
          website_url: string | null
        }
        Insert: {
          about_content_jsonb?: Json | null
          about_markdown?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          name: string
          skills?: string[] | null
          stats?: Json | null
          title?: string | null
          updated_at?: string
          username: string
          website_url?: string | null
        }
        Update: {
          about_content_jsonb?: Json | null
          about_markdown?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          name?: string
          skills?: string[] | null
          stats?: Json | null
          title?: string | null
          updated_at?: string
          username?: string
          website_url?: string | null
        }
        Relationships: []
      }
      project_tags: {
        Row: {
          project_id: string
          tag_id: string
        }
        Insert: {
          project_id: string
          tag_id: string
        }
        Update: {
          project_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tags_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          additional_images: string[] | null
          category_id: string | null
          comments: number | null
          created_at: string
          demo_url: string | null
          demo_video_type: string | null
          demo_video_url: string | null
          description: string
          description_jsonb: Json | null
          featured: boolean | null
          github_url: string | null
          id: string
          image_url: string | null
          likes: number | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          tags: string[] | null
          title: string
          updated_at: string
          views: number | null
        }
        Insert: {
          additional_images?: string[] | null
          category_id?: string | null
          comments?: number | null
          created_at?: string
          demo_url?: string | null
          demo_video_type?: string | null
          demo_video_url?: string | null
          description: string
          description_jsonb?: Json | null
          featured?: boolean | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          likes?: number | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          additional_images?: string[] | null
          category_id?: string | null
          comments?: number | null
          created_at?: string
          demo_url?: string | null
          demo_video_type?: string | null
          demo_video_url?: string | null
          description?: string
          description_jsonb?: Json | null
          featured?: boolean | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          likes?: number | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_settings: {
        Row: {
          author_bio: string | null
          author_name: string
          auto_generate_descriptions: boolean | null
          created_at: string | null
          custom_head_tags: string | null
          default_description: string
          default_image: string | null
          default_keywords: string | null
          default_title: string
          enable_json_ld: boolean | null
          enable_og_tags: boolean | null
          enable_twitter_cards: boolean | null
          facebook_page: string | null
          github_username: string | null
          google_analytics_id: string | null
          google_search_console_id: string | null
          id: number
          include_author_meta: boolean | null
          instagram_handle: string | null
          linkedin_profile: string | null
          site_description: string
          site_name: string
          site_url: string
          twitter_handle: string | null
          updated_at: string | null
        }
        Insert: {
          author_bio?: string | null
          author_name: string
          auto_generate_descriptions?: boolean | null
          created_at?: string | null
          custom_head_tags?: string | null
          default_description: string
          default_image?: string | null
          default_keywords?: string | null
          default_title: string
          enable_json_ld?: boolean | null
          enable_og_tags?: boolean | null
          enable_twitter_cards?: boolean | null
          facebook_page?: string | null
          github_username?: string | null
          google_analytics_id?: string | null
          google_search_console_id?: string | null
          id: number
          include_author_meta?: boolean | null
          instagram_handle?: string | null
          linkedin_profile?: string | null
          site_description: string
          site_name: string
          site_url: string
          twitter_handle?: string | null
          updated_at?: string | null
        }
        Update: {
          author_bio?: string | null
          author_name?: string
          auto_generate_descriptions?: boolean | null
          created_at?: string | null
          custom_head_tags?: string | null
          default_description?: string
          default_image?: string | null
          default_keywords?: string | null
          default_title?: string
          enable_json_ld?: boolean | null
          enable_og_tags?: boolean | null
          enable_twitter_cards?: boolean | null
          facebook_page?: string | null
          github_username?: string | null
          google_analytics_id?: string | null
          google_search_console_id?: string | null
          id?: number
          include_author_meta?: boolean | null
          instagram_handle?: string | null
          linkedin_profile?: string | null
          site_description?: string
          site_name?: string
          site_url?: string
          twitter_handle?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      series: {
        Row: {
          article_count: number | null
          created_at: string
          description: string | null
          featured: boolean | null
          featured_image_url: string | null
          id: string
          image_url: string | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          article_count?: number | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          featured_image_url?: string | null
          id?: string
          image_url?: string | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          article_count?: number | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          featured_image_url?: string | null
          id?: string
          image_url?: string | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          type: string | null
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          type?: string | null
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          type?: string | null
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      travel_highlights: {
        Row: {
          city_name: string
          country_code: string
          country_name: string
          cover_image_url: string | null
          created_at: string
          essay_blocks: Json
          essay_title: string | null
          flag: string
          id: string
          instagram_highlight_url: string | null
          is_published: boolean
          lat: number
          lng: number
          month: string
          slug: string
          story_slides: Json
          subtitle: string | null
          updated_at: string
          year: number
        }
        Insert: {
          city_name: string
          country_code?: string
          country_name: string
          cover_image_url?: string | null
          created_at?: string
          essay_blocks?: Json
          essay_title?: string | null
          flag?: string
          id: string
          instagram_highlight_url?: string | null
          is_published?: boolean
          lat?: number
          lng?: number
          month?: string
          slug: string
          story_slides?: Json
          subtitle?: string | null
          updated_at?: string
          year?: number
        }
        Update: {
          city_name?: string
          country_code?: string
          country_name?: string
          cover_image_url?: string | null
          created_at?: string
          essay_blocks?: Json
          essay_title?: string | null
          flag?: string
          id?: string
          instagram_highlight_url?: string | null
          is_published?: boolean
          lat?: number
          lng?: number
          month?: string
          slug?: string
          story_slides?: Json
          subtitle?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      profile_settings: {
        Row: {
          about_content_jsonb: Json | null
          about_markdown: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          github_url: string | null
          id: string | null
          linkedin_url: string | null
          location: string | null
          name: string | null
          skills: string[] | null
          stats: Json | null
          title: string | null
          updated_at: string | null
          username: string | null
          website_url: string | null
        }
        Insert: {
          about_content_jsonb?: Json | null
          about_markdown?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          github_url?: string | null
          id?: string | null
          linkedin_url?: string | null
          location?: string | null
          name?: string | null
          skills?: string[] | null
          stats?: Json | null
          title?: string | null
          updated_at?: string | null
          username?: string | null
          website_url?: string | null
        }
        Update: {
          about_content_jsonb?: Json | null
          about_markdown?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          github_url?: string | null
          id?: string | null
          linkedin_url?: string | null
          location?: string | null
          name?: string | null
          skills?: string[] | null
          stats?: Json | null
          title?: string | null
          updated_at?: string | null
          username?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_slug: { Args: { input_text: string }; Returns: string }
      get_all_tags_with_counts: {
        Args: never
        Returns: {
          article_count: number
          name: string
          project_count: number
          total_count: number
        }[]
      }
      get_related_tags: {
        Args: { p_tag_name: string }
        Returns: {
          count: number
          name: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
