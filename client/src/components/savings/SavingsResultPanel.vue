<script setup lang="ts">
import CountUpAmount from "@/components/common/CountUpAmount.vue";
import { computed } from "vue";
import { ShBreakdownBar } from "@shakilabs/ui";
import ResultMetricTable from "@/components/result/ResultMetricTable.vue";
import { Badge } from "@/components/ui/badge";
import type { SavingsInterestResult } from "@/utils/interestCalculator";
import { formatWon, formatPercent } from "@/lib/utils";

const props = defineProps<{
  result: SavingsInterestResult;
}>();

const metricRows = computed(() => [
  {
    label: "원금 합계",
    value: formatWon(props.result.totalPrincipal),
    description: "월 적립액 × 적금 기간",
  },
  {
    label: "세전 이자",
    value: formatWon(props.result.grossInterest),
    description: "단리 기준 세전 이자 합계",
    tone: "success" as const,
  },
  {
    label: "이자소득세",
    value: formatWon(props.result.tax),
    description: props.result.tax > 0 ? "이자에 부과되는 세금" : "비과세 적용",
    tone: props.result.tax > 0 ? ("danger" as const) : ("default" as const),
  },
  {
    label: "세후 이자",
    value: formatWon(props.result.netInterest),
    description: `실효 수익률 ${formatPercent(props.result.effectiveRate)}`,
    tone: "primary" as const,
  },
]);
const segments = computed(() => [
  { key: "principal", label: "원금", value: props.result.totalPrincipal, tone: "primary" as const },
  { key: "interest", label: "세후 이자", value: props.result.netInterest, tone: "success" as const },
]);
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">적금 만기 시뮬레이션</h2>
    </div>

    <div class="retro-panel-content space-y-4">
      <div class="rounded-2xl border border-primary/20 bg-primary/8 p-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-caption font-semibold text-muted-foreground">예상 만기 수령액</p>
            <p class="result-amount mt-1 font-bold text-primary tabular-nums"><CountUpAmount :value="formatWon(result.maturityAmount)" /></p>
          </div>
          <Badge variant="outline" class="border-primary/25 bg-primary/5 text-primary">
            세후 이자 {{ formatWon(result.netInterest) }}
          </Badge>
        </div>
      </div>

      <ResultMetricTable :rows="metricRows" />

      <ShBreakdownBar label="만기 수령액 구성" :segments="segments" :format-value="formatWon" surface="outlined" />

      <div class="rounded-lg bg-muted/40 px-3 py-2 text-tiny text-muted-foreground space-y-1">
        <p>* 단리 기준 계산이며, 실제 적금 상품에 따라 이자 계산 방식이 다를 수 있습니다.</p>
        <p>* 일반과세 15.4%, 2026 조합 예탁금 일반 가정 5.9%, 비과세 0% 기준입니다.</p>
        <p>* 중도해지 시 약정금리보다 낮은 금리가 적용될 수 있습니다.</p>
      </div>
    </div>
  </div>
</template>
