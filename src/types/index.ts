export type AppScreen = "setup" | "entry" | "gallery" | "media-room";

export interface ArtworkItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string; // blob URL from File
  file: File;
}

export interface ExhibitionData {
  title: string;
  description: string;
  artworks: ArtworkItem[];
}
