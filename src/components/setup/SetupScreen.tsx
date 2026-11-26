/**
 * SetupScreen
 * 전시회 설정 화면 — 제목/소개 입력 + 사진 업로드 + 작품 메타데이터 편집
 */

import { useState, useRef, useCallback } from "react";
import type { ArtworkItem, ExhibitionData } from "../../types";
import { MAX_ARTWORKS } from "../../utils/slotMapper";
import "./SetupScreen.css";

interface Props {
  onComplete: (data: ExhibitionData) => void;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function SetupScreen({ onComplete }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [artworks, setArtworks] = useState<ArtworkItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedArtwork = artworks.find((a) => a.id === selectedId) ?? null;

  // ── 파일 추가 ────────────────────────────────────────────────

  const addFiles = useCallback((files: FileList | File[]) => {
    const remaining = MAX_ARTWORKS - artworks.length;
    if (remaining <= 0) return;

    const imageFiles = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, remaining);

    const newItems: ArtworkItem[] = imageFiles.map((file) => ({
      id: generateId(),
      title: file.name.replace(/\.[^.]+$/, ""),
      description: "",
      imageUrl: URL.createObjectURL(file),
      file,
    }));

    setArtworks((prev) => {
      const updated = [...prev, ...newItems];
      if (!selectedId && newItems.length > 0) setSelectedId(newItems[0].id);
      return updated;
    });
  }, [artworks.length, selectedId]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  // ── 순서 변경 ────────────────────────────────────────────────

  const moveArtwork = (id: string, dir: -1 | 1) => {
    setArtworks((prev) => {
      const idx = prev.findIndex((a) => a.id === id);
      if (idx < 0) return prev;
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  };

  // ── 삭제 ────────────────────────────────────────────────────

  const removeArtwork = (id: string) => {
    setArtworks((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      if (selectedId === id) setSelectedId(updated[0]?.id ?? null);
      return updated;
    });
  };

  // ── 메타데이터 편집 ──────────────────────────────────────────

  const updateArtwork = (id: string, patch: Partial<Pick<ArtworkItem, "title" | "description">>) => {
    setArtworks((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } : a));
  };

  // ── 완료 ────────────────────────────────────────────────────

  const handleSubmit = () => {
    if (!title.trim() || artworks.length === 0) return;
    onComplete({ title: title.trim(), description: description.trim(), artworks });
  };

  const canSubmit = title.trim().length > 0 && artworks.length > 0;

  return (
    <div className="setup">
      <header className="setup-header">
        <div className="setup-header__logo">
          <span className="setup-header__seal">전</span>
          <span className="setup-header__title">나만의 온라인 전시관</span>
        </div>
      </header>

      <main className="setup-main">
        {/* ── 왼쪽: 전시 정보 ── */}
        <section className="setup-info">
          <h2 className="setup-section-title">전시 정보</h2>

          <div className="setup-field">
            <label className="setup-label">전시 제목 *</label>
            <input
              className="setup-input"
              type="text"
              placeholder="예: 봄날의 기억"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={40}
            />
          </div>

          <div className="setup-field">
            <label className="setup-label">전시 소개</label>
            <textarea
              className="setup-textarea"
              placeholder="전시에 대한 소개를 입력하세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={300}
            />
          </div>

          {/* 선택된 작품 편집 */}
          {selectedArtwork && (
            <div className="setup-artwork-edit">
              <h3 className="setup-section-title setup-section-title--sm">작품 정보 편집</h3>
              <img
                className="setup-artwork-preview"
                src={selectedArtwork.imageUrl}
                alt={selectedArtwork.title}
              />
              <div className="setup-field">
                <label className="setup-label">작품 제목</label>
                <input
                  className="setup-input"
                  type="text"
                  value={selectedArtwork.title}
                  onChange={(e) => updateArtwork(selectedArtwork.id, { title: e.target.value })}
                  maxLength={60}
                />
              </div>
              <div className="setup-field">
                <label className="setup-label">작품 설명</label>
                <textarea
                  className="setup-textarea"
                  value={selectedArtwork.description}
                  onChange={(e) => updateArtwork(selectedArtwork.id, { description: e.target.value })}
                  rows={3}
                  maxLength={200}
                />
              </div>
            </div>
          )}
        </section>

        {/* ── 오른쪽: 사진 업로드 & 그리드 ── */}
        <section className="setup-photos">
          <div className="setup-photos-header">
            <h2 className="setup-section-title">작품 사진</h2>
            <span className="setup-photos-count">
              {artworks.length} / {MAX_ARTWORKS}
            </span>
          </div>

          {/* 업로드 영역 */}
          {artworks.length < MAX_ARTWORKS && (
            <div
              className={`setup-dropzone${isDragOver ? " setup-dropzone--over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="setup-dropzone__icon">🖼</span>
              <p className="setup-dropzone__text">
                사진을 드래그하거나 클릭하여 업로드
              </p>
              <p className="setup-dropzone__hint">
                최대 {MAX_ARTWORKS}장 · JPG, PNG, WEBP
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleFileInput}
              />
            </div>
          )}

          {/* 업로드된 사진 그리드 */}
          {artworks.length > 0 && (
            <ul className="setup-grid">
              {artworks.map((artwork, idx) => (
                <li
                  key={artwork.id}
                  className={`setup-grid__item${selectedId === artwork.id ? " setup-grid__item--selected" : ""}`}
                  onClick={() => setSelectedId(artwork.id)}
                >
                  <img src={artwork.imageUrl} alt={artwork.title} className="setup-grid__img" />
                  <span className="setup-grid__num">{idx + 1}</span>
                  <div className="setup-grid__actions">
                    <button
                      className="setup-grid__btn"
                      onClick={(e) => { e.stopPropagation(); moveArtwork(artwork.id, -1); }}
                      disabled={idx === 0}
                      title="앞으로"
                    >←</button>
                    <button
                      className="setup-grid__btn setup-grid__btn--del"
                      onClick={(e) => { e.stopPropagation(); removeArtwork(artwork.id); }}
                      title="삭제"
                    >✕</button>
                    <button
                      className="setup-grid__btn"
                      onClick={(e) => { e.stopPropagation(); moveArtwork(artwork.id, 1); }}
                      disabled={idx === artworks.length - 1}
                      title="뒤로"
                    >→</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="setup-footer">
        <p className="setup-footer__hint">
          {!canSubmit && "전시 제목을 입력하고 사진을 1장 이상 추가해주세요"}
        </p>
        <button
          className="setup-submit-btn"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          전시관 미리보기 →
        </button>
      </footer>
    </div>
  );
}
