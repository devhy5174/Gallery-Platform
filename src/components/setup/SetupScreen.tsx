/**
 * SetupScreen
 * 전시회 설정 화면 — 제목/소개 입력 + 사진 업로드 + 작품 메타데이터 편집
 */

import { useState, useRef, useCallback, useEffect } from "react";
import type { ArtworkItem, ExhibitionData } from "../../types";
import { MAX_ARTWORKS, SLOT_ORDER } from "../../utils/slotMapper";
import "./SetupScreen.css";

interface Props {
  onComplete: (data: ExhibitionData) => void;
  initialData?: ExhibitionData;
}

const SLOT_LABELS: Record<string, string> = {
  "back-main":    "뒷벽 메인",
  "left-7":       "왼쪽 가운데",
  "right-7":      "오른쪽 가운데",
  "front-2":      "앞벽 중앙",
  "left-1":       "왼쪽",
  "right-1":      "오른쪽",
  "left-n5":      "왼쪽 뒤",
  "right-n5":     "오른쪽 뒤",
  "front-1":      "앞벽 좌",
  "front-3":      "앞벽 우",
  "back-left-1":  "뒷벽 좌측",
  "back-right-1": "뒷벽 우측",
};

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function SetupScreen({ onComplete, initialData }: Props) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [artworks, setArtworks] = useState<ArtworkItem[]>(initialData?.artworks ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(initialData?.artworks[0]?.id ?? null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragIdRef = useRef<string | null>(null);

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

  // ── 드래그 순서 변경 (PC + 모바일 공용) ─────────────────────

  const reorderArtwork = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    setArtworks((prev) => {
      const arr = [...prev];
      const fi = arr.findIndex((a) => a.id === fromId);
      const ti = arr.findIndex((a) => a.id === toId);
      if (fi < 0 || ti < 0) return prev;
      const [item] = arr.splice(fi, 1);
      arr.splice(ti, 0, item);
      return arr;
    });
  };

  // PC drag-and-drop
  const onDragStart = (id: string) => { dragIdRef.current = id; };
  const onDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };
  const onDrop = (id: string) => {
    if (dragIdRef.current) reorderArtwork(dragIdRef.current, id);
    dragIdRef.current = null;
    setDragOverId(null);
  };
  const onDragEnd = () => { dragIdRef.current = null; setDragOverId(null); };

  // 모바일 touch
  const onTouchStart = (_e: React.TouchEvent, id: string) => {
    dragIdRef.current = id;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragIdRef.current) return;
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const target = el?.closest("[data-artwork-id]") as HTMLElement | null;
    setDragOverId(target?.dataset.artworkId ?? null);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!dragIdRef.current) return;
    const touch = e.changedTouches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const target = el?.closest("[data-artwork-id]") as HTMLElement | null;
    const toId = target?.dataset.artworkId;
    if (toId) reorderArtwork(dragIdRef.current, toId);
    dragIdRef.current = null;
    setDragOverId(null);
  };

  // 모바일 touch-action: none 등록 (passive 방지)
  const gridRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const prevent = (e: TouchEvent) => { if (dragIdRef.current) e.preventDefault(); };
    el.addEventListener("touchmove", prevent, { passive: false });
    return () => el.removeEventListener("touchmove", prevent);
  }, []);

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

          {/* 전체 작품 정보 편집 */}
          {artworks.length > 0 && (
            <div className="setup-artwork-list">
              <h3 className="setup-section-title setup-section-title--sm">
                작품 정보 <span className="setup-artwork-list__count">{artworks.length}점</span>
              </h3>
              {artworks.map((artwork, idx) => (
                <div
                  key={artwork.id}
                  className={`setup-artwork-item${selectedId === artwork.id ? " setup-artwork-item--active" : ""}`}
                  onClick={() => setSelectedId(artwork.id)}
                >
                  <div className="setup-artwork-item__header">
                    <img
                      className="setup-artwork-item__thumb"
                      src={artwork.imageUrl}
                      alt={artwork.title}
                    />
                    <div className="setup-artwork-item__meta">
                      <span className="setup-artwork-item__num">{idx + 1}</span>
                      <span className="setup-artwork-item__slot">{SLOT_LABELS[SLOT_ORDER[idx]]}</span>
                    </div>
                  </div>
                  <input
                    className="setup-input setup-input--sm"
                    type="text"
                    placeholder="작품 제목"
                    value={artwork.title}
                    onChange={(e) => updateArtwork(artwork.id, { title: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    maxLength={60}
                  />
                  <textarea
                    className="setup-textarea setup-textarea--sm"
                    placeholder="작품 설명 (선택)"
                    value={artwork.description}
                    onChange={(e) => updateArtwork(artwork.id, { description: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    rows={2}
                    maxLength={200}
                  />
                </div>
              ))}
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
            <ul className="setup-grid" ref={gridRef}>
              {artworks.map((artwork, idx) => (
                <li
                  key={artwork.id}
                  data-artwork-id={artwork.id}
                  draggable
                  onDragStart={() => onDragStart(artwork.id)}
                  onDragOver={(e) => onDragOver(e, artwork.id)}
                  onDrop={() => onDrop(artwork.id)}
                  onDragEnd={onDragEnd}
                  onTouchStart={(e) => onTouchStart(e, artwork.id)}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                  className={[
                    "setup-grid__item",
                    selectedId === artwork.id ? "setup-grid__item--selected" : "",
                    dragOverId === artwork.id ? "setup-grid__item--drag-over" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => setSelectedId(artwork.id)}
                >
                  <img src={artwork.imageUrl} alt={artwork.title} className="setup-grid__img" />
                  <span className="setup-grid__num">{idx + 1}</span>
                  <span className="setup-grid__slot">{SLOT_LABELS[SLOT_ORDER[idx]]}</span>
                  <div className="setup-grid__actions">
                    <button
                      className="setup-grid__btn setup-grid__btn--del"
                      onClick={(e) => { e.stopPropagation(); removeArtwork(artwork.id); }}
                      title="삭제"
                    >✕</button>
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
