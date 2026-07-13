<script setup lang="ts">
import { ShPresetGroup } from "@shakilabs/ui";
import { TrendingUp } from "lucide-vue-next";
import { SELL_AMOUNT_PRESETS } from "@/data/foreignStockTax";
import { formatWon } from "@/lib/utils";

defineProps<{
  sellAmount: number;
  buyAmount: number;
  fees: number;
  otherGains: number;
  otherLosses: number;
}>();

const emit = defineEmits<{
  "update:sellAmount": [value: number];
  "update:buyAmount": [value: number];
  "update:fees": [value: number];
  "update:otherGains": [value: number];
  "update:otherLosses": [value: number];
}>();

function parseInput(value: string): number {
  const parsed = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
}
const sellAmountPresetOptions = SELL_AMOUNT_PRESETS.map((value) => ({ label: formatWon(value), value }));
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title flex items-center gap-2">
        <TrendingUp class="h-4 w-4 text-primary" />
        양도 정보
      </h2>
    </div>

    <div class="retro-panel-content space-y-4">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">매도금액 (원화)</label>
          <input
            aria-label="매도금액 원화"
            type="text"
            inputmode="numeric"
            class="retro-input"
            :value="sellAmount.toLocaleString('ko-KR')"
            @input="emit('update:sellAmount', parseInput(($event.target as HTMLInputElement).value))"
          />
          <ShPresetGroup
            :model-value="sellAmount"
            :options="sellAmountPresetOptions"
            label="매도금액 빠른 선택"
            class="mt-3"
            @update:model-value="emit('update:sellAmount', $event)"
          />
        </div>

        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">매수금액 (원화)</label>
          <input
            aria-label="매수금액 원화"
            type="text"
            inputmode="numeric"
            class="retro-input"
            :value="buyAmount.toLocaleString('ko-KR')"
            @input="emit('update:buyAmount', parseInput(($event.target as HTMLInputElement).value))"
          />
          <p class="mt-2 text-tiny text-muted-foreground">환전 시 적용된 환율 기준 원화 금액을 입력하세요.</p>
        </div>

        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">필요경비 (수수료 등)</label>
          <input
            aria-label="필요경비"
            type="text"
            inputmode="numeric"
            class="retro-input"
            :value="fees.toLocaleString('ko-KR')"
            @input="emit('update:fees', parseInput(($event.target as HTMLInputElement).value))"
          />
          <p class="mt-2 text-tiny text-muted-foreground">매매 수수료, 환전 수수료 등 비용입니다.</p>
        </div>
      </div>

      <details class="retro-details">
        <summary class="retro-details-summary">
          <span>상세 설정: 다른 종목 손익 합산</span>
          <span class="retro-details-chevron">+</span>
        </summary>
        <div class="grid grid-cols-1 gap-3 px-3 py-3 sm:grid-cols-2 sm:px-4">
          <div class="retro-panel-muted p-3.5">
            <label class="mb-2 block text-caption font-semibold text-foreground">다른 종목 양도차익</label>
            <input
              aria-label="다른 종목 양도차익"
              type="text"
              inputmode="numeric"
              class="retro-input"
              :value="otherGains.toLocaleString('ko-KR')"
              @input="emit('update:otherGains', parseInput(($event.target as HTMLInputElement).value))"
            />
          </div>
          <div class="retro-panel-muted p-3.5">
            <label class="mb-2 block text-caption font-semibold text-foreground">다른 종목 양도차손</label>
            <input
              aria-label="다른 종목 양도차손"
              type="text"
              inputmode="numeric"
              class="retro-input"
              :value="otherLosses.toLocaleString('ko-KR')"
              @input="emit('update:otherLosses', parseInput(($event.target as HTMLInputElement).value))"
            />
          </div>
        </div>
      </details>
    </div>
  </div>
</template>
