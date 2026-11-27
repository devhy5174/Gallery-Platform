/**
 * ViewPage  /gallery/:id
 * 관람객 감상 페이지 — Supabase에서 전시 로드 후 EntryScreen → Gallery | MediaRoom
 */

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EntryScreen from "../components/entry/EntryScreen";
import Gallery from "../components/gallery/Gallery";
import MediaRoom from "../components/mediaroom/MediaRoom";
import GalleryBgm from "../components/gallery/GalleryBgm";
import { loadExhibition } from "../lib/api";
import { assignSlots } from "../utils/slotMapper";
import type { AppScreen, ExhibitionData } from "../types";

export default function ViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [exhibition, setExhibition] = useState<ExhibitionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [screen, setScreen] = useState<AppScreen>("entry");
  const [mediaSeated, setMediaSeated] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    loadExhibition(id)
      .then(setExhibition)
      .catch(() => setError("전시를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [id]);

  const galleryArtworks = useMemo(
    () => (exhibition ? assignSlots(exhibition.artworks) : []),
    [exhibition],
  );

  const handleEdit = () => {
    navigate("/", {
      state: { initialData: exhibition, exhibitionId: id },
    });
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100dvh", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "var(--bg)",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "3px solid #ddd0bd", borderTopColor: "#76563e",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !exhibition) {
    return (
      <div style={{
        minHeight: "100dvh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "var(--bg)", gap: 16,
      }}>
        <p style={{ fontFamily: "var(--sans)", color: "var(--text-muted)", fontSize: 15 }}>
          {error ?? "전시를 찾을 수 없습니다."}
        </p>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "10px 24px", background: "var(--primary)", color: "#fff",
            border: "none", borderRadius: 8, fontFamily: "var(--sans)",
            fontSize: 14, cursor: "pointer",
          }}
        >
          전시 만들기
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      {screen === "entry" && (
        <EntryScreen
          exhibition={exhibition}
          onEnterGallery={() => setScreen("gallery")}
          onEnterMediaRoom={() => setScreen("media-room")}
          onEdit={handleEdit}
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
