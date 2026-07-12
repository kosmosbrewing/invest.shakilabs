<script setup lang="ts">
import { computed } from "vue";
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
            <p class="result-amount mt-1 font-brand text-primary tabular-nums">{{ formatWon(result.maturityAmount) }}</p>
          </div>
          <Badge variant="outline" class="border-primary/25 bg-primary/5 text-primary">
            세후 이자 {{ formatWon(result.netInterest) }}
          </Badge>
        </div>
      </div>

      <ResultMetricTable :rows="metricRows" />

      <!-- 원금 vs 이자 비율 바 -->
      <div v-if="result.grossInterest > 0" class="retro-chart">
        <div class="text-caption text-muted-foreground">만기 수령액 구성</div>
        <div class="retro-chart-bar">
          <div
            class="retro-chart-segment bg-primary"
            :style="{ width: `${(result.totalPrincipal / result.maturityAmount) * 100}%` }"
          />
          <div
            class="retro-chart-segment bg-status-success"
            :style="{ width: `${(result.netInterest / result.maturityAmount) * 100}%` }"
          />
        </div>
        <div class="retro-chart-legend">
          <div class="flex items-center gap-1.5 text-tiny">
            <span class="retro-chart-dot bg-primary" />
            <span class="text-muted-foreground">원금 {{ formatWon(result.totalPrincipal) }}</span>
          </div>
          <div class="flex items-center gap-1.5 text-tiny">
            <span class="retro-chart-dot bg-status-success" />
            <span class="text-muted-foreground">세후 이자 {{ formatWon(result.netInterest) }}</span>
          </div>
        </div>
      </div>

      <div class="rounded-lg bg-muted/40 px-3 py-2 text-tiny text-muted-foreground space-y-1">
        <p>* 단리 기준 계산이며, 실제 적금 상품에 따라 이자 계산 방식이 다를 수 있습니다.</p>
        <p>* 일반과세 15.4%, 2026 조합 예탁금 일반 가정 5.9%, 비과세 0% 기준입니다.</p>
        <p>* 중도해지 시 약정금리보다 낮은 금리가 적용될 수 있습니다.</p>
      </div>
    </div>
  </div>
</template>
