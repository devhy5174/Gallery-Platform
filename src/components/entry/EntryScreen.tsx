import type { ExhibitionData } from "../../types";
import "./EntryScreen.css";

interface Props {
  exhibition: ExhibitionData;
  onEnterGallery: () => void;
  onEnterMediaRoom: () => void;
  onEdit?: () => void;
}

export default function EntryScreen({ exhibition, onEnterGallery, onEnterMediaRoom, onEdit }: Props) {
  return (
    <div className="entry">
      {onEdit && (
        <button className="entry__edit-btn" onClick={onEdit}>
          전시 편집
        </button>
      )}
      <div className="entry__inner">

        <div className="entry__seal">전</div>

        <div className="entry__text">
          <h1 className="entry__title">{exhibition.title || "무제 전시회"}</h1>
          {exhibition.description && (
            <p className="entry__desc">{exhibition.description}</p>
          )}
        </div>

        <div className="entry__divider" />

        <div className="entry__actions">
          <button className="entry__btn entry__btn--primary" onClick={onEnterGallery}>
            <span className="entry__btn-icon">⬡</span>
            3D 갤러리 입장
          </button>
          <button className="entry__btn entry__btn--secondary" onClick={onEnterMediaRoom}>
            <span className="entry__btn-icon">▶</span>
            미디어전시관 바로가기
          </button>
        </div>

        <p className="entry__hint">작품 {exhibition.artworks.length}점 전시 중</p>
      </div>
    </div>
  );
}
