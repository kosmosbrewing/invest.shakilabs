<script setup lang="ts">
import { computed } from "vue";
import { CRYPTO_TAX_EFFECTIVE_DATE, CRYPTO_TAX_STATUS_NOTE } from "@/data/investTaxRates";
import ResultMetricTable from "@/components/result/ResultMetricTable.vue";
import BreakdownStackedBar from "@/components/result-visualization/BreakdownStackedBar.vue";
import { Badge } from "@/components/ui/badge";
import type { CryptoTaxResult } from "@/utils/investCalculator";
import { formatWon, formatPercent } from "@/lib/utils";

const props = defineProps<{
  result: CryptoTaxResult;
}>();

const isProfit = computed(() => props.result.totalGain > 0);
const isLoss = computed(() => props.result.totalGain < 0);
const metricRows = computed(() => [
  {
    label: "양도차익",
    value: formatWon(props.result.totalGain),
    description: "매도가액에서 취득가액과 비용을 차감한 금액",
    tone: isProfit.value ? "success" : isLoss.value ? "danger" : "default",
  },
  {
    label: "기본공제",
    value: formatWon(props.result.deduction),
    description: "연간 가상자산 양도차익에서 250만원 공제",
  },
  {
    label: "과세표준",
    value: formatWon(props.result.taxableAmount),
    description: "공제 후 실제 세율이 적용되는 금액",
  },
  {
    label: "소득세",
    value: formatWon(props.result.incomeTax),
    description: "예정 세율 20%",
    tone: "danger",
  },
  {
    label: "지방소득세",
    value: formatWon(props.result.localTax),
    description: "소득세의 10%",
    tone: "danger",
  },
  {
    label: "세후 순수익",
    value: formatWon(props.result.netProfit),
    description: "세금 차감 후 남는 예상 수익",
    badge: props.result.totalTax > 0 ? `실효세율 ${formatPercent(props.result.effectiveRate)}` : undefined,
    tone: "primary",
  },
] as const);
const segments = computed(() => [
  { key: "net", label: "순수익", value: Math.max(0, props.result.netProfit), tone: "gain" as const },
  { key: "tax", label: "세금", value: props.result.totalTax, tone: "tax" as const },
]);
</script>

<template>
  <div class="crypto-result-panel retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">시뮬레이션 결과</h2>
      <span
        v-if="result.totalTax > 0"
        class="text-caption font-semibold text-status-danger"
      >
        실효세율 {{ formatPercent(result.effectiveRate) }}
      </span>
    </div>

    <div class="retro-panel-content space-y-4">
      <div class="crypto-result-hero rounded-2xl border border-primary/20 bg-primary/8 p-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-caption font-semibold text-muted-foreground">예상 세후 순수익</p>
            <p class="result-amount mt-1 font-brand text-primary tabular-nums">{{ formatWon(result.netProfit) }}</p>
          </div>
          <Badge variant="outline" class="border-primary/25 bg-primary/5 text-primary">
            {{ result.totalTax > 0 ? `예상 세금 ${formatWon(result.totalTax)}` : "과세표준 0원" }}
          </Badge>
        </div>
      </div>

      <div class="crypto-metric-list">
        <ResultMetricTable :rows="metricRows" />
      </div>

      <BreakdownStackedBar v-if="result.totalGain > 0" label="수익 구성" :segments="segments" :format-value="formatWon" />

      <div class="rounded-lg bg-muted/40 px-3 py-2 text-tiny text-muted-foreground space-y-1">
        <p>* {{ CRYPTO_TAX_STATUS_NOTE }}</p>
        <p>* 기본공제 250만원은 연간 가상자산 양도차익 합계에서 공제됩니다.</p>
        <p>* 세율 22% = 소득세 20% + 지방소득세 2% (소득세법 제87조의2)</p>
        <p>* 법 개정이 없으면 {{ CRYPTO_TAX_EFFECTIVE_DATE }} 이후 양도분부터 적용 예정입니다.</p>
      </div>
    </div>
  </div>
</template>
