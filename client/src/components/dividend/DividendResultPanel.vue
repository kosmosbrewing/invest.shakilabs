<script setup lang="ts">
import { computed } from "vue";
import ResultMetricTable from "@/components/result/ResultMetricTable.vue";
import BreakdownStackedBar from "@/components/result-visualization/BreakdownStackedBar.vue";
import { Badge } from "@/components/ui/badge";
import type { DividendTaxResult } from "@/utils/investCalculator";
import { formatWon, formatPercent } from "@/lib/utils";
import { DIVIDEND_TAX } from "@/data/investTaxRates";

type MetricRow = {
  label: string;
  value: string;
  description?: string;
  badge?: string;
  tone?: "default" | "primary" | "success" | "danger" | "warning";
};

const props = defineProps<{
  result: DividendTaxResult;
}>();

function getCountryLabel(country: string): string {
  if (country === "KR") return "국내";
  const info = DIVIDEND_TAX.FOREIGN_RATES[country as keyof typeof DIVIDEND_TAX.FOREIGN_RATES];
  return info?.label ?? country;
}

const metricRows = computed(() => {
  const rows: MetricRow[] = [
    {
      label: "세전 배당금",
      value: formatWon(props.result.dividendAmount),
      description: `${getCountryLabel(props.result.country)} 기준 입력 금액`,
    },
    {
      label: "해외 원천징수",
      value: formatWon(props.result.foreignTaxAmount),
      description: props.result.country === "KR" ? "국내 배당은 해당 없음" : `현지 세율 ${formatPercent(props.result.foreignTaxRate)}`,
      tone: "danger",
    },
    {
      label: "국내 추가세액",
      value: formatWon(props.result.domesticIncomeTax + props.result.domesticLocalTax),
      description: props.result.country === "KR" ? "국내 배당 원천징수 15.4%" : "외국 원천징수와 국내 세율 차액 반영",
      tone: "danger",
    },
    {
      label: "실수령액",
      value: formatWon(props.result.netDividend),
      description: `실효세율 ${formatPercent(props.result.effectiveRate)}`,
      tone: "primary",
    },
  ];

  if (props.result.isComprehensive && props.result.comprehensiveTax != null && props.result.comprehensiveNetDividend != null) {
    rows.push({
      label: "종합과세 시나리오",
      value: formatWon(props.result.comprehensiveNetDividend),
      description: `예상 총세액 ${formatWon(props.result.comprehensiveTax)}`,
      badge: "2,000만원 초과",
      tone: "warning",
    });
  }

  return rows;
});
const segments = computed(() => [
  { key: "net", label: "실수령", value: props.result.netDividend, tone: "gain" as const },
  { key: "tax", label: "세금", value: props.result.totalTax, tone: "tax" as const },
]);
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">계산 결과</h2>
      <span class="text-caption font-semibold text-muted-foreground">
        {{ getCountryLabel(result.country) }} 배당
      </span>
    </div>

    <div class="retro-panel-content space-y-4">
      <div class="rounded-2xl border border-primary/20 bg-primary/8 p-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-caption font-semibold text-muted-foreground">예상 실수령 배당금</p>
            <p class="result-amount mt-1 font-brand text-primary tabular-nums">{{ formatWon(result.netDividend) }}</p>
          </div>
          <Badge variant="outline" class="border-primary/25 bg-primary/5 text-primary">
            총세금 {{ formatWon(result.totalTax) }}
          </Badge>
        </div>
      </div>

      <ResultMetricTable :rows="metricRows" />

      <div
        v-if="result.isComprehensive"
        class="rounded-xl border border-status-warning/30 bg-status-warning/8 p-3.5 space-y-2"
      >
        <p class="text-caption font-semibold text-status-warning flex items-center gap-1.5">
          종합과세 대상
        </p>
        <p class="text-tiny text-muted-foreground">
          연간 금융소득이 2,000만원을 초과하여 종합과세가 적용됩니다.
        </p>
        <div v-if="result.comprehensiveTax != null" class="retro-board-list mt-2">
          <div class="retro-board-item">
            <span class="text-muted-foreground">종합과세 세금</span>
            <span class="font-semibold tabular-nums">{{ formatWon(result.comprehensiveTax) }}</span>
          </div>
          <div class="retro-board-item">
            <span class="text-muted-foreground">종합과세 실수령</span>
            <span class="font-bold tabular-nums text-primary">{{ formatWon(result.comprehensiveNetDividend) }}</span>
          </div>
        </div>
      </div>

      <BreakdownStackedBar v-if="result.dividendAmount > 0" label="배당 구성" :segments="segments" :format-value="formatWon" />

      <div class="rounded-lg bg-muted/40 px-3 py-2 text-tiny text-muted-foreground space-y-1">
        <p>* 국내 배당: 소득세 14% + 지방소득세 1.4% = 15.4% 원천징수</p>
        <p>* 해외 배당: 현지 원천징수 후 국내 세율과 비교하여 차액 추가 납부</p>
        <p>* 연간 금융소득(이자+배당) 합계 2,000만원 초과 시 종합과세</p>
      </div>
    </div>
  </div>
</template>
