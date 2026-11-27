/**
 * App
 * DEV_MODE=true  → 로컬 state 기반 (사진 업로드 없이 개발)
 * DEV_MODE=false → React Router 기반 프로덕션
 *   / → CreatePage  |  /gallery/:id → ViewPage
 *   /checkout → CheckoutPage  |  /signup → SignupPage
 */

import { useState, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { AppScreen, ExhibitionData } from "./types";
import SetupScreen from "./components/setup/SetupScreen";
import EntryScreen from "./components/entry/EntryScreen";
import Gallery from "./components/gallery/Gallery";
import MediaRoom from "./components/mediaroom/MediaRoom";
import GalleryBgm from "./components/gallery/GalleryBgm";
import PaymentScreen from "./components/payment/PaymentScreen";
import SignupScreen from "./components/auth/SignupScreen";
import LandingPage from "./pages/LandingPage";
import CreatePage from "./pages/CreatePage";
import ViewPage from "./pages/ViewPage";
import CheckoutPage from "./pages/CheckoutPage";
import SignupPage from "./pages/SignupPage";
import { assignSlots } from "./utils/slotMapper";
import { DEV_MODE, MOCK_EXHIBITION } from "./dev/mockExhibition";
import "./App.css";

// ── DEV 전용 ──────────────────────────────────────────────────

function DevApp() {
  const [screen, setScreen] = useState<AppScreen>("entry");
  const [exhibition, setExhibition] = useState<ExhibitionData>(MOCK_EXHIBITION);
  const [mediaSeated, setMediaSeated] = useState(false);

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
          onCheckout={() => setScreen("payment")}
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

      {screen === "payment" && (
        <PaymentScreen
          exhibitionTitle={exhibition.title}
          onBack={() => setScreen("entry")}
          onPaid={() => setScreen("signup")}
        />
      )}

      {screen === "signup" && (
        <SignupScreen
          onComplete={(_email, _password) => {
            // DEV: mock 완료 → 갤러리로
            setScreen("gallery");
          }}
        />
      )}

      {(screen === "gallery" || screen === "media-room") && (
        <GalleryBgm bottom={screen === "media-room"} mediaSeated={mediaSeated} />
      )}
    </div>
  );
}

// ── 프로덕션 ──────────────────────────────────────────────────

function ProdApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/gallery/:id" element={<ViewPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return DEV_MODE ? <DevApp /> : <ProdApp />;
}
