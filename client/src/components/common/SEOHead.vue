<script setup lang="ts">
import { computed } from "vue";
import { useSEO } from "@/composables/useSEO";

const props = withDefaults(
  defineProps<{
    title: string;
    description: string;
    jsonLd?: Record<string, unknown> | Record<string, unknown>[];
    noindex?: boolean;
    /** 변종 URL을 대표 URL로 canonical 통합할 때 대표 경로 ("/compound-interest" 등) */
    canonicalPath?: string;
  }>(),
  {
    noindex: false,
  }
);

useSEO({
  title: computed(() => props.title),
  description: computed(() => props.description),
  jsonLd: computed(() => props.jsonLd),
  noindex: computed(() => props.noindex),
  canonicalPath: computed(() => props.canonicalPath),
});
</script>

<template></template>
