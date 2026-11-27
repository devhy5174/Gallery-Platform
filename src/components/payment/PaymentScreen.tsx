import "./PaymentScreen.css";

interface Props {
  exhibitionTitle: string;
  onBack: () => void;
  onPaid: () => void; // 결제 완료 → SignupScreen
}

const BENEFITS = [
  "고유 전시 URL 발급 (공유 가능)",
  "작품 최대 12점 전시",
  "3D 갤러리 + 미디어전시관",
  "무제한 공유 · QR 코드 지원",
  "전시 내용 언제든 수정",
  "영구 보관",
];

export default function PaymentScreen({ exhibitionTitle, onBack, onPaid }: Props) {
  return (
    <div className="payment">
      <div className="payment__inner">

        {/* 헤더 */}
        <div className="payment__header">
          <button className="payment__back" onClick={onBack}>
            ← 미리보기로 돌아가기
          </button>
        </div>

        {/* 카드 */}
        <div className="payment__card">
          <div className="payment__card-top">
            <span className="payment__seal">전</span>
            <div>
              <p className="payment__label">전시 개설</p>
              <h2 className="payment__title">{exhibitionTitle || "무제 전시회"}</h2>
            </div>
          </div>

          <div className="payment__divider" />

          {/* 가격 */}
          <div className="payment__price-row">
            <span className="payment__price">₩100,000</span>
            <span className="payment__price-tag">평생 이용권</span>
          </div>

          <div className="payment__divider" />

          {/* 혜택 */}
          <ul className="payment__benefits">
            {BENEFITS.map((b) => (
              <li key={b} className="payment__benefit">
                <span className="payment__check">✓</span>
                {b}
              </li>
            ))}
          </ul>

          <div className="payment__divider" />

          {/* 결제 버튼 */}
          <button className="payment__btn" onClick={onPaid}>
            <img
              className="payment__toss-logo"
              src="https://static.toss.im/icons/png/4x/icon-toss-logo.png"
              alt=""
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            토스페이먼츠로 결제하기
          </button>

          <p className="payment__notice">
            결제 후 계정을 생성하면 전시 URL이 발급됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
