-- ============================================================
-- Gallery Platform — Supabase 스키마
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 실행
-- ============================================================

-- ── 테이블 ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS exhibitions (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT        NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artworks (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  exhibition_id  UUID        NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,
  slot_order     INTEGER     NOT NULL,  -- 0-based, SLOT_ORDER 배열 인덱스
  title          TEXT,
  description    TEXT,
  image_url      TEXT        NOT NULL,  -- Supabase Storage public URL
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS artworks_exhibition_id_idx ON artworks(exhibition_id);

-- ── updated_at 자동 갱신 ────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER exhibitions_updated_at
  BEFORE UPDATE ON exhibitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS (Row Level Security) ────────────────────────────────
-- 현재: 인증 없이 전체 공개 (회원가입 연동 전 임시)

ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read exhibitions"  ON exhibitions FOR SELECT USING (true);
CREATE POLICY "public insert exhibitions" ON exhibitions FOR INSERT WITH CHECK (true);
CREATE POLICY "public update exhibitions" ON exhibitions FOR UPDATE USING (true);

CREATE POLICY "public read artworks"   ON artworks FOR SELECT USING (true);
CREATE POLICY "public insert artworks" ON artworks FOR INSERT WITH CHECK (true);
CREATE POLICY "public delete artworks" ON artworks FOR DELETE USING (true);

-- ── Storage ─────────────────────────────────────────────────
-- 아래는 SQL로 실행 불가 → 대시보드에서 수동으로 생성
--
-- 1. Storage → New bucket
--    - Name: gallery-images
--    - Public bucket: ON
--
-- 2. Policies → gallery-images 버킷에 추가:
--    - SELECT: true (공개 읽기)
--    - INSERT: true (인증 없이 업로드 허용, 임시)
