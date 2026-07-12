<script setup lang="ts">
import { computed, useId } from "vue";
import { normalizeSegments } from "@/utils/chartMath";

type Tone = "primary" | "gain" | "tax" | "muted";
type Segment = { key: string; label: string; value: number; tone: Tone };
const props = defineProps<{
  label: string;
  segments: readonly Segment[];
  formatValue: (value: number) => string;
}>();

const titleId = `breakdown-${useId()}`;
const ratios = computed(() => normalizeSegments(props.segments.map((segment) => segment.value)));
const offsets = computed(() => ratios.value.map((_, index) =>
  ratios.value.slice(0, index).reduce((sum, ratio) => sum + ratio, 0),
));

function fillClass(tone: Tone): string {
  if (tone === "gain") return "fill-chart-net";
  if (tone === "tax") return "fill-chart-tax";
  if (tone === "muted") return "fill-muted-foreground/45";
  return "fill-primary";
}

function dotClass(tone: Tone): string {
  if (tone === "gain") return "bg-chart-net";
  if (tone === "tax") return "bg-chart-tax";
  if (tone === "muted") return "bg-muted-foreground/45";
  return "bg-primary";
}
</script>

<template>
  <section class="retro-chart space-y-3" :aria-labelledby="titleId">
    <h3 :id="titleId" class="text-caption text-muted-foreground">{{ label }}</h3>
    <svg
      v-if="ratios.some((ratio) => ratio > 0)"
      viewBox="0 0 100 18"
      preserveAspectRatio="none"
      class="h-5 w-full overflow-hidden rounded-lg"
      role="img"
      :aria-labelledby="titleId"
    >
      <rect
        v-for="(segment, index) in segments"
        :key="segment.key"
        :x="offsets[index] * 100"
        :width="ratios[index] * 100"
        height="18"
        :class="fillClass(segment.tone)"
      />
    </svg>
    <p v-else class="text-tiny text-muted-foreground">표시할 양수 항목이 없습니다.</p>
    <dl class="grid gap-2 sm:grid-cols-2">
      <div v-for="segment in segments" :key="`${segment.key}-legend`" class="flex items-center justify-between gap-3 text-tiny">
        <dt class="flex items-center gap-1.5 text-muted-foreground">
          <span class="h-2.5 w-2.5 rounded-sm" :class="dotClass(segment.tone)" />
          {{ segment.label }}
        </dt>
        <dd class="font-semibold tabular-nums">{{ formatValue(segment.value) }}</dd>
      </div>
    </dl>
  </section>
</template>
