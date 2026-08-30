<script setup lang="ts">
import CountUpAmount from "@/components/common/CountUpAmount.vue";
import { computed } from "vue";
import { ShBreakdownBar } from "@shakilabs/ui";
import ResultMetricTable from "@/components/result/ResultMetricTable.vue";
import { Badge } from "@/components/ui/badge";
import { formatPercent, formatWon } from "@/lib/utils";

const props = defineProps<{
  result: {
    deductionLimit: number;
    availableDeduction: number;
    taxableAmount: number;
    basicTax: number;
    surcharge: number;
    totalTax: number;
    afterTaxGift: number;
    effectiveRate: number;
    appliedRate: number;
  };
}>();

const metricRows = computed(() => [
  {
    label: "사용 가능 공제",
    value: formatWon(props.result.availableDeduction),
    description: `관계별 공제 한도 ${formatWon(props.result.deductionLimit)}`,
  },
  {
    label: "과세표준",
    value: formatWon(props.result.taxableAmount),
    description: "공제 후 세율이 적용되는 금액",
  },
  {
    label: "산출세액",
    value: formatWon(props.result.basicTax),
    description: `적용 세율 ${formatPercent(props.result.appliedRate, 0)}`,
    tone: "danger",
  },
  {
    label: "가산세",
    value: formatWon(props.result.surcharge),
    description: props.result.surcharge > 0 ? "세대생략 가산세 30%" : "가산세 없음",
    tone: props.result.surcharge > 0 ? "warning" : "default",
  },
  {
    label: "세후 이전 금액",
    value: formatWon(props.result.afterTaxGift),
    description: `실효세율 ${formatPercent(props.result.effectiveRate)}`,
    tone: "primary",
  },
] as const);
const segments = computed(() => [
  { key: "after", label: "세후 이전 금액", value: props.result.afterTaxGift, tone: "success" as const },
  { key: "tax", label: "예상 증여세", value: props.result.totalTax, tone: "danger" as const },
]);
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">계산 결과</h2>
    </div>

    <div class="retro-panel-content space-y-4">
      <div class="rounded-2xl border border-primary/20 bg-primary/8 p-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-caption font-semibold text-muted-foreground">예상 증여세</p>
            <p class="result-amount mt-1 font-bold text-primary tabular-nums"><CountUpAmount :value="formatWon(result.totalTax)" /></p>
          </div>
          <Badge variant="outline" class="border-primary/25 bg-primary/5 text-primary">
            세후 {{ formatWon(result.afterTaxGift) }}
          </Badge>
        </div>
      </div>

      <ResultMetricTable :rows="metricRows" />

      <ShBreakdownBar label="증여 금액의 최종 구성" :segments="segments" :format-value="formatWon" surface="outlined" />

      <p class="rounded-lg bg-muted/40 px-3 py-2 text-tiny text-muted-foreground">
        실효세율은 입력한 총 증여금액 대비 세금 비율입니다. 신고세액공제, 평가방법, 채무인수 조건은 반영하지 않았습니다.
      </p>
    </div>
  </div>
</template>
