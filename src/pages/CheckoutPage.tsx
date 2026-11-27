/**
 * CheckoutPage  /checkout
 * 결제 페이지 — PaymentScreen 래핑
 */

import { useNavigate, useLocation } from "react-router-dom";
import PaymentScreen from "../components/payment/PaymentScreen";
import type { ExhibitionData } from "../types";

interface LocationState {
  exhibition?: ExhibitionData;
  exhibitionId?: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;
  const exhibition = state.exhibition;

  if (!exhibition) {
    return null; // 직접 접근 시 CreatePage로 리다이렉트 (router에서 처리)
  }

  const handlePaid = () => {
    navigate("/signup", {
      state: { exhibition, exhibitionId: state.exhibitionId },
    });
  };

  return (
    <PaymentScreen
      exhibitionTitle={exhibition.title}
      onBack={() => navigate(-1)}
      onPaid={handlePaid}
    />
  );
}
