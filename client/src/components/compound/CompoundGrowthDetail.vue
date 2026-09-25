<script setup lang="ts">
import { computed } from "vue";
import {
  ShTable,
  ShTableBody,
  ShTableCell,
  ShTableHead,
  ShTableHeader,
  ShTableRow,
} from "@shakilabs/ui";
import CompoundGrowthChart from "@/components/compound/CompoundGrowthChart.vue";
import type { CompoundInterestResult } from "@/utils/interestCalculator";
import { formatWon } from "@/lib/utils";

// CompoundResultPanel에서 그대로 옮겨온 상세(차트+연도별 표) — 결과 칸을
// 요약만 남기려고 1×2 아래 전폭 패널로 분리했다(뷰의 이동 사유 주석 참고).
const props = defineProps<{
  result: CompoundInterestResult;
}>();

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
  <section class="retro-panel overflow-hidden">
    <div class="retro-panel-content space-y-4">
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
    </div>
  </section>
</template>
