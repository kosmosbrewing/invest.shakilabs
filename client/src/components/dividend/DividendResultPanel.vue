<script setup lang="ts">
import type { DividendTaxResult } from "@/utils/investCalculator";
import { formatWon, formatPercent } from "@/lib/utils";
import { DIVIDEND_TAX } from "@/data/investTaxRates";

defineProps<{
  result: DividendTaxResult;
}>();

function getCountryLabel(country: string): string {
  if (country === "KR") return "국내";
  const info = DIVIDEND_TAX.FOREIGN_RATES[country as keyof typeof DIVIDEND_TAX.FOREIGN_RATES];
  return info?.label ?? country;
}
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
      <!-- 원천징수 세금 -->
      <div class="retro-board-list">
        <div v-if="result.foreignTaxAmount > 0" class="retro-board-item">
          <span class="text-muted-foreground">해외 원천징수 ({{ formatPercent(result.foreignTaxRate) }})</span>
          <span class="font-semibold tabular-nums">{{ formatWon(result.foreignTaxAmount) }}</span>
        </div>
        <div v-if="result.domesticIncomeTax > 0" class="retro-board-item">
          <span class="text-muted-foreground">
            {{ result.country === 'KR' ? '소득세 (14%)' : '추가 소득세' }}
          </span>
          <span class="font-semibold tabular-nums">{{ formatWon(result.domesticIncomeTax) }}</span>
        </div>
        <div v-if="result.domesticLocalTax > 0" class="retro-board-item">
          <span class="text-muted-foreground">지방소득세</span>
          <span class="font-semibold tabular-nums">{{ formatWon(result.domesticLocalTax) }}</span>
        </div>
        <div class="retro-board-item bg-accent/30">
          <span class="font-semibold">원천징수 세금 합계</span>
          <span class="font-bold tabular-nums text-status-danger">{{ formatWon(result.totalTax) }}</span>
        </div>
      </div>

      <!-- 실수령 배당 -->
      <div class="retro-stat-grid">
        <div class="retro-stat">
          <p class="retro-stat-label">세전 배당금</p>
          <p class="retro-stat-value">{{ formatWon(result.dividendAmount) }}</p>
        </div>
        <div class="retro-stat">
          <p class="retro-stat-label">실효세율</p>
          <p class="retro-stat-value text-status-danger">{{ formatPercent(result.effectiveRate) }}</p>
        </div>
        <div class="retro-stat">
          <p class="retro-stat-label">실수령</p>
          <p class="retro-stat-value text-primary">{{ formatWon(result.netDividend) }}</p>
        </div>
      </div>

      <!-- 종합과세 경고 -->
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

      <!-- 차트 -->
      <div v-if="result.dividendAmount > 0" class="retro-chart">
        <div class="flex items-center justify-between text-caption text-muted-foreground">
          <span>배당 구성</span>
        </div>
        <div class="retro-chart-bar">
          <div
            class="retro-chart-segment bg-chart-net"
            :style="{ width: `${(result.netDividend / result.dividendAmount) * 100}%` }"
          />
          <div
            class="retro-chart-segment bg-chart-tax"
            :style="{ width: `${(result.totalTax / result.dividendAmount) * 100}%` }"
          />
        </div>
        <div class="retro-chart-legend">
          <div class="retro-chart-legend-item">
            <span class="flex items-center gap-1.5">
              <span class="retro-chart-dot bg-chart-net" />
              <span>실수령</span>
            </span>
            <span class="font-semibold tabular-nums">{{ formatWon(result.netDividend) }}</span>
          </div>
          <div class="retro-chart-legend-item">
            <span class="flex items-center gap-1.5">
              <span class="retro-chart-dot bg-chart-tax" />
              <span>세금</span>
            </span>
            <span class="font-semibold tabular-nums">{{ formatWon(result.totalTax) }}</span>
          </div>
        </div>
      </div>

      <!-- 안내 -->
      <div class="rounded-lg bg-muted/40 px-3 py-2 text-tiny text-muted-foreground space-y-1">
        <p>* 국내 배당: 소득세 14% + 지방소득세 1.4% = 15.4% 원천징수</p>
        <p>* 해외 배당: 현지 원천징수 후 국내 세율과 비교하여 차액 추가 납부</p>
        <p>* 연간 금융소득(이자+배당) 합계 2,000만원 초과 시 종합과세</p>
      </div>
    </div>
  </div>
</template>
