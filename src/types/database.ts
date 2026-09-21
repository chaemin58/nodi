// Supabase DB 타입 — supabase/schema.sql 과 1:1 대응 (수기 작성).
// 나중에 실제 DB 연결 후 `supabase gen types typescript` 로 자동 생성해 교체 가능.
//
// 각 테이블은 supabase-js 가 요구하는 { Row, Insert, Update, Relationships } 형태.
// (Relationships 가 없으면 타입이 never 로 떨어져 insert/update 가 안 됨)

type Table<Row, Insert, Update, Rel extends readonly unknown[] = []> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Rel;
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string;
          nickname: string;
          avatar_url: string | null;
          created_at: string;
        },
        {
          id: string;
          nickname: string;
          avatar_url?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          nickname?: string;
          avatar_url?: string | null;
          created_at?: string;
        }
      >;
      groups: Table<
        {
          id: string;
          name: string;
          owner_id: string;
          type: string;
          invite_code: string;
          color: string;
          status_message: string | null;
          created_at: string;
        },
        {
          id?: string;
          name: string;
          owner_id: string;
          type?: string;
          invite_code?: string;
          color?: string;
          status_message?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          name?: string;
          owner_id?: string;
          type?: string;
          invite_code?: string;
          color?: string;
          status_message?: string | null;
          created_at?: string;
        }
      >;
      group_members: Table<
        {
          id: string;
          group_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        },
        {
          id?: string;
          group_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
        },
        {
          id?: string;
          group_id?: string;
          user_id?: string;
          role?: string;
          joined_at?: string;
        },
        [
          {
            foreignKeyName: "group_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_members_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
        ]
      >;
      meetups: Table<
        {
          id: string;
          group_id: string;
          title: string;
          created_by: string;
          status: string;
          meet_date: string | null;
          emoji: string | null;
          is_shared: boolean;
          share_token: string;
          created_at: string;
        },
        {
          id?: string;
          group_id: string;
          title: string;
          created_by: string;
          status?: string;
          meet_date?: string | null;
          emoji?: string | null;
          is_shared?: boolean;
          share_token?: string;
          created_at?: string;
        },
        {
          id?: string;
          group_id?: string;
          title?: string;
          created_by?: string;
          status?: string;
          meet_date?: string | null;
          emoji?: string | null;
          is_shared?: boolean;
          share_token?: string;
          created_at?: string;
        }
      >;
      places: Table<
        {
          id: string;
          meetup_id: string;
          name: string;
          category: string | null;
          address: string | null;
          lat: number | null;
          lng: number | null;
          naver_place_id: string | null;
          added_by: string;
          is_confirmed: boolean;
          course_order: number | null;
          created_at: string;
        },
        {
          id?: string;
          meetup_id: string;
          name: string;
          category?: string | null;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
          naver_place_id?: string | null;
          added_by: string;
          is_confirmed?: boolean;
          course_order?: number | null;
          created_at?: string;
        },
        {
          id?: string;
          meetup_id?: string;
          name?: string;
          category?: string | null;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
          naver_place_id?: string | null;
          added_by?: string;
          is_confirmed?: boolean;
          course_order?: number | null;
          created_at?: string;
        },
        [
          {
            foreignKeyName: "places_added_by_fkey";
            columns: ["added_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ]
      >;
      votes: Table<
        {
          id: string;
          place_id: string;
          user_id: string;
          created_at: string;
        },
        {
          id?: string;
          place_id: string;
          user_id: string;
          created_at?: string;
        },
        {
          id?: string;
          place_id?: string;
          user_id?: string;
          created_at?: string;
        }
      >;
    };
    Views: Record<never, never>;
    Functions: {
      is_group_member: {
        Args: { _group_id: string };
        Returns: boolean;
      };
      is_group_owner: {
        Args: { _group_id: string };
        Returns: boolean;
      };
      get_group_by_invite_code: {
        Args: { _code: string };
        Returns: {
          id: string;
          name: string;
          type: string;
          color: string;
          member_count: number;
        }[];
      };
      get_my_groups_summary: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          name: string;
          type: string;
          created_at: string;
          color: string;
          member_count: number;
          meetup_count: number;
          members: { id: string; nickname: string; avatar_url: string | null }[];
          current_meetup: {
            id: string;
            title: string;
            status: string;
            meet_date: string | null;
            emoji: string | null;
            place_count: number;
            confirmed_place: string | null;
          } | null;
        }[];
      };
      can_view_meetup: {
        Args: { _meetup_id: string };
        Returns: boolean;
      };
      is_meetup_member: {
        Args: { _meetup_id: string };
        Returns: boolean;
      };
      is_meetup_group_owner: {
        Args: { _meetup_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<never, never>;
  };
};

// 편의 별칭
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
