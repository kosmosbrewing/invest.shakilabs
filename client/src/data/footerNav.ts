import type { SiteFooterLink, SiteFooterSection } from "@shakilabs/ui";

/** 푸터 계산기 목록 — 라우터의 실제 경로만 담는다(리다이렉트 별칭 제외) */
export const FOOTER_SECTIONS: readonly SiteFooterSection[] = [
  {
    title: "투자 세금",
    links: [
    { to: "/crypto-tax", label: "가상자산 세금" },
    { to: "/dividend-tax", label: "배당소득세" },
    { to: "/foreign-stock-tax", label: "해외주식 양도세" },
    { to: "/isa", label: "ISA 만기 비교" },
    ],
  },
  {
    title: "저축·자산 성장",
    links: [
    { to: "/savings-interest", label: "적금 이자" },
    { to: "/deposit-interest", label: "예금 이자" },
    { to: "/compound-interest", label: "복리 성장" },
    ],
  },
  {
    title: "자산 이전",
    links: [
    { to: "/gift-tax", label: "증여세" },
    { to: "/inheritance-tax", label: "상속세" },
    ],
  },
];

export const FOOTER_ALL_LINK: SiteFooterLink = {
  to: "/all",
  label: "전체 계산기 보기 →",
};
