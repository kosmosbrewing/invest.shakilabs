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
    path: "/dividend-tax",
    name: "dividend-tax",
    component: () => import("@/views/DividendTaxView.vue"),
    meta: { title: "배당소득세 계산기 | 투자 세금 계산기" },
  },
  {
    path: "/isa",
    name: "isa",
    component: () => import("@/views/IsaView.vue"),
    meta: { title: "ISA 만기 세후 비교 | 투자 세금 계산기" },
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
