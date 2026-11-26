/**
 * GalleryArtworks
 * 갤러리 액자 배치 — 사용자 업로드 작품을 12 슬롯에 자동 배치
 */

import { useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { createArtTexture } from "./artDrawings";
import { COLORS } from "./constants";
import type { ArtworkData } from "./artworkData";

// ─── 슬롯 위치 정의 ──────────────────────────────────────────────

interface SlotConfig {
  position: [number, number, number];
  rotation: [number, number, number];
  frameW: number;
  frameH: number;
}

const SLOT_CONFIGS: Record<string, SlotConfig> = {
  "left-7":       { position: [-5.93, 2.1, 7],  rotation: [0,  Math.PI / 2, 0], frameW: 1.1, frameH: 1.4 },
  "left-1":       { position: [-5.93, 2.1, 1],  rotation: [0,  Math.PI / 2, 0], frameW: 1.1, frameH: 1.4 },
  "left-n5":      { position: [-5.93, 2.1, -5], rotation: [0,  Math.PI / 2, 0], frameW: 1.1, frameH: 1.4 },
  "right-7":      { position: [ 5.93, 2.1, 7],  rotation: [0, -Math.PI / 2, 0], frameW: 1.1, frameH: 1.4 },
  "right-1":      { position: [ 5.93, 2.1, 1],  rotation: [0, -Math.PI / 2, 0], frameW: 1.1, frameH: 1.4 },
  "right-n5":     { position: [ 5.93, 2.1, -5], rotation: [0, -Math.PI / 2, 0], frameW: 1.1, frameH: 1.4 },
  "front-1":      { position: [-3.5,  2.1, 12.9], rotation: [0, Math.PI, 0],    frameW: 1.1, frameH: 1.4 },
  "front-2":      { position: [ 0,    2.1, 12.9], rotation: [0, Math.PI, 0],    frameW: 1.1, frameH: 1.4 },
  "front-3":      { position: [ 3.5,  2.1, 12.9], rotation: [0, Math.PI, 0],    frameW: 1.1, frameH: 1.4 },
  "back-left-1":  { position: [-3.8,  1.85, -12.9], rotation: [0, 0, 0],        frameW: 1.1, frameH: 1.4 },
  "back-right-1": { position: [ 3.8,  1.85, -12.9], rotation: [0, 0, 0],        frameW: 1.1, frameH: 1.4 },
  "back-main":    { position: [ 0,    1.5,  -12.9], rotation: [0, 0, 0],        frameW: 2.0, frameH: 2.6 },
};

// ─── 단일 액자 ───────────────────────────────────────────────────

function ArtFrame({ artwork }: { artwork: ArtworkData }) {
  const slot = SLOT_CONFIGS[artwork.id];
  if (!slot) return null;

  const { position, rotation, frameW, frameH } = slot;
  const frameT = 0.055;
  const frameD = 0.07;

  const canvasTex = useMemo(() => createArtTexture(artwork.artType), [artwork.artType]);
  const [texture, setTexture] = useState<THREE.Texture>(canvasTex);

  useEffect(() => {
    if (!artwork.imageUrl) { setTexture(canvasTex); return; }
    const loader = new THREE.TextureLoader();
    loader.load(
      artwork.imageUrl,
      (tex) => { tex.colorSpace = THREE.SRGBColorSpace; setTexture(tex); },
      undefined,
      () => setTexture(canvasTex),
    );
  }, [artwork.imageUrl, canvasTex]);

  return (
    <group position={position} rotation={rotation}>
      {/* 원목 액자 외곽 */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[frameW + frameT * 2, frameH + frameT * 2, frameD]} />
        <meshStandardMaterial color={COLORS.frameWood} roughness={0.55} />
      </mesh>
      {/* 매트 (아이보리 여백) */}
      <mesh position={[0, 0, frameD / 2 + 0.001]}>
        <planeGeometry args={[frameW + frameT * 0.6, frameH + frameT * 0.6]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.95} />
      </mesh>
      {/* 작품 평면 — userData.artworkId 로 레이캐스트 식별 */}
      <mesh position={[0, 0, frameD / 2 + 0.003]} userData={{ artworkId: artwork.id }}>
        <planeGeometry args={[frameW, frameH]} />
        <meshStandardMaterial map={texture} roughness={0.9} />
      </mesh>
    </group>
  );
}

// ─── 뒷벽 사인 (전시 제목 표시) ─────────────────────────────────

export function BackWallSign({ title }: { title: string }) {
  const signTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 320;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 1024, 320);

    ctx.font = "500 68px Georgia, serif";
    ctx.fillStyle = "#292724";
    ctx.textAlign = "center";
    // 긴 제목은 말줄임
    const displayTitle = title.length > 20 ? title.slice(0, 20) + "…" : title;
    ctx.fillText(displayTitle, 490, 110);

    ctx.fillStyle = "#a64b3c";
    ctx.beginPath();
    ctx.arc(870, 78, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f8f4ed";
    ctx.font = "bold 26px serif";
    ctx.fillText("전", 870, 88);

    ctx.strokeStyle = "#a0896e";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(260, 148);
    ctx.lineTo(760, 148);
    ctx.stroke();

    ctx.font = "400 36px sans-serif";
    ctx.fillStyle = "#8b7360";
    ctx.textAlign = "center";
    ctx.fillText("온라인 전시관", 512, 220);

    return new THREE.CanvasTexture(canvas);
  }, [title]);

  return (
    <mesh position={[0, 3.1, -12.97]}>
      <planeGeometry args={[5.8, 1.8]} />
      <meshBasicMaterial map={signTexture} transparent />
    </mesh>
  );
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────────

interface Props {
  artworks: ArtworkData[];
  exhibitionTitle: string;
}

export default function GalleryArtworks({ artworks, exhibitionTitle }: Props) {
  return (
    <group>
      {artworks.map((artwork) => (
        <ArtFrame key={artwork.id} artwork={artwork} />
      ))}
      <BackWallSign title={exhibitionTitle} />
    </group>
  );
}
