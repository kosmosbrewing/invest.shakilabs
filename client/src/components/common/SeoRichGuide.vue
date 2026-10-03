<script setup lang="ts">
import { chunkParagraph } from "../../data/digests/format";
/**
 * SEO 리치 가이드 섹션 컴포넌트
 * 각 계산기 뷰 하단에 도메인 가이드 + FAQ + 체크리스트를 출력하여
 * vite-ssg SSR 시 HTML에 실제 텍스트가 반영되도록 한다.
 *
 * 읽는 줄 길이 캡(65ch)은 <section>이 아니라 안쪽 p·li에 건다.
 * 카드째 좁히면 폭을 채운 계산기 카드(1152px) 아래에 650px짜리 산문 카드가 놓여
 * 우변이 어긋난다 — 줄이 길어서 생기는 문제를 카드 폭으로 푼 것이 원인이었다.
 */
export interface GuideSection {
  h2: string;
  // 문자열 그대로(기존 호출부) 또는 문단 배열 — 250자 넘는 단일 문단 결함(BRIEF-V8) 수정 후
  // 긴 섹션은 배열로 넘겨 각 문단을 250자 이내로 쪼갠다. 문장 삭제·숫자 변경 없음.
  body: string | string[];
}

export interface GuideFaq {
  q: string;
  a: string;
}

export interface GuideChecklist {
  title: string;
  items: string[];
}

export interface GuideSource {
  label: string;
  url: string;
}

defineProps<{
  title: string;
  intro: string;
  sections?: GuideSection[];
  faqs?: GuideFaq[];
  checklist?: GuideChecklist;
  sources?: GuideSource[];
  disclaimer?: string;
}>();

// body가 문자열이면 렌더 시점에 문장 경계로 ≤250자 문단으로 나눈다(데이터 쪽 chunkParagraph를 놓친
// 다이제스트 — dividend-tax 265자 — 까지 한 규칙으로). 배열이면 그대로.
function paragraphsOf(body: string | string[]): string[] {
  return Array.isArray(body) ? body : chunkParagraph(body);
}
</script>

<template>
  <section class="seo-rich-guide space-y-4 rounded-lg border border-border/40 bg-muted/10 p-4 md:p-6">
    <header class="space-y-2">
      <h2 class="text-xl font-bold text-foreground">{{ title }}</h2>
      <p class="max-w-[65ch] text-sm leading-relaxed text-muted-foreground">{{ intro }}</p>
    </header>

    <div v-if="sections && sections.length > 0" class="space-y-4">
      <article
        v-for="(s, i) in sections"
        :key="`sec-${i}`"
        class="space-y-2"
      >
        <h3 class="text-base font-semibold text-foreground">{{ s.h2 }}</h3>
        <p
          v-for="(paragraph, pIdx) in paragraphsOf(s.body)"
          :key="`sec-${i}-p-${pIdx}`"
          class="max-w-[65ch] text-sm leading-relaxed text-muted-foreground"
        >{{ paragraph }}</p>
      </article>
    </div>

    <div v-if="checklist && checklist.items.length > 0" class="space-y-2">
      <h3 class="text-base font-semibold text-foreground">{{ checklist.title }}</h3>
      <ul class="ml-4 max-w-[65ch] list-disc space-y-1 text-sm text-muted-foreground">
        <li v-for="(item, i) in checklist.items" :key="`chk-${i}`">
          {{ item }}
        </li>
      </ul>
    </div>

    <div v-if="faqs && faqs.length > 0" class="space-y-3">
      <h3 class="text-base font-semibold text-foreground">자주 묻는 질문 (FAQ)</h3>
      <div
        v-for="(faq, i) in faqs"
        :key="`faq-${i}`"
        class="space-y-1"
      >
        <p class="max-w-[65ch] text-sm font-semibold text-foreground">Q. {{ faq.q }}</p>
        <p class="max-w-[65ch] text-sm leading-relaxed text-muted-foreground">A. {{ faq.a }}</p>
      </div>
    </div>

    <!-- 공식 출처: 정부·공공 원자료로 가는 링크 (신뢰 신호, nofollow 금지) -->
    <div v-if="sources && sources.length > 0" class="space-y-2">
      <h3 class="text-base font-semibold text-foreground">공식 출처</h3>
      <ul class="ml-4 max-w-[65ch] list-disc space-y-1 text-sm text-muted-foreground">
        <li v-for="(src, i) in sources" :key="`src-${i}`">
          <a
            :href="src.url"
            target="_blank"
            rel="noopener noreferrer"
            class="underline underline-offset-2 hover:text-foreground"
          >{{ src.label }}</a>
        </li>
      </ul>
    </div>

    <p
      v-if="disclaimer"
      class="max-w-[65ch] border-t border-border/40 pt-3 text-xs text-muted-foreground"
    >
      {{ disclaimer }}
    </p>
  </section>
</template>
