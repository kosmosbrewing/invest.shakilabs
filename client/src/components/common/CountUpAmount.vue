<script setup lang="ts">
// 히어로 금액 카운트업 — invest는 결과 패널 9곳의 히어로가 인라인이라 값 렌더러 하나로 공통화한다.
// 이 컴포넌트가 앱에서 유일한 카운트업 구현이다(보조 스탯에는 쓰지 않는다).
//
// 정책(BL-020, finance ResultHero.vue가 참조 구현):
// - 유일한 트리거는 "포맷된 문자열이 바뀔 때"뿐이다. 로드·하이드레이션·테마 토글·
//   리사이즈·같은 값으로의 재계산에는 재실행하지 않는다(구 구현은 onMounted에서
//   매번 0→값으로 다시 그려 로드마다 카운트업이 재생됐다 — 제거).
// - 초기 displayValue = props.value(최종값)이므로 프리렌더 HTML과 첫 렌더 모두
//   최종값을 보여준다(0 아님).
// - 중단 시 0이 아니라 현재 표시값에서 이어간다.
// - prefers-reduced-motion이면 즉시 최종값. 호출부의 tabular-nums가 폭을 잡는다.
import { onBeforeUnmount, ref, watch } from "vue";

const props = defineProps<{ value: string }>();

const DURATION_MS = 750;
// 포맷된 문자열("1,234,000원")의 첫 숫자 토큰만 보간 대상으로 삼는다.
const NUM_RE = /-?\d[\d,]*(?:\.\d+)?/;

const displayValue = ref(props.value);
let rafId = 0;

function parseNum(text: string): { num: number; decimals: number } | null {
  const m = text.match(NUM_RE);
  if (!m) return null;
  const raw = m[0].replace(/,/g, "");
  const num = Number(raw);
  if (!Number.isFinite(num)) return null;
  const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
  return { num, decimals };
}

function formatLike(template: string, n: number, decimals: number): string {
  const grouped = template.match(NUM_RE)?.[0].includes(",") ?? false;
  const formatted = n.toLocaleString("ko-KR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: grouped,
  });
  return template.replace(NUM_RE, formatted);
}

function animateTo(from: number, target: string) {
  cancelAnimationFrame(rafId);
  const parsed = parseNum(target);
  if (
    !parsed ||
    parsed.num === from ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    displayValue.value = target;
    return;
  }
  const start = performance.now();
  const delta = parsed.num - from;
  const tick = (now: number) => {
    const t = Math.min((now - start) / DURATION_MS, 1);
    if (t >= 1) {
      displayValue.value = target;
      return;
    }
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    displayValue.value = formatLike(target, from + delta * eased, parsed.decimals);
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
}

watch(
  () => props.value,
  (next, previous) => {
    // 같은 포맷 문자열 = 화면상 변화 없음 = 애니메이션 없음.
    if (next === previous) return;
    const current = parseNum(displayValue.value)?.num ?? 0;
    animateTo(current, next);
  },
);

onBeforeUnmount(() => cancelAnimationFrame(rafId));
</script>

<template>
  <span>{{ displayValue }}</span>
</template>
