<script setup lang="ts">
import { computed } from "vue";
import { CRYPTO_TAX_EFFECTIVE_DATE, CRYPTO_TAX_STATUS_NOTE } from "@/data/investTaxRates";
import type { CryptoTaxResult } from "@/utils/investCalculator";
import { formatWon, formatPercent } from "@/lib/utils";

const props = defineProps<{
  result: CryptoTaxResult;
}>();

const isProfit = computed(() => props.result.totalGain > 0);
const isLoss = computed(() => props.result.totalGain < 0);
</script>

<template>
  <div class="retro-panel overflow-hidden">
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
      <!-- 핵심 요약 -->
      <div class="retro-stat-grid">
        <div class="retro-stat">
          <p class="retro-stat-label">양도차익</p>
          <p
            :class="[
              'retro-stat-value',
              isProfit ? 'text-status-success' : isLoss ? 'text-status-danger' : '',
            ]"
          >
            {{ formatWon(result.totalGain) }}
          </p>
        </div>
        <div class="retro-stat">
          <p class="retro-stat-label">기본공제</p>
          <p class="retro-stat-value">{{ formatWon(result.deduction) }}</p>
        </div>
        <div class="retro-stat">
          <p class="retro-stat-label">과세표준</p>
          <p class="retro-stat-value">{{ formatWon(result.taxableAmount) }}</p>
        </div>
      </div>

      <!-- 세금 내역 -->
      <div class="retro-board-list">
        <div class="retro-board-item">
          <span class="text-muted-foreground">소득세 (20%)</span>
          <span class="font-semibold tabular-nums">{{ formatWon(result.incomeTax) }}</span>
        </div>
        <div class="retro-board-item">
          <span class="text-muted-foreground">지방소득세 (2%)</span>
          <span class="font-semibold tabular-nums">{{ formatWon(result.localTax) }}</span>
        </div>
        <div class="retro-board-item bg-accent/30">
          <span class="font-semibold">예상 세금 합계</span>
          <span class="font-bold tabular-nums text-status-danger">{{ formatWon(result.totalTax) }}</span>
        </div>
      </div>

      <!-- 실수령 -->
      <div class="rounded-xl bg-primary/8 border border-primary/20 p-4 text-center">
        <p class="text-caption text-muted-foreground">예상 세후 순수익</p>
        <p class="text-display font-brand text-primary">
          {{ formatWon(result.netProfit) }}
        </p>
      </div>

      <!-- 차트 -->
      <div v-if="result.totalGain > 0" class="retro-chart">
        <div class="flex items-center justify-between text-caption text-muted-foreground">
          <span>수익 구성</span>
        </div>
        <div class="retro-chart-bar">
          <div
            class="retro-chart-segment bg-chart-net"
            :style="{ width: `${(result.netProfit / result.totalGain) * 100}%` }"
          />
          <div
            class="retro-chart-segment bg-chart-tax"
            :style="{ width: `${(result.totalTax / result.totalGain) * 100}%` }"
          />
        </div>
        <div class="retro-chart-legend">
          <div class="retro-chart-legend-item">
            <span class="flex items-center gap-1.5">
              <span class="retro-chart-dot bg-chart-net" />
              <span>순수익</span>
            </span>
            <span class="font-semibold tabular-nums">{{ formatWon(result.netProfit) }}</span>
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

      <!-- 안내 문구 -->
      <div class="rounded-lg bg-muted/40 px-3 py-2 text-tiny text-muted-foreground space-y-1">
        <p>* {{ CRYPTO_TAX_STATUS_NOTE }}</p>
        <p>* 기본공제 250만원은 연간 가상자산 양도차익 합계에서 공제됩니다.</p>
        <p>* 세율 22% = 소득세 20% + 지방소득세 2% (소득세법 제87조의2)</p>
        <p>* 법 개정이 없으면 {{ CRYPTO_TAX_EFFECTIVE_DATE }} 이후 양도분부터 적용 예정입니다.</p>
      </div>
    </div>
  </div>
</template>
