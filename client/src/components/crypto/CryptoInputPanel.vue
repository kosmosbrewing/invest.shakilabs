<script setup lang="ts">
import { TrendingUp } from "lucide-vue-next";

defineProps<{
  purchaseAmount: number;
  saleAmount: number;
  expenses: number;
}>();

const emit = defineEmits<{
  "update:purchaseAmount": [value: number];
  "update:saleAmount": [value: number];
  "update:expenses": [value: number];
}>();

function parseInput(value: string): number {
  const num = Number(value.replace(/[^0-9.-]/g, ""));
  return isNaN(num) ? 0 : Math.max(0, num);
}
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title flex items-center gap-2">
        <TrendingUp class="h-4 w-4 text-primary" />
        가상자산 세액 시뮬레이션
      </h2>
    </div>

    <div class="retro-panel-content space-y-4">
      <div>
        <label class="block text-caption font-semibold text-foreground mb-1.5">
          취득가액 (매수 금액)
        </label>
        <div class="relative">
          <input
            type="text"
            inputmode="numeric"
            class="retro-input pr-8"
            :value="purchaseAmount.toLocaleString('ko-KR')"
            @input="emit('update:purchaseAmount', parseInput(($event.target as HTMLInputElement).value))"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">원</span>
        </div>
        <p class="mt-1 text-tiny text-muted-foreground">코인을 매수한 총 금액</p>
      </div>

      <div>
        <label class="block text-caption font-semibold text-foreground mb-1.5">
          양도가액 (매도 금액)
        </label>
        <div class="relative">
          <input
            type="text"
            inputmode="numeric"
            class="retro-input pr-8"
            :value="saleAmount.toLocaleString('ko-KR')"
            @input="emit('update:saleAmount', parseInput(($event.target as HTMLInputElement).value))"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">원</span>
        </div>
        <p class="mt-1 text-tiny text-muted-foreground">코인을 매도한 총 금액</p>
      </div>

      <div>
        <label class="block text-caption font-semibold text-foreground mb-1.5">
          부대비용 (수수료 등)
        </label>
        <div class="relative">
          <input
            type="text"
            inputmode="numeric"
            class="retro-input pr-8"
            :value="expenses.toLocaleString('ko-KR')"
            @input="emit('update:expenses', parseInput(($event.target as HTMLInputElement).value))"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">원</span>
        </div>
        <p class="mt-1 text-tiny text-muted-foreground">거래 수수료, 출금 수수료 등</p>
      </div>
    </div>
  </div>
</template>
