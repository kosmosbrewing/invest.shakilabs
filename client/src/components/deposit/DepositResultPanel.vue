<script setup lang="ts">
import { computed } from "vue";
import ResultMetricTable from "@/components/result/ResultMetricTable.vue";
import BreakdownStackedBar from "@/components/result-visualization/BreakdownStackedBar.vue";
import { Badge } from "@/components/ui/badge";
import type { DepositInterestResult } from "@/utils/interestCalculator";
import { formatWon, formatPercent } from "@/lib/utils";

const props = defineProps<{
  result: DepositInterestResult;
  paymentType: "maturity" | "monthly";
}>();

type MetricRow = {
  label: string;
  value: string;
  description: string;
  tone?: "default" | "primary" | "success" | "danger";
  badge?: string;
};

const metricRows = computed(() => {
  const rows: MetricRow[] = [
    {
      label: "예금 원금",
      value: formatWon(props.result.principal),
      description: "예치한 원금",
    },
    {
      label: "세전 이자",
      value: formatWon(props.result.grossInterest),
      description: "과세 전 이자 총액",
      tone: "success",
    },
    {
      label: "이자소득세",
      value: formatWon(props.result.tax),
      description: props.result.tax > 0 ? "이자에 부과되는 세금" : "비과세 적용",
      tone: props.result.tax > 0 ? "danger" : "default",
    },
    {
      label: "세후 이자",
      value: formatWon(props.result.netInterest),
      description: `실효 수익률 ${formatPercent(props.result.effectiveRate)}`,
      tone: "primary",
    },
  ];

  if (props.paymentType === "monthly") {
    rows.push({
      label: "월 이자 수령액",
      value: formatWon(props.result.monthlyInterestNet),
      description: `세전 ${formatWon(props.result.monthlyInterestGross)}`,
      badge: "매월 지급",
      tone: "success",
    });
  }

  return rows;
});
const segments = computed(() => [
  { key: "principal", label: "원금", value: props.result.principal, tone: "primary" as const },
  { key: "interest", label: "세후 이자", value: props.result.netInterest, tone: "gain" as const },
]);
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">예금 만기 시뮬레이션</h2>
    </div>

    <div class="retro-panel-content space-y-4">
      <div class="rounded-2xl border border-primary/20 bg-primary/8 p-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-caption font-semibold text-muted-foreground">
              {{ paymentType === "monthly" ? "만기 원금 + 누적 이자" : "예상 만기 수령액" }}
            </p>
            <p class="mt-1 text-display font-brand text-primary">{{ formatWon(result.maturityAmount) }}</p>
          </div>
          <Badge variant="outline" class="border-primary/25 bg-primary/5 text-primary">
            {{ paymentType === "monthly" ? "월이자 지급" : "만기일시" }}
          </Badge>
        </div>
      </div>

      <ResultMetricTable :rows="metricRows" />

      <BreakdownStackedBar label="수령액 구성" :segments="segments" :format-value="formatWon" />

      <div class="rounded-lg bg-muted/40 px-3 py-2 text-tiny text-muted-foreground space-y-1">
        <p>* 정기예금 기준이며, 실제 이율은 은행·상품에 따라 다릅니다.</p>
        <p>* 일반과세 15.4%, 2026 조합 예탁금 일반 가정 5.9%, 비과세 0% 기준입니다.</p>
        <p>* 월이자 방식은 매월 이자를 수령하므로 만기 시 원금만 돌려받습니다.</p>
      </div>
    </div>
  </div>
</template>
