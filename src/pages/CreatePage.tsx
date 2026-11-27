/**
 * CreatePage  /
 * 전시 제작 → 미리보기 → 개설하기(/checkout)
 */

import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SetupScreen from "../components/setup/SetupScreen";
import EntryScreen from "../components/entry/EntryScreen";
import Gallery from "../components/gallery/Gallery";
import MediaRoom from "../components/mediaroom/MediaRoom";
import GalleryBgm from "../components/gallery/GalleryBgm";
import { assignSlots } from "../utils/slotMapper";
import type { AppScreen, ExhibitionData } from "../types";

interface LocationState {
  initialData?: ExhibitionData;
  exhibitionId?: string;
}

type LocalScreen = Extract<AppScreen, "setup" | "entry" | "gallery" | "media-room">;

export default function CreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const [localExhibition, setLocalExhibition] = useState<ExhibitionData | null>(
    state.initialData ?? null,
  );
  const [screen, setScreen] = useState<LocalScreen>(
    state.initialData ? "entry" : "setup",
  );
  const [mediaSeated, setMediaSeated] = useState(false);

  const galleryArtworks = useMemo(
    () => (localExhibition ? assignSlots(localExhibition.artworks) : []),
    [localExhibition],
  );

  const handleSetupComplete = (data: ExhibitionData) => {
    setLocalExhibition(data);
    setScreen("entry");
  };

  const handleCheckout = () => {
    navigate("/checkout", {
      state: { exhibition: localExhibition, exhibitionId: state.exhibitionId },
    });
  };

  return (
    <div className="app">
      {screen === "setup" && (
        <SetupScreen
          onComplete={handleSetupComplete}
          initialData={localExhibition ?? undefined}
        />
      )}

      {screen === "entry" && localExhibition && (
        <EntryScreen
          exhibition={localExhibition}
          onEnterGallery={() => setScreen("gallery")}
          onEnterMediaRoom={() => setScreen("media-room")}
          onEdit={() => setScreen("setup")}
          onCheckout={handleCheckout}
        />
      )}

      {screen === "gallery" && localExhibition && (
        <Gallery
          artworks={galleryArtworks}
          exhibitionTitle={localExhibition.title}
          onExit={() => setScreen("entry")}
          onEnterMediaRoom={() => setScreen("media-room")}
        />
      )}

      {screen === "media-room" && localExhibition && (
        <MediaRoom
          artworks={galleryArtworks}
          onExit={() => { setMediaSeated(false); setScreen("gallery"); }}
          onSeatChange={setMediaSeated}
        />
      )}

      {(screen === "gallery" || screen === "media-room") && (
        <GalleryBgm bottom={screen === "media-room"} mediaSeated={mediaSeated} />
      )}
    </div>
  );
}
