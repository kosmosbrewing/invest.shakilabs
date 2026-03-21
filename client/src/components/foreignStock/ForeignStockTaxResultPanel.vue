<script setup lang="ts">
import { computed } from "vue";
import ResultMetricTable from "@/components/common/ResultMetricTable.vue";
import { Badge } from "@/components/ui/badge";
import { formatPercent, formatWon } from "@/lib/utils";

const props = defineProps<{
  result: {
    sellAmount: number;
    buyAmount: number;
    fees: number;
    gain: number;
    netGain: number;
    totalGain: number;
    basicDeduction: number;
    taxableAmount: number;
    combinedTaxRate: number;
    incomeTax: number;
    localTax: number;
    totalTax: number;
    netProfit: number;
    effectiveRate: number;
  };
}>();

const metricRows = computed(() => [
  {
    label: "양도차익",
    value: formatWon(props.result.gain),
    description: `매도 ${formatWon(props.result.sellAmount)} - 매수 ${formatWon(props.result.buyAmount)} - 경비`,
  },
  {
    label: "손익 합산",
    value: formatWon(props.result.netGain),
    description: "다른 종목 손익을 합산한 순양도차익",
  },
  {
    label: "기본공제",
    value: formatWon(props.result.basicDeduction),
    description: "연 250만원 기본공제",
  },
  {
    label: "과세표준",
    value: formatWon(props.result.taxableAmount),
    description: `세율 ${formatPercent(props.result.combinedTaxRate, 0)} (소득세 20% + 지방세 2%)`,
    tone: "danger",
  },
  {
    label: "소득세",
    value: formatWon(props.result.incomeTax),
    description: "양도소득세 (20%)",
    tone: "danger",
  },
  {
    label: "지방소득세",
    value: formatWon(props.result.localTax),
    description: "소득세의 10%",
  },
  {
    label: "세후 수익",
    value: formatWon(props.result.netProfit),
    description: `실효세율 ${formatPercent(props.result.effectiveRate)}`,
    tone: "primary",
  },
] as const);
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">계산 결과</h2>
    </div>

    <div class="retro-panel-content space-y-4">
      <div class="rounded-2xl border border-primary/20 bg-primary/8 p-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-caption font-semibold text-muted-foreground">예상 양도소득세</p>
            <p class="mt-1 text-display font-brand text-primary">{{ formatWon(result.totalTax) }}</p>
          </div>
          <Badge variant="outline" class="border-primary/25 bg-primary/5 text-primary">
            세후 {{ formatWon(result.netProfit) }}
          </Badge>
        </div>
      </div>

      <ResultMetricTable :rows="metricRows" />

      <p class="rounded-lg bg-muted/40 px-3 py-2 text-tiny text-muted-foreground">
        환율 변동에 따른 환차익은 별도로 과세되지 않으며 양도차익에 포함됩니다. 외국납부세액공제는 반영하지 않았습니다.
      </p>
    </div>
  </div>
</template>
