<script setup lang="ts">
import { computed, useId } from "vue";
import { positiveBarWidth } from "@/utils/chartMath";

type BarItem = { key: string; label: string; value: number; highlight?: boolean };
const props = defineProps<{
  label: string;
  note: string;
  items: readonly BarItem[];
  formatValue: (value: number) => string;
}>();
const titleId = `ranked-${useId()}`;
const maximum = computed(() => Math.max(...props.items.map((item) => item.value), 0));
</script>

<template>
  <section class="retro-chart space-y-3" :aria-labelledby="titleId">
    <div>
      <h3 :id="titleId" class="text-caption text-muted-foreground">{{ label }}</h3>
      <p class="mt-1 text-tiny text-muted-foreground">{{ note }}</p>
    </div>
    <ol class="space-y-3">
      <li v-for="item in items" :key="item.key" class="space-y-1.5">
        <div class="flex items-baseline justify-between gap-3 text-caption">
          <span class="font-semibold" :class="item.highlight ? 'text-primary' : 'text-muted-foreground'">{{ item.label }}</span>
          <strong class="tabular-nums">{{ formatValue(item.value) }}</strong>
        </div>
        <div class="h-3 overflow-hidden rounded-full bg-muted">
          <svg viewBox="0 0 100 12" preserveAspectRatio="none" class="block h-full w-full" aria-hidden="true">
            <rect
              :width="positiveBarWidth(item.value, maximum)"
              height="12"
              rx="4"
              :class="item.highlight ? 'fill-primary' : 'fill-muted-foreground/45'"
            />
          </svg>
        </div>
      </li>
    </ol>
  </section>
</template>
