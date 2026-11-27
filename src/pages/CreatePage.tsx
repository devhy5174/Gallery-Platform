/**
 * CreatePage  /
 * 전시 제작 페이지 — SetupScreen 래핑 + Supabase 저장
 */

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SetupScreen from "../components/setup/SetupScreen";
import { saveExhibition } from "../lib/api";
import type { ExhibitionData } from "../types";

interface LocationState {
  initialData?: ExhibitionData;
  exhibitionId?: string;
}

export default function CreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleComplete = async (data: ExhibitionData) => {
    setSaving(true);
    setSaveError(null);
    try {
      const id = await saveExhibition(data, state.exhibitionId);
      navigate(`/gallery/${id}`);
    } catch (e) {
      console.error(e);
      setSaveError("저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      setSaving(false);
    }
  };

  return (
    <>
      <SetupScreen
        onComplete={handleComplete}
        initialData={state.initialData}
      />

      {saving && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(247,243,235,0.88)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 16,
          backdropFilter: "blur(4px)",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            border: "3px solid #ddd0bd",
            borderTopColor: "#76563e",
            animation: "spin 0.8s linear infinite",
          }} />
          <p style={{ fontFamily: "var(--sans)", color: "var(--text-h)", fontSize: 15 }}>
            전시를 저장하는 중입니다…
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {saveError && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "#a64b3c", color: "#fff",
          padding: "12px 24px", borderRadius: 8,
          fontFamily: "var(--sans)", fontSize: 14,
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          zIndex: 9999,
        }}>
          {saveError}
        </div>
      )}
    </>
  );
}
