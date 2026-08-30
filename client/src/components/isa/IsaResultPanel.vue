<script setup lang="ts">
import CountUpAmount from "@/components/common/CountUpAmount.vue";
import { computed } from "vue";
import ResultMetricTable from "@/components/result/ResultMetricTable.vue";
import RankedBars from "@/components/result-visualization/RankedBars.vue";
import { Badge } from "@/components/ui/badge";
import type { IsaCompareResult } from "@/utils/investCalculator";
import { formatPercent, formatWon } from "@/lib/utils";

const props = defineProps<{
  result: IsaCompareResult;
}>();

const metricRows = computed(() => [
  {
    label: "총 투자금",
    value: formatWon(props.result.totalInvestment),
    description: `${props.result.holdingYears}년 동안 누적 투자한 원금`,
  },
  {
    label: "총 수익",
    value: formatWon(props.result.totalProfit),
    description: `연 수익률 ${formatPercent(props.result.annualReturn)}`,
    tone: "success",
  },
  {
    label: "ISA 세후 수령액",
    value: formatWon(props.result.isaNetTotal),
    description: `비과세 한도 ${formatWon(props.result.isaTaxFreeLimit)}`,
    badge: props.result.isaType === "general" ? "일반형" : "서민형",
    tone: "primary",
  },
  {
    label: "일반 계좌 세후 수령액",
    value: formatWon(props.result.normalNetTotal),
    description: `일반 계좌 세금 ${formatWon(props.result.normalTax)}`,
  },
  {
    label: "절세 효과",
    value: formatWon(props.result.taxSaving),
    description: `일반 계좌 대비 ${formatPercent(props.result.savingRate)} 절감`,
    tone: "success",
  },
] as const);
const comparisonItems = computed(() => [
  { key: "isa", label: "ISA", value: props.result.isaNetTotal, highlight: true },
  { key: "normal", label: "일반 계좌", value: props.result.normalNetTotal },
]);
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">ISA vs 일반계좌 비교</h2>
    </div>

    <div class="retro-panel-content space-y-4">
      <div class="rounded-2xl border border-primary/20 bg-primary/8 p-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-caption font-semibold text-muted-foreground">ISA 예상 절세 효과</p>
            <p class="result-amount mt-1 font-bold text-primary tabular-nums"><CountUpAmount :value="formatWon(result.taxSaving)" /></p>
          </div>
          <Badge variant="outline" class="border-primary/25 bg-primary/5 text-primary">
            {{ result.isaType === "general" ? "일반형" : "서민형" }}
          </Badge>
        </div>
      </div>

      <ResultMetricTable :rows="metricRows" />

      <RankedBars
        label="세후 수령액 비교"
        note="동일한 투자금과 수익률 기준이며 막대 길이는 세후 수령액에 직접 비례합니다."
        :items="comparisonItems"
        :format-value="formatWon"
      />

      <div class="rounded-lg bg-muted/40 px-3 py-2 text-tiny text-muted-foreground space-y-1">
        <p>* ISA 일반형: 비과세 200만원, 초과분 9.9% 분리과세</p>
        <p>* ISA 서민형/농어민형: 비과세 400만원, 초과분 9.9% 분리과세</p>
        <p>* 일반 계좌: 배당·이자 수익에 15.4% 원천징수</p>
        <p>* 의무 가입기간 3년, 연 납입한도 2,000만원</p>
      </div>
    </div>
  </div>
</template>
