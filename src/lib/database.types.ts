export interface Database {
  public: {
    Tables: {
      applications: {
        Row: {
          id: string;
          nom: string;
          description: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          nom: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      fonctionnalites: {
        Row: {
          id: string;
          nom: string;
          description: string | null;
          application_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          nom: string;
          description?: string | null;
          application_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          description?: string | null;
          application_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sanity_checks: {
        Row: {
          id: string;
          fonctionnalite_id: string | null;
          statut: 'OK' | 'NOT_OK';
          commentaire: string | null;
          date_verification: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          fonctionnalite_id?: string | null;
          statut: 'OK' | 'NOT_OK';
          commentaire?: string | null;
          date_verification?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          fonctionnalite_id?: string | null;
          statut?: 'OK' | 'NOT_OK';
          commentaire?: string | null;
          date_verification?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Application = Database['public']['Tables']['applications']['Row'];
export type Fonctionnalite = Database['public']['Tables']['fonctionnalites']['Row'];
export type SanityCheck = Database['public']['Tables']['sanity_checks']['Row'];

export type FonctionnaliteWithApplication = Fonctionnalite & {
  applications: Application | null;
};

export type SanityCheckWithFonctionnalite = SanityCheck & {
  fonctionnalites: FonctionnaliteWithApplication | null;
};