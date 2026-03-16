<script setup lang="ts">
import { PiggyBank } from "lucide-vue-next";

defineProps<{
  annualInvestment: number;
  annualReturnRate: number;
  holdingYears: number;
  isaType: "general" | "low_income";
}>();

const emit = defineEmits<{
  "update:annualInvestment": [value: number];
  "update:annualReturnRate": [value: number];
  "update:holdingYears": [value: number];
  "update:isaType": [value: "general" | "low_income"];
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
        <PiggyBank class="h-4 w-4 text-primary" />
        ISA 만기 세후 비교
      </h2>
    </div>

    <div class="retro-panel-content space-y-4">
      <div>
        <label class="block text-caption font-semibold text-foreground mb-1.5">
          ISA 유형
        </label>
        <div class="grid grid-cols-2 gap-2">
          <label
            :class="[
              'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-caption cursor-pointer transition-colors',
              isaType === 'general'
                ? 'border-primary bg-primary/8 text-foreground font-semibold'
                : 'border-border hover:border-primary/50 text-muted-foreground',
            ]"
          >
            <input
              type="radio"
              name="isaType"
              class="retro-radio"
              value="general"
              :checked="isaType === 'general'"
              @change="emit('update:isaType', 'general')"
            />
            일반형 (비과세 200만)
          </label>
          <label
            :class="[
              'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-caption cursor-pointer transition-colors',
              isaType === 'low_income'
                ? 'border-primary bg-primary/8 text-foreground font-semibold'
                : 'border-border hover:border-primary/50 text-muted-foreground',
            ]"
          >
            <input
              type="radio"
              name="isaType"
              class="retro-radio"
              value="low_income"
              :checked="isaType === 'low_income'"
              @change="emit('update:isaType', 'low_income')"
            />
            서민형 (비과세 400만)
          </label>
        </div>
      </div>

      <div>
        <label class="block text-caption font-semibold text-foreground mb-1.5">
          연간 투자금액
        </label>
        <div class="relative">
          <input
            type="text"
            inputmode="numeric"
            class="retro-input pr-8"
            :value="annualInvestment.toLocaleString('ko-KR')"
            @input="emit('update:annualInvestment', parseInput(($event.target as HTMLInputElement).value))"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">원</span>
        </div>
        <p class="mt-1 text-tiny text-muted-foreground">연간 한도 2,000만원, 총 한도 1억원</p>
      </div>

      <div>
        <label class="block text-caption font-semibold text-foreground mb-1.5">
          예상 연 수익률
        </label>
        <div class="flex items-center gap-3">
          <input
            type="range"
            min="0.01"
            max="0.20"
            step="0.005"
            class="flex-1 accent-primary h-2"
            :value="annualReturnRate"
            @input="emit('update:annualReturnRate', Number(($event.target as HTMLInputElement).value))"
          />
          <span class="w-14 text-right text-body font-semibold tabular-nums">
            {{ (annualReturnRate * 100).toFixed(1) }}%
          </span>
        </div>
      </div>

      <div>
        <label class="block text-caption font-semibold text-foreground mb-1.5">
          투자 기간
        </label>
        <div class="flex items-center gap-3">
          <input
            type="range"
            min="3"
            max="10"
            step="1"
            class="flex-1 accent-primary h-2"
            :value="holdingYears"
            @input="emit('update:holdingYears', Number(($event.target as HTMLInputElement).value))"
          />
          <span class="w-14 text-right text-body font-semibold tabular-nums">
            {{ holdingYears }}년
          </span>
        </div>
        <p class="mt-1 text-tiny text-muted-foreground">의무 가입기간: 최소 3년</p>
      </div>
    </div>
  </div>
</template>
