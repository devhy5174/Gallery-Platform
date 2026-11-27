/**
 * SignupPage  /signup
 * 회원가입 페이지 — SignupScreen 래핑 + Supabase Auth 연동 예정
 */

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SignupScreen from "../components/auth/SignupScreen";
import { saveExhibition } from "../lib/api";
import type { ExhibitionData } from "../types";

interface LocationState {
  exhibition?: ExhibitionData;
  exhibitionId?: string;
}

export default function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;
  const exhibition = state.exhibition;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!exhibition) return null;

  const handleComplete = async (_email: string, _password: string) => {
    setSaving(true);
    setError(null);
    try {
      // TODO: Supabase Auth — 계정 생성 후 uid를 exhibition에 연결
      // const { user } = await supabase.auth.signUp({ email, password })
      const id = await saveExhibition(exhibition, state.exhibitionId);
      navigate(`/gallery/${id}`);
    } catch {
      setError("저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      setSaving(false);
    }
  };

  return (
    <>
      <SignupScreen onComplete={handleComplete} />

      {saving && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(247,243,235,0.88)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 16, backdropFilter: "blur(4px)",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            border: "3px solid #ddd0bd", borderTopColor: "#76563e",
            animation: "spin 0.8s linear infinite",
          }} />
          <p style={{ fontFamily: "var(--sans)", color: "var(--text-h)", fontSize: 15 }}>
            전시관을 개설하는 중입니다…
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {error && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "#a64b3c", color: "#fff",
          padding: "12px 24px", borderRadius: 8,
          fontFamily: "var(--sans)", fontSize: 14,
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)", zIndex: 9999,
        }}>
          {error}
        </div>
      )}
    </>
  );
}
