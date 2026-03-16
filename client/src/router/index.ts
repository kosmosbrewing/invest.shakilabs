import { nextTick } from "vue";
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { trackPageView } from "@/lib/analytics";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/crypto-tax",
  },
  {
    path: "/crypto-tax",
    name: "crypto-tax",
    component: () => import("@/views/CryptoTaxView.vue"),
    meta: { title: "가상자산 세금 시뮬레이터 | invest.shakilabs.com" },
  },
  {
    path: "/dividend-tax",
    name: "dividend-tax",
    component: () => import("@/views/DividendTaxView.vue"),
    meta: { title: "배당소득세 계산기 | invest.shakilabs.com" },
  },
  {
    path: "/isa",
    name: "isa",
    component: () => import("@/views/IsaView.vue"),
    meta: { title: "ISA 만기 세후 비교 | invest.shakilabs.com" },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/views/NotFoundView.vue"),
    meta: { title: "404 | invest.shakilabs.com" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0 };
  },
});

router.beforeEach((to) => {
  if (typeof document !== "undefined" && to.meta.title) {
    document.title = to.meta.title as string;
  }
});

router.afterEach((to, _from, failure) => {
  if (failure || typeof document === "undefined") return;
  void nextTick(() => {
    trackPageView(to.fullPath, document.title);
  });
});

export default router;
