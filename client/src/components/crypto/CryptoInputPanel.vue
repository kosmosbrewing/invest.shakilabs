<script setup lang="ts">
import { TrendingUp } from "lucide-vue-next";
import { useId } from "vue";
import { ShPresetGroup } from "@shakilabs/ui";

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

const purchasePresets = [
  { label: "500만", value: 5_000_000 },
  { label: "1,000만", value: 10_000_000 },
  { label: "3,000만", value: 30_000_000 },
] as const;

const salePresets = [
  { label: "1,000만", value: 10_000_000 },
  { label: "1,500만", value: 15_000_000 },
  { label: "5,000만", value: 50_000_000 },
] as const;

const expensePresets = [
  { label: "0원", value: 0 },
  { label: "5만", value: 50_000 },
  { label: "20만", value: 200_000 },
] as const;

const purchaseAmountId = useId();
const saleAmountId = useId();
const expensesId = useId();
</script>

<template>
  <section class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title flex items-center gap-2">
        <TrendingUp class="h-4 w-4 text-primary" />
        가상자산 세액 시뮬레이션
      </h2>
    </div>

    <div class="retro-panel-content space-y-4">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div class="crypto-input-card retro-panel-muted p-3.5">
          <label :for="purchaseAmountId" class="mb-2 block text-caption font-semibold text-foreground">
            취득가액
          </label>
          <div class="relative">
            <input
              :id="purchaseAmountId"
              type="text"
              inputmode="numeric"
              class="retro-input pr-8"
              :value="purchaseAmount.toLocaleString('ko-KR')"
              @input="emit('update:purchaseAmount', parseInput(($event.target as HTMLInputElement).value))"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">원</span>
          </div>
          <p class="mt-2 text-tiny text-muted-foreground">코인을 매수한 총 금액입니다.</p>
          <ShPresetGroup
            :model-value="purchaseAmount"
            :options="purchasePresets"
            label="취득가액 빠른 선택"
            class="mt-3"
            @update:model-value="emit('update:purchaseAmount', $event)"
          />
        </div>

        <div class="crypto-input-card retro-panel-muted p-3.5">
          <label :for="saleAmountId" class="mb-2 block text-caption font-semibold text-foreground">
            양도가액
          </label>
          <div class="relative">
            <input
              :id="saleAmountId"
              type="text"
              inputmode="numeric"
              class="retro-input pr-8"
              :value="saleAmount.toLocaleString('ko-KR')"
              @input="emit('update:saleAmount', parseInput(($event.target as HTMLInputElement).value))"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">원</span>
          </div>
          <p class="mt-2 text-tiny text-muted-foreground">실제 매도 예정 금액을 넣어보세요.</p>
          <ShPresetGroup
            :model-value="saleAmount"
            :options="salePresets"
            label="양도가액 빠른 선택"
            class="mt-3"
            @update:model-value="emit('update:saleAmount', $event)"
          />
        </div>

        <div class="crypto-input-card retro-panel-muted p-3.5">
          <label :for="expensesId" class="mb-2 block text-caption font-semibold text-foreground">
            필요경비
          </label>
          <div class="relative">
            <input
              :id="expensesId"
              type="text"
              inputmode="numeric"
              class="retro-input pr-8"
              :value="expenses.toLocaleString('ko-KR')"
              @input="emit('update:expenses', parseInput(($event.target as HTMLInputElement).value))"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">원</span>
          </div>
          <p class="mt-2 text-tiny text-muted-foreground">수수료와 출금 비용을 합산합니다.</p>
          <ShPresetGroup
            :model-value="expenses"
            :options="expensePresets"
            label="필요경비 빠른 선택"
            class="mt-3"
            @update:model-value="emit('update:expenses', $event)"
          />
        </div>
      </div>
    </div>
  </section>
</template>
