export type AppScreen = "setup" | "entry" | "gallery" | "media-room" | "payment" | "signup";

export interface ArtworkItem {
  id: string;        // 로컬 React key
  dbId?: string;     // Supabase artworks.id (로드된 경우)
  title: string;
  description: string;
  imageUrl: string;  // blob URL (업로드 전) 또는 Storage public URL (저장 후)
  file?: File;       // 새로 업로드한 경우에만 존재
}

export interface ExhibitionData {
  title: string;
  description: string;
  artworks: ArtworkItem[];
}
