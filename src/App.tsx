/**
 * App
 * 갤러리 플랫폼 루트
 * setup → gallery → media-room
 */

import { useState, useMemo } from "react";
import type { AppScreen, ExhibitionData } from "./types";
import SetupScreen from "./components/setup/SetupScreen";
import Gallery from "./components/gallery/Gallery";
import MediaRoom from "./components/mediaroom/MediaRoom";
import GalleryBgm from "./components/gallery/GalleryBgm";
import { assignSlots } from "./utils/slotMapper";
import "./App.css";

const DEFAULT_EXHIBITION: ExhibitionData = {
  title: "",
  description: "",
  artworks: [],
};

function App() {
  const [screen, setScreen] = useState<AppScreen>("setup");
  const [exhibition, setExhibition] = useState<ExhibitionData>(DEFAULT_EXHIBITION);
  const [mediaSeated, setMediaSeated] = useState(false);

  // 슬롯 배치 — artworks 변경 시에만 재계산
  const galleryArtworks = useMemo(
    () => assignSlots(exhibition.artworks),
    [exhibition.artworks],
  );

  const handleSetupComplete = (data: ExhibitionData) => {
    setExhibition(data);
    setScreen("gallery");
  };

  return (
    <div className="app">
      {screen === "setup" && (
        <SetupScreen onComplete={handleSetupComplete} />
      )}

      {screen === "gallery" && (
        <Gallery
          artworks={galleryArtworks}
          exhibitionTitle={exhibition.title}
          onExit={() => setScreen("setup")}
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
