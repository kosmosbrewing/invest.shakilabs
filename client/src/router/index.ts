import { nextTick } from "vue";
import type { Router, RouteRecordRaw } from "vue-router";
import { trackPageView } from "@/lib/analytics";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/crypto-tax",
  },
  {
    path: "/crypto-tax",
    name: "crypto-tax",
    component: () => import("@/views/CryptoTaxView.vue"),
    meta: { title: "가상자산 세금 시뮬레이터 | 투자 세금 계산기" },
  },
  {
    path: "/crypto-tax/:amount(\\d+)",
    name: "crypto-tax-amount",
    component: () => import("@/views/CryptoTaxView.vue"),
    props: (route) => ({ initialPurchase: Number(route.params.amount) * 10000 }),
    meta: { title: "가상자산 세금 시뮬레이터 | 투자 세금 계산기" },
  },
  {
    path: "/dividend-tax",
    name: "dividend-tax",
    component: () => import("@/views/DividendTaxView.vue"),
    meta: { title: "배당소득세 계산기 | 투자 세금 계산기" },
  },
  {
    path: "/dividend-tax/:amount(\\d+)",
    name: "dividend-tax-amount",
    component: () => import("@/views/DividendTaxView.vue"),
    props: (route) => ({ initialDividend: Number(route.params.amount) * 10000 }),
    meta: { title: "배당소득세 계산기 | 투자 세금 계산기" },
  },
  {
    path: "/isa",
    name: "isa",
    component: () => import("@/views/IsaView.vue"),
    meta: { title: "ISA 만기 세후 비교 | 투자 세금 계산기" },
  },
  {
    path: "/isa/:amount(\\d+)",
    name: "isa-amount",
    component: () => import("@/views/IsaView.vue"),
    props: (route) => ({ initialAnnual: Number(route.params.amount) * 10000 }),
    meta: { title: "ISA 만기 세후 비교 | 투자 세금 계산기" },
  },
  {
    path: "/gift-tax",
    name: "gift-tax",
    component: () => import("@/views/GiftTaxView.vue"),
    meta: { title: "증여세 계산기 | 투자 세금 계산기" },
  },
  {
    path: "/gift-tax/:amount(\\d+)",
    name: "gift-tax-amount",
    component: () => import("@/views/GiftTaxView.vue"),
    props: (route) => ({ initialGift: Number(route.params.amount) * 10000 }),
    meta: { title: "증여세 계산기 | 투자 세금 계산기" },
  },
  {
    path: "/inheritance-tax",
    name: "inheritance-tax",
    component: () => import("@/views/InheritanceTaxView.vue"),
    meta: { title: "상속세 계산기 | 투자 세금 계산기" },
  },
  {
    path: "/inheritance-tax/:amount(\\d+)",
    name: "inheritance-tax-amount",
    component: () => import("@/views/InheritanceTaxView.vue"),
    props: (route) => ({ initialEstate: Number(route.params.amount) * 10000 }),
    meta: { title: "상속세 계산기 | 투자 세금 계산기" },
  },
  {
    path: "/foreign-stock-tax",
    name: "foreign-stock-tax",
    component: () => import("@/views/ForeignStockTaxView.vue"),
    meta: { title: "해외주식 양도소득세 계산기 | 투자 세금 계산기" },
  },
  {
    path: "/foreign-stock-tax/:amount(\\d+)",
    name: "foreign-stock-tax-amount",
    component: () => import("@/views/ForeignStockTaxView.vue"),
    props: (route) => ({ initialSellAmount: Number(route.params.amount) * 10000 }),
    meta: { title: "해외주식 양도소득세 계산기 | 투자 세금 계산기" },
  },
  {
    path: "/savings-interest",
    name: "savings-interest",
    component: () => import("@/views/SavingsInterestView.vue"),
    meta: { title: "적금 이자 계산기 | 투자 계산기" },
  },
  {
    path: "/savings-interest/:amount(\\d+)",
    name: "savings-interest-amount",
    component: () => import("@/views/SavingsInterestView.vue"),
    props: (route) => ({ initialMonthlyMan: Number(route.params.amount) }),
    meta: { title: "적금 이자 계산기 | 투자 계산기" },
  },
  {
    path: "/deposit-interest",
    name: "deposit-interest",
    component: () => import("@/views/DepositInterestView.vue"),
    meta: { title: "예금 이자 계산기 | 투자 계산기" },
  },
  {
    path: "/deposit-interest/:amount(\\d+)",
    name: "deposit-interest-amount",
    component: () => import("@/views/DepositInterestView.vue"),
    props: (route) => ({ initialPrincipalMan: Number(route.params.amount) }),
    meta: { title: "예금 이자 계산기 | 투자 계산기" },
  },
  {
    path: "/compound-interest",
    name: "compound-interest",
    component: () => import("@/views/CompoundInterestView.vue"),
    meta: { title: "복리 계산기 | 투자 계산기" },
  },
  {
    path: "/compound-interest/:amount(\\d+)",
    name: "compound-interest-amount",
    component: () => import("@/views/CompoundInterestView.vue"),
    props: (route) => ({ initialAmountMan: Number(route.params.amount) }),
    meta: { title: "복리 계산기 | 투자 계산기" },
  },
  {
    path: "/about",
    name: "about",
    component: () => import("@/views/AboutView.vue"),
    meta: { title: "서비스 안내 | 투자 세금 계산기" },
  },
  {
    path: "/terms",
    name: "terms",
    component: () => import("@/views/TermsView.vue"),
    meta: { title: "이용약관 | 투자 세금 계산기" },
  },
  {
    path: "/privacy",
    name: "privacy",
    component: () => import("@/views/PrivacyView.vue"),
    meta: { title: "개인정보 처리방침 | 투자 세금 계산기" },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/views/NotFoundView.vue"),
    meta: { title: "페이지를 찾을 수 없습니다 | 투자 세금 계산기" },
  },
];

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function createScrollBehavior(): Router["options"]["scrollBehavior"] {
  return (_to, _from, savedPosition) => {
    if (savedPosition) return savedPosition;
    return { top: 0 };
  };
}

export function setupRouterGuards(router: Router): void {
  router.beforeEach((to) => {
    if (!isBrowser() || !to.meta.title) return;
    document.title = to.meta.title as string;
  });

  router.afterEach((to, _from, failure) => {
    if (failure || !isBrowser()) return;
    void nextTick(() => {
      trackPageView(to.fullPath, document.title);
    });
  });
}
