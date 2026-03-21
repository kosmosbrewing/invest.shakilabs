<script setup lang="ts">
import { computed } from "vue";
import ResultMetricTable from "@/components/common/ResultMetricTable.vue";
import { Badge } from "@/components/ui/badge";
import { formatPercent, formatWon } from "@/lib/utils";

const props = defineProps<{
  result: {
    totalEstate: number;
    debt: number;
    funeralExpense: number;
    taxableValue: number;
    spouseDeduction: number;
    generalDeduction: number;
    usedLumpSum: boolean;
    financialDeduction: number;
    totalDeduction: number;
    taxBase: number;
    appliedRate: number;
    calculatedTax: number;
    filingDeduction: number;
    totalTax: number;
    effectiveRate: number;
    afterTaxEstate: number;
  };
}>();

const metricRows = computed(() => [
  {
    label: "과세가액",
    value: formatWon(props.result.taxableValue),
    description: `상속재산 ${formatWon(props.result.totalEstate)} - 채무 - 장례비`,
  },
  {
    label: "배우자 공제",
    value: formatWon(props.result.spouseDeduction),
    description: props.result.spouseDeduction > 0 ? "법정상속분 기준 (5억~30억)" : "배우자 없음",
  },
  {
    label: "일괄·기초 공제",
    value: formatWon(props.result.generalDeduction),
    description: props.result.usedLumpSum ? "일괄공제 5억 적용" : "기초 2억 + 인적공제 합산",
  },
  {
    label: "금융재산 공제",
    value: formatWon(props.result.financialDeduction),
    description: "순금융재산의 20% (최대 2억)",
  },
  {
    label: "과세표준",
    value: formatWon(props.result.taxBase),
    description: `적용 세율 ${formatPercent(props.result.appliedRate, 0)}`,
    tone: "danger",
  },
  {
    label: "산출세액",
    value: formatWon(props.result.calculatedTax),
    description: `신고세액공제 ${formatWon(props.result.filingDeduction)} (3%)`,
    tone: "danger",
  },
  {
    label: "세후 상속재산",
    value: formatWon(props.result.afterTaxEstate),
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
            <p class="text-caption font-semibold text-muted-foreground">예상 상속세</p>
            <p class="mt-1 text-display font-brand text-primary">{{ formatWon(result.totalTax) }}</p>
          </div>
          <Badge variant="outline" class="border-primary/25 bg-primary/5 text-primary">
            세후 {{ formatWon(result.afterTaxEstate) }}
          </Badge>
        </div>
      </div>

      <ResultMetricTable :rows="metricRows" />

      <p class="rounded-lg bg-muted/40 px-3 py-2 text-tiny text-muted-foreground">
        기한 내 신고세액공제(3%)를 반영했습니다. 세대생략 가산세, 영농·영업 상속공제, 동거주택 상속공제 등 특수 공제는 반영하지 않았습니다.
      </p>
    </div>
  </div>
</template>
