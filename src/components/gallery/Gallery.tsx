/**
 * Gallery
 * 3D 갤러리 — 사용자 전시 데이터를 받아 렌더링
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import GalleryLights from "./GalleryLights";
import GalleryRoom from "./GalleryRoom";
import GalleryArtworks from "./GalleryArtworks";
import GalleryControls from "./GalleryControls";
import GalleryControlsMobile from "./GalleryControlsMobile";
import GalleryHUD from "./GalleryHUD";
import ArtworkModal from "./ArtworkModal";
import { CAMERA_INITIAL } from "./constants";
import { generateViewpoints } from "../../utils/slotMapper";
import type { ArtworkData } from "./artworkData";
import "./Gallery.css";

interface Props {
  artworks: ArtworkData[];
  exhibitionTitle: string;
  onExit: () => void;
  onEnterMediaRoom: () => void;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(pointer: coarse)").matches
      : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

export default function Gallery({ artworks, exhibitionTitle, onExit, onEnterMediaRoom }: Props) {
  const isMobile = useIsMobile();
  const [isLocked, setIsLocked] = useState(false);
  const [lookingAt, setLookingAt] = useState<string | null>(null);
  const [nearDoor, setNearDoor] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkData | null>(null);
  const [artworkIdx, setArtworkIdx] = useState(-1);

  const viewpoints = generateViewpoints(artworks);

  const handleActivateTour = useCallback(() => setArtworkIdx(0), []);
  const handleReturnToStart = useCallback(() => setArtworkIdx(-1), []);
  const handlePrevArtwork = useCallback(() => {
    setArtworkIdx((i) => (Math.max(0, i) - 1 + viewpoints.length) % viewpoints.length);
  }, [viewpoints.length]);
  const handleNextArtwork = useCallback(() => {
    setArtworkIdx((i) => (Math.max(0, i) + 1) % viewpoints.length);
  }, [viewpoints.length]);

  const lookingAtRef = useRef<string | null>(null);
  const handleLookingAt = useCallback((id: string | null) => {
    if (id !== lookingAtRef.current) {
      lookingAtRef.current = id;
      setLookingAt(id);
    }
  }, []);

  const handleInteract = useCallback((artworkId: string) => {
    const artwork = artworks.find((a) => a.id === artworkId);
    if (!artwork) return;
    if (document.pointerLockElement) document.exitPointerLock();
    setSelectedArtwork(artwork);
  }, [artworks]);

  const handleEnterMediaRoom = useCallback(() => {
    if (document.pointerLockElement) document.exitPointerLock();
    onEnterMediaRoom();
  }, [onEnterMediaRoom]);

  return (
    <div className="gallery-wrapper">
      <Canvas
        shadows
        camera={{
          fov: CAMERA_INITIAL.fov,
          near: 0.1,
          far: 100,
          position: CAMERA_INITIAL.position,
        }}
        gl={{ antialias: true }}
      >
        <GalleryLights />
        <GalleryRoom />
        <GalleryArtworks artworks={artworks} exhibitionTitle={exhibitionTitle} />

        {isMobile ? (
          <GalleryControlsMobile
            onInteract={handleInteract}
            onEnterMediaRoom={handleEnterMediaRoom}
            onNearDoor={setNearDoor}
            artworkIdx={artworkIdx}
            viewpoints={viewpoints}
            isModalOpen={!!selectedArtwork}
          />
        ) : (
          <GalleryControls
            onLockChange={setIsLocked}
            onLookingAt={handleLookingAt}
            onInteract={handleInteract}
            onEnterMediaRoom={handleEnterMediaRoom}
            onNearDoor={setNearDoor}
            artworkIdx={artworkIdx}
            viewpoints={viewpoints}
          />
        )}
      </Canvas>

      <GalleryHUD
        isLocked={isLocked}
        isMobile={isMobile}
        lookingAt={lookingAt}
        nearDoor={nearDoor}
        onExit={onExit}
        isModalOpen={!!selectedArtwork}
        artworkIdx={artworkIdx}
        artworkTotal={viewpoints.length}
        onActivateTour={handleActivateTour}
        onReturnToStart={handleReturnToStart}
        onPrevArtwork={handlePrevArtwork}
        onNextArtwork={handleNextArtwork}
      />

      {selectedArtwork && (
        <ArtworkModal artwork={selectedArtwork} onClose={() => setSelectedArtwork(null)} />
      )}
    </div>
  );
}
