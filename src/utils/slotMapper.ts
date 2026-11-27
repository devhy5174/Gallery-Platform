/**
 * slotMapper
 * 사용자 업로드 순서 → 갤러리 슬롯 ID 자동 매핑
 * 최대 12장, 시각적 중요도 순서로 배치
 */

import type { ArtworkItem } from "../types";
import type { ArtworkData } from "../components/gallery/artworkData";

export interface Viewpoint {
  artworkId: string;
  position: [number, number, number];
  lookAt: [number, number, number];
}

/** 배치 순서: 시각적으로 가장 눈에 띄는 슬롯부터 */
export const SLOT_ORDER = [
  "back-main",    // 뒷벽 메인 (대형, 가장 눈에 띄는)
  "left-7",       // 왼쪽 가운데
  "right-7",      // 오른쪽 가운데
  "front-2",      // 앞벽 중앙
  "left-1",       // 왼쪽
  "right-1",      // 오른쪽
  "left-n5",      // 왼쪽 뒤
  "right-n5",     // 오른쪽 뒤
  "front-1",      // 앞벽 왼쪽
  "front-3",      // 앞벽 오른쪽
  "back-left-1",  // 뒷벽 사이드 왼쪽
  "back-right-1", // 뒷벽 사이드 오른쪽
] as const;

export const MAX_ARTWORKS = SLOT_ORDER.length; // 12

/** ArtworkItem[] → ArtworkData[] (슬롯 ID 할당) */
export function assignSlots(items: ArtworkItem[]): ArtworkData[] {
  return items.slice(0, MAX_ARTWORKS).map((item, i) => ({
    id: SLOT_ORDER[i],
    title: item.title || `작품 ${i + 1}`,
    titleEn: "",
    description: item.description,
    artType: "mountain", // 이미지 URL이 항상 있으므로 폴백용 더미값
    imageUrl: item.imageUrl,
  }));
}

/** 배치된 ArtworkData 기준 모바일 뷰포인트 동적 생성 */
export function generateViewpoints(artworks: ArtworkData[]) {
  const placedIds = new Set(artworks.map((a) => a.id));

  const ALL_VIEWPOINTS: Record<string, { position: [number, number, number]; lookAt: [number, number, number] }> = {
    "left-n5":      { position: [-3.5, 1.7, -5],  lookAt: [-5.93, 1.7, -5] },
    "left-1":       { position: [-3.5, 1.7,  1],  lookAt: [-5.93, 1.7,  1] },
    "left-7":       { position: [-3.5, 1.7,  7],  lookAt: [-5.93, 1.7,  7] },
    "front-1":      { position: [-3.5, 1.7, 9.5], lookAt: [-3.5,  1.7, 12.9] },
    "front-2":      { position: [ 0,   1.7, 9.5], lookAt: [ 0,    1.7, 12.9] },
    "front-3":      { position: [ 3.5, 1.7, 9.5], lookAt: [ 3.5,  1.7, 12.9] },
    "right-7":      { position: [ 3.5, 1.7,  7],  lookAt: [ 5.93, 1.7,  7] },
    "right-1":      { position: [ 3.5, 1.7,  1],  lookAt: [ 5.93, 1.7,  1] },
    "right-n5":     { position: [ 3.5, 1.7, -5],  lookAt: [ 5.93, 1.7, -5] },
    "back-left-1":  { position: [-3.8, 1.7, -9.5], lookAt: [-3.8, 1.7, -12.9] },
    "back-right-1": { position: [ 3.8, 1.7, -9.5], lookAt: [ 3.8, 1.7, -12.9] },
    "back-main":    { position: [ 0,   1.7, -8.5], lookAt: [ 0,   1.7, -12.9] },
  };

  // 투어 순서: 왼쪽벽 → 앞벽 → 오른쪽벽 → 뒷벽
  const TOUR_ORDER = [
    "left-n5", "left-1", "left-7",
    "front-1", "front-2", "front-3",
    "right-7", "right-1", "right-n5",
    "back-left-1", "back-right-1", "back-main",
  ];

  return TOUR_ORDER
    .filter((id) => placedIds.has(id))
    .map((id) => ({ artworkId: id, ...ALL_VIEWPOINTS[id] }));
}
