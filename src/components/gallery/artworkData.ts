/**
 * artworkData
 * 플랫폼용 ArtworkData 타입 정의
 * 하드코딩 데이터 없음 — 사용자 업로드로 채워짐
 */

import type { ArtType } from "./artDrawings";

export interface ArtworkData {
  id: string;        // 슬롯 ID: "left-7", "right-1" 등
  title: string;
  titleEn: string;
  description: string;
  artType: ArtType;  // 이미지 없을 때 폴백 드로잉용
  imageUrl?: string; // blob URL (업로드 이미지)
}
