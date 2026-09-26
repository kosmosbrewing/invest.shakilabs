import type { PrimaryNavigationItem } from "@shakilabs/ui";

/** 2차 내비(TabNavigation)와 모바일 드로어(AppHeader)가 공유하는 단일 출처.
 * v3 §3.3-1 — 목록을 두 곳에 복제하지 않는다.
 *
 * investNavigation.ts의 INVEST_TOOL_GROUPS(9개 도구 전체 카탈로그, /all 관련도구용)와는
 * 다른 목록이다 — 이 파일은 상단 탭에 실제로 노출되는 5개 항목만 담는다. */
export const INVEST_TABS: readonly PrimaryNavigationItem[] = [
  { key: "all", label: "투자 도구", to: "/all" },
  { key: "crypto-tax", label: "가상자산세", to: "/crypto-tax" },
  { key: "dividend-tax", label: "배당소득세", to: "/dividend-tax" },
  { key: "isa", label: "ISA 비교", to: "/isa" },
  { key: "gift-tax", label: "증여세", to: "/gift-tax" },
];
