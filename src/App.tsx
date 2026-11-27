/**
 * App
 * 갤러리 플랫폼 루트
 * setup → entry → gallery | media-room
 */

import { useState, useMemo } from "react";
import type { AppScreen, ExhibitionData } from "./types";
import SetupScreen from "./components/setup/SetupScreen";
import EntryScreen from "./components/entry/EntryScreen";
import Gallery from "./components/gallery/Gallery";
import MediaRoom from "./components/mediaroom/MediaRoom";
import GalleryBgm from "./components/gallery/GalleryBgm";
import { assignSlots } from "./utils/slotMapper";
import { DEV_MODE, MOCK_EXHIBITION } from "./dev/mockExhibition";
import "./App.css";

const DEFAULT_EXHIBITION: ExhibitionData = {
  title: "",
  description: "",
  artworks: [],
};

function App() {
  const [screen, setScreen] = useState<AppScreen>(DEV_MODE ? "entry" : "setup");
  const [exhibition, setExhibition] = useState<ExhibitionData>(
    DEV_MODE ? MOCK_EXHIBITION : DEFAULT_EXHIBITION,
  );
  const [mediaSeated, setMediaSeated] = useState(false);

  // 슬롯 배치 — artworks 변경 시에만 재계산
  const galleryArtworks = useMemo(
    () => assignSlots(exhibition.artworks),
    [exhibition.artworks],
  );

  const handleSetupComplete = (data: ExhibitionData) => {
    setExhibition(data);
    setScreen("entry");
  };

  return (
    <div className="app">
      {screen === "setup" && (
        <SetupScreen
          onComplete={handleSetupComplete}
          initialData={exhibition.artworks.length > 0 ? exhibition : undefined}
        />
      )}

      {screen === "entry" && (
        <EntryScreen
          exhibition={exhibition}
          onEnterGallery={() => setScreen("gallery")}
          onEnterMediaRoom={() => setScreen("media-room")}
          onEdit={() => setScreen("setup")}
        />
      )}

      {screen === "gallery" && (
        <Gallery
          artworks={galleryArtworks}
          exhibitionTitle={exhibition.title}
          onExit={() => setScreen("entry")}
          onEnterMediaRoom={() => setScreen("media-room")}
        />
      )}

      {screen === "media-room" && (
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

export default App;
