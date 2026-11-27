/**
 * mockExhibition
 * DEV_MODE 전용 가상 전시 데이터 — 사진 업로드 없이 갤러리 바로 확인용
 * DEV_MODE = false 로 끄면 일반 흐름으로 복귀
 */

import type { ExhibitionData, ArtworkItem } from "../types";

export const DEV_MODE = true;

const COLORS = [
  "#7c6e5b", "#a64b3c", "#4a7c6e", "#76563e",
  "#5b6e7c", "#6e7c5b", "#7c5b6e", "#3c6ea6",
  "#a6963c", "#6ea65b", "#a67c3c", "#5b7ca6",
];

const TITLES = [
  "뒷벽 메인", "왼쪽 가운데", "오른쪽 가운데", "앞벽 중앙",
  "왼쪽 1", "오른쪽 1", "왼쪽 뒤", "오른쪽 뒤",
  "앞벽 왼쪽", "앞벽 오른쪽", "뒷벽 사이드 L", "뒷벽 사이드 R",
];

function makeSvgUrl(index: number, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500">
    <rect width="400" height="500" fill="${color}"/>
    <text x="200" y="230" font-size="120" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="sans-serif" font-weight="bold">${index}</text>
    <text x="200" y="340" font-size="36" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="sans-serif">${TITLES[index - 1]}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function makeMockFile(index: number): File {
  return new File([], `mock-${index}.jpg`, { type: "image/jpeg" });
}

const MOCK_ARTWORKS: ArtworkItem[] = Array.from({ length: 12 }, (_, i) => ({
  id: `mock-${i + 1}`,
  title: TITLES[i],
  description: `슬롯 ${i + 1}번 위치의 테스트 작품입니다.`,
  imageUrl: makeSvgUrl(i + 1, COLORS[i]),
  file: makeMockFile(i + 1),
}));

export const MOCK_EXHIBITION: ExhibitionData = {
  title: "테스트 전시회",
  description: "개발용 가상 데이터",
  artworks: MOCK_ARTWORKS,
};
