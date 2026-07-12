<script setup lang="ts">
import { computed, useId } from "vue";
import type { CompoundInterestResult } from "@/utils/interestCalculator";
import { formatWon } from "@/lib/utils";
import { linePoint } from "@/utils/chartMath";

const props = defineProps<{ rows: CompoundInterestResult["yearlyData"] }>();
const titleId = `compound-growth-${useId()}`;
const descriptionId = `compound-growth-desc-${useId()}`;
const maximum = computed(() => Math.max(
  ...props.rows.flatMap((row) => [row.invested, row.simpleTotal, row.compoundTotal]),
  0,
));

function x(index: number): number {
  if (props.rows.length <= 1) return 50;
  return 4 + (index / (props.rows.length - 1)) * 92;
}

function points(key: "invested" | "simpleTotal" | "compoundTotal"): string {
  return props.rows.map((row, index) => `${x(index)},${linePoint(row[key], maximum.value)}`).join(" ");
}
</script>

<template>
  <section v-if="rows.length" class="retro-chart space-y-3" :aria-labelledby="titleId">
    <div>
      <h3 :id="titleId" class="text-caption text-muted-foreground">연도별 자산 성장</h3>
      <p :id="descriptionId" class="mt-1 text-tiny text-muted-foreground">0원 기준에서 투자 원금·단리·복리의 누적 금액을 비교합니다.</p>
    </div>
    <svg viewBox="0 0 100 60" class="h-auto w-full" role="img" :aria-labelledby="`${titleId} ${descriptionId}`">
      <line x1="4" y1="52" x2="96" y2="52" class="stroke-border" />
      <polyline :points="points('invested')" fill="none" class="stroke-muted-foreground" stroke-width="1.4" />
      <polyline :points="points('simpleTotal')" fill="none" class="stroke-status-warning" stroke-width="1.8" />
      <polyline :points="points('compoundTotal')" fill="none" class="stroke-primary" stroke-width="2.4" />
    </svg>
    <dl class="grid gap-2 text-tiny sm:grid-cols-3">
      <div class="flex justify-between gap-2"><dt class="text-muted-foreground">투자 원금</dt><dd class="font-semibold">{{ formatWon(rows.at(-1)?.invested ?? 0) }}</dd></div>
      <div class="flex justify-between gap-2"><dt class="text-status-warning">단리</dt><dd class="font-semibold">{{ formatWon(rows.at(-1)?.simpleTotal ?? 0) }}</dd></div>
      <div class="flex justify-between gap-2"><dt class="text-primary">복리</dt><dd class="font-semibold">{{ formatWon(rows.at(-1)?.compoundTotal ?? 0) }}</dd></div>
    </dl>
  </section>
</template>
