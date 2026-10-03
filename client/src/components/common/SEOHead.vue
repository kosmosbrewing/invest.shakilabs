<script setup lang="ts">
import { computed } from "vue";
import { useSEO, type TitleKind } from "@/composables/useSEO";

const props = withDefaults(
  defineProps<{
    title: string;
    description: string;
    jsonLd?: Record<string, unknown> | Record<string, unknown>[];
    noindex?: boolean;
    /** 변종 URL을 대표 URL로 canonical 통합할 때 대표 경로 ("/compound-interest" 등) */
    canonicalPath?: string;
    /** 제목 레시피 종류 — 기본값 "calculator"(앱 이름 접미사 없음). 홈·정책류만 명시한다. */
    kind?: TitleKind;
  }>(),
  {
    noindex: false,
    kind: "calculator",
  }
);

useSEO({
  title: computed(() => props.title),
  description: computed(() => props.description),
  jsonLd: computed(() => props.jsonLd),
  noindex: computed(() => props.noindex),
  canonicalPath: computed(() => props.canonicalPath),
  titleKind: computed(() => props.kind),
});
</script>

<template></template>
