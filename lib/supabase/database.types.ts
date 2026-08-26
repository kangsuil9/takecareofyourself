export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "USER" | "ADMIN";
export type ArticleStatus = "DRAFT" | "PUBLISHED";
export type NotificationStatus = "DRAFT" | "SCHEDULED" | "SENT" | "CANCELLED";

type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      users: Table<
        { id: string; auth_user_id: string; provider: "kakao"; provider_user_id: string; nickname: string | null; role: UserRole; created_at: string; updated_at: string },
        { id?: string; auth_user_id: string; provider?: "kakao"; provider_user_id: string; nickname?: string | null; role?: UserRole; created_at?: string; updated_at?: string },
        { nickname?: string | null; provider_user_id?: string; updated_at?: string }
      >;
      care_logs: Table<
        { id: string; user_id: string; category: string | null; content: string; image_url: string | null; created_at: string; updated_at: string; deleted_at: string | null },
        { id?: string; user_id: string; category?: string | null; content: string; image_url?: string | null; created_at?: string; updated_at?: string; deleted_at?: string | null },
        { category?: string | null; content?: string; image_url?: string | null; updated_at?: string; deleted_at?: string | null }
      >;
      likes: Table<
        { id: string; user_id: string; care_log_id: string; created_at: string },
        { id?: string; user_id: string; care_log_id: string; created_at?: string },
        never
      >;
      articles: Table<
        { id: string; title: string; category: string; summary: string; content: string; content_blocks: Json; references: Json; cover_image_url: string | null; reading_time: number | null; status: ArticleStatus; published_at: string | null; created_at: string; updated_at: string },
        { id?: string; title?: string; category?: string; summary?: string; content?: string; content_blocks?: Json; references?: Json; cover_image_url?: string | null; reading_time?: number | null; status?: ArticleStatus; published_at?: string | null; created_at?: string; updated_at?: string },
        { title?: string; category?: string; summary?: string; content?: string; content_blocks?: Json; references?: Json; cover_image_url?: string | null; reading_time?: number | null; status?: ArticleStatus; published_at?: string | null; updated_at?: string }
      >;
      push_subscriptions: Table<
        { id: string; user_id: string; endpoint: string; p256dh: string; auth: string; created_at: string; updated_at: string },
        { id?: string; user_id: string; endpoint: string; p256dh: string; auth: string; created_at?: string; updated_at?: string },
        { endpoint?: string; p256dh?: string; auth?: string; updated_at?: string }
      >;
      notifications: Table<
        { id: string; article_id: string; title: string; body: string; scheduled_at: string | null; sent_at: string | null; status: NotificationStatus; created_at: string },
        { id?: string; article_id: string; title: string; body: string; scheduled_at?: string | null; sent_at?: string | null; status?: NotificationStatus; created_at?: string },
        { article_id?: string; title?: string; body?: string; scheduled_at?: string | null; sent_at?: string | null; status?: NotificationStatus }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      get_feed_profiles: {
        Args: { profile_ids: string[] };
        Returns: { id: string; nickname: string }[];
      };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
    };
    Enums: {
      user_role: UserRole;
      article_status: ArticleStatus;
      notification_status: NotificationStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
