import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const FEATURES = [
  {
    icon: "⬡",
    title: "3D 갤러리",
    desc: "실제 미술관처럼 공간을 걸어다니며 작품을 감상합니다.",
  },
  {
    icon: "▶",
    title: "미디어전시관",
    desc: "음악과 함께 작품이 자동으로 흘러가는 슬라이드쇼.",
  },
  {
    icon: "🔗",
    title: "고유 URL 발급",
    desc: "링크 하나로 가족, 친구, 고객 누구에게나 공유.",
  },
  {
    icon: "✦",
    title: "최대 12점 전시",
    desc: "사진을 올리면 슬롯에 자동 배치, 순서도 자유롭게.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">

      {/* ── 헤더 ── */}
      <header className="landing__header">
        <div className="landing__logo">
          <span className="landing__seal">전</span>
          <span className="landing__logo-text">온라인 전시관</span>
        </div>
        <button className="landing__header-cta" onClick={() => navigate("/create")}>
          전시 만들기
        </button>
      </header>

      {/* ── 히어로 ── */}
      <section className="landing__hero">
        <p className="landing__eyebrow">셀프서비스 3D 갤러리 플랫폼</p>
        <h1 className="landing__headline">
          나만의 온라인<br />전시관을 만드세요
        </h1>
        <p className="landing__subheadline">
          사진 최대 12장을 올리면<br className="landing__br-mobile" /> 3D 갤러리에 자동으로 배치됩니다.<br />
          결제 전에 먼저 직접 체험해보세요.
        </p>
        <button className="landing__cta" onClick={() => navigate("/create")}>
          무료로 먼저 만들어보기 →
        </button>
        <p className="landing__cta-hint">결제 없이 미리보기까지 무료</p>
      </section>

      {/* ── 기능 카드 ── */}
      <section className="landing__features">
        <h2 className="landing__section-title">갤러리에 담긴 것들</h2>
        <ul className="landing__feature-list">
          {FEATURES.map((f) => (
            <li key={f.title} className="landing__feature-card">
              <span className="landing__feature-icon">{f.icon}</span>
              <strong className="landing__feature-title">{f.title}</strong>
              <p className="landing__feature-desc">{f.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 가격 ── */}
      <section className="landing__pricing">
        <div className="landing__pricing-card">
          <p className="landing__pricing-label">전시 개설 · 평생 이용권</p>
          <p className="landing__pricing-price">₩100,000</p>
          <ul className="landing__pricing-list">
            <li>✓ 고유 전시 URL 발급</li>
            <li>✓ 3D 갤러리 + 미디어전시관</li>
            <li>✓ 작품 최대 12점</li>
            <li>✓ 무제한 공유 · QR 코드</li>
            <li>✓ 전시 내용 언제든 수정</li>
          </ul>
          <button className="landing__cta landing__cta--accent" onClick={() => navigate("/create")}>
            지금 만들어보기 →
          </button>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer className="landing__footer">
        <p>© 2025 온라인 전시관</p>
      </footer>

    </div>
  );
}
