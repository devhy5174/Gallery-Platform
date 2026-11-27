import { useState } from "react";
import "./SignupScreen.css";

interface Props {
  onComplete: (email: string, password: string) => void;
}

export default function SignupScreen({ onComplete }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.includes("@")) {
      setError("올바른 이메일 주소를 입력해주세요.");
      return;
    }
    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    onComplete(email, password);
  };

  return (
    <div className="signup">
      <div className="signup__inner">

        {/* 완료 아이콘 */}
        <div className="signup__icon">✓</div>

        <div className="signup__text">
          <h1 className="signup__title">결제가 완료되었습니다</h1>
          <p className="signup__desc">
            전시 URL을 보관할 계정을 만들어주세요.
          </p>
        </div>

        <div className="signup__divider" />

        <form className="signup__form" onSubmit={handleSubmit}>
          <div className="signup__field">
            <label className="signup__label">이메일</label>
            <input
              className="signup__input"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="signup__field">
            <label className="signup__label">비밀번호</label>
            <input
              className="signup__input"
              type="password"
              placeholder="8자 이상"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="signup__field">
            <label className="signup__label">비밀번호 확인</label>
            <input
              className="signup__input"
              type="password"
              placeholder="비밀번호 재입력"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {error && <p className="signup__error">{error}</p>}

          <button className="signup__btn" type="submit">
            전시관 개설 완료 →
          </button>
        </form>

        <p className="signup__login-hint">
          이미 계정이 있으신가요?{" "}
          <button className="signup__login-link" type="button">
            로그인
          </button>
        </p>
      </div>
    </div>
  );
}
