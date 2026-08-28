<script setup lang="ts">
import { computed } from "vue";
import {
  ShBadge,
  ShTable,
  ShTableBody,
  ShTableCell,
  ShTableHead,
  ShTableHeader,
  ShTableRow,
} from "@shakilabs/ui";
import ResultMetricTable from "@/components/result/ResultMetricTable.vue";
import CompoundGrowthChart from "@/components/compound/CompoundGrowthChart.vue";
import type { CompoundInterestResult } from "@/utils/interestCalculator";
import { formatWon } from "@/lib/utils";

const props = defineProps<{
  result: CompoundInterestResult;
}>();

const metricRows = computed(() => [
  {
    label: "총 투자 원금",
    value: formatWon(props.result.totalInvested),
    description: "초기 투자금 + 월 적립금 합계",
  },
  {
    label: "복리 최종 금액",
    value: formatWon(props.result.compoundTotal),
    description: `수익 ${formatWon(props.result.compoundInterest)}`,
    tone: "primary" as const,
  },
  {
    label: "단리 최종 금액",
    value: formatWon(props.result.simpleTotal),
    description: `수익 ${formatWon(props.result.simpleInterest)}`,
  },
  {
    label: "복리 효과 (차이)",
    value: formatWon(props.result.compoundAdvantage),
    description: "복리가 단리보다 더 벌어주는 금액",
    tone: props.result.compoundAdvantage > 0 ? ("success" as const) : ("default" as const),
  },
  {
    label: "72법칙",
    value: props.result.rule72Years > 0 ? `약 ${props.result.rule72Years}년` : "-",
    description: "원금이 2배가 되는 예상 기간",
    badge: "Rule of 72",
  },
]);

// 연도별 테이블 (5년 단위로 표시)
const displayYears = computed(() => {
  const data = props.result.yearlyData;
  if (data.length <= 10) return data;
  // 10년 초과 시: 첫해 + 5년 간격 + 마지막
  const filtered = data.filter((d, i) => i === 0 || d.year % 5 === 0 || i === data.length - 1);
  return filtered;
});
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">단리 vs 복리 비교</h2>
    </div>

    <div class="retro-panel-content space-y-4">
      <div class="rounded-2xl border border-primary/20 bg-primary/8 p-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-caption font-semibold text-muted-foreground">복리 최종 금액</p>
            <p class="result-amount mt-1 font-bold text-primary tabular-nums">{{ formatWon(result.compoundTotal) }}</p>
          </div>
          <ShBadge v-if="result.compoundAdvantage > 0" tone="success">
            복리 효과 +{{ formatWon(result.compoundAdvantage) }}
          </ShBadge>
        </div>
      </div>

      <ResultMetricTable :rows="metricRows" />

      <CompoundGrowthChart :rows="result.yearlyData" />

      <!-- 연도별 성장 테이블 -->
      <details v-if="displayYears.length > 1" class="retro-details">
        <summary class="retro-details-summary">
          <span>연도별 성장 내역</span>
          <span class="retro-details-chevron">+</span>
        </summary>
        <div class="px-3 py-3 sm:px-4">
          <ShTable aria-label="연도별 단리와 복리 성장 비교" density="compact" min-width="30rem" scroll-hint="표를 좌우로 스크롤해 연도별 금액을 확인하세요.">
            <ShTableHeader>
              <ShTableRow>
                <ShTableHead>연차</ShTableHead>
                <ShTableHead numeric>투자 원금</ShTableHead>
                <ShTableHead numeric>단리</ShTableHead>
                <ShTableHead numeric>복리</ShTableHead>
              </ShTableRow>
            </ShTableHeader>
            <ShTableBody>
              <ShTableRow v-for="row in displayYears" :key="row.year">
                <ShTableCell>{{ row.year }}년</ShTableCell>
                <ShTableCell numeric>{{ formatWon(row.invested) }}</ShTableCell>
                <ShTableCell numeric>{{ formatWon(row.simpleTotal) }}</ShTableCell>
                <ShTableCell numeric emphasis class="text-primary">{{ formatWon(row.compoundTotal) }}</ShTableCell>
              </ShTableRow>
            </ShTableBody>
          </ShTable>
        </div>
      </details>

      <div class="rounded-lg bg-muted/40 px-3 py-2 text-tiny text-muted-foreground space-y-1">
        <p>* 72법칙: 72 / 연수익률(%) = 원금 2배 도달 예상 기간</p>
        <p>* 복리는 월복리(연이율/12) 기준, 세금·수수료는 미반영됩니다.</p>
        <p>* 실제 투자 수익률은 시장 상황에 따라 변동됩니다.</p>
      </div>
    </div>
  </div>
</template>
