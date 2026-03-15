export type BuildingCategory =
  | "library"
  | "cafeteria"
  | "labs"
  | "hostel"
  | "parking"
  | "admin office";

export interface Database {
  public: {
    Tables: {
      buildings: {
        Row: {
          id: number;
          name: string;
          lat: number;
          lng: number;
          category: BuildingCategory;
          description: string;
          facilities: string[];
          photo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          lat: number;
          lng: number;
          category: BuildingCategory;
          description: string;
          facilities?: string[];
          photo?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          lat?: number;
          lng?: number;
          category?: BuildingCategory;
          description?: string;
          facilities?: string[];
          photo?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}
