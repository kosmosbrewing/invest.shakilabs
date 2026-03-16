<script setup lang="ts">
import type { IsaCompareResult } from "@/utils/investCalculator";
import { formatWon, formatPercent } from "@/lib/utils";

defineProps<{
  result: IsaCompareResult;
}>();
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">ISA vs 일반계좌 비교</h2>
    </div>

    <div class="retro-panel-content space-y-4">
      <!-- 투자 요약 -->
      <div class="retro-stat-grid">
        <div class="retro-stat">
          <p class="retro-stat-label">총 투자금</p>
          <p class="retro-stat-value">{{ formatWon(result.totalInvestment) }}</p>
        </div>
        <div class="retro-stat">
          <p class="retro-stat-label">총 수익</p>
          <p class="retro-stat-value text-status-success">{{ formatWon(result.totalProfit) }}</p>
        </div>
        <div class="retro-stat">
          <p class="retro-stat-label">절세 효과</p>
          <p class="retro-stat-value text-primary">{{ formatWon(result.taxSaving) }}</p>
        </div>
      </div>

      <!-- ISA 계좌 -->
      <div class="rounded-xl border-2 border-primary/40 bg-primary/5 p-4 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-body font-bold text-primary">
            ISA 계좌
            <span class="text-caption font-normal text-muted-foreground ml-1">
              ({{ result.isaType === 'general' ? '일반형' : '서민형' }})
            </span>
          </h3>
          <span class="rounded-full bg-primary/15 px-2 py-0.5 text-tiny font-semibold text-primary">추천</span>
        </div>
        <div class="retro-board-list">
          <div class="retro-board-item">
            <span class="text-muted-foreground">비과세 한도</span>
            <span class="font-semibold tabular-nums">{{ formatWon(result.isaTaxFreeLimit) }}</span>
          </div>
          <div class="retro-board-item">
            <span class="text-muted-foreground">과세 대상 수익</span>
            <span class="font-semibold tabular-nums">{{ formatWon(result.isaTaxableProfit) }}</span>
          </div>
          <div class="retro-board-item">
            <span class="text-muted-foreground">세금 (9.9%)</span>
            <span class="font-semibold tabular-nums text-status-danger">{{ formatWon(result.isaTax) }}</span>
          </div>
          <div class="retro-board-item bg-primary/8">
            <span class="font-semibold">세후 수령액</span>
            <span class="font-bold tabular-nums text-primary text-heading">{{ formatWon(result.isaNetTotal) }}</span>
          </div>
        </div>
      </div>

      <!-- 일반 계좌 -->
      <div class="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
        <h3 class="text-body font-bold text-foreground">일반 계좌</h3>
        <div class="retro-board-list">
          <div class="retro-board-item">
            <span class="text-muted-foreground">세금 (15.4%)</span>
            <span class="font-semibold tabular-nums text-status-danger">{{ formatWon(result.normalTax) }}</span>
          </div>
          <div class="retro-board-item bg-muted/30">
            <span class="font-semibold">세후 수령액</span>
            <span class="font-bold tabular-nums text-heading">{{ formatWon(result.normalNetTotal) }}</span>
          </div>
        </div>
      </div>

      <!-- 절세 요약 -->
      <div
        v-if="result.taxSaving > 0"
        class="rounded-xl bg-status-success/8 border border-status-success/20 p-4 text-center space-y-1"
      >
        <p class="text-caption text-muted-foreground">ISA 절세 효과</p>
        <p class="text-display font-brand text-status-success">
          {{ formatWon(result.taxSaving) }}
        </p>
        <p class="text-tiny text-muted-foreground">
          세금 {{ formatPercent(result.savingRate) }} 절감
        </p>
      </div>

      <!-- 차트 -->
      <div class="retro-chart">
        <div class="text-caption text-muted-foreground">세후 수령액 비교</div>
        <div class="space-y-2">
          <div>
            <div class="flex items-center justify-between text-caption mb-1">
              <span class="font-semibold text-primary">ISA</span>
              <span class="font-semibold tabular-nums">{{ formatWon(result.isaNetTotal) }}</span>
            </div>
            <div class="h-4 w-full rounded-lg bg-muted overflow-hidden">
              <div
                class="h-full rounded-lg bg-primary transition-all duration-300"
                :style="{ width: `${Math.min(100, (result.isaNetTotal / Math.max(result.isaNetTotal, result.normalNetTotal)) * 100)}%` }"
              />
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between text-caption mb-1">
              <span class="font-semibold text-muted-foreground">일반</span>
              <span class="font-semibold tabular-nums">{{ formatWon(result.normalNetTotal) }}</span>
            </div>
            <div class="h-4 w-full rounded-lg bg-muted overflow-hidden">
              <div
                class="h-full rounded-lg bg-muted-foreground/40 transition-all duration-300"
                :style="{ width: `${Math.min(100, (result.normalNetTotal / Math.max(result.isaNetTotal, result.normalNetTotal)) * 100)}%` }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 안내 -->
      <div class="rounded-lg bg-muted/40 px-3 py-2 text-tiny text-muted-foreground space-y-1">
        <p>* ISA 일반형: 비과세 200만원, 초과분 9.9% 분리과세</p>
        <p>* ISA 서민형/농어민형: 비과세 400만원, 초과분 9.9% 분리과세</p>
        <p>* 일반 계좌: 배당·이자 수익에 15.4% 원천징수</p>
        <p>* 의무 가입기간 3년, 연 납입한도 2,000만원</p>
      </div>
    </div>
  </div>
</template>
