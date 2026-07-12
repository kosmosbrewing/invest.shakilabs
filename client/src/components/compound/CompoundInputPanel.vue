<script setup lang="ts">
import { TrendingUp } from "lucide-vue-next";
import { ShPresetGroup, ShSlider } from "@shakilabs/ui";
import { Button } from "@/components/ui/button";
import { COMPOUND_YEAR_PRESETS, COMPOUND_RATE_PRESETS } from "@/data/interestData";

defineProps<{
  initialAmount: number;
  monthlyContribution: number;
  annualRate: number;
  years: number;
}>();

const emit = defineEmits<{
  "update:initialAmount": [value: number];
  "update:monthlyContribution": [value: number];
  "update:annualRate": [value: number];
  "update:years": [value: number];
}>();

function parseInput(value: string): number {
  const num = Number(value.replace(/[^0-9.-]/g, ""));
  return isNaN(num) ? 0 : Math.max(0, num);
}

const initialPresets = [
  { label: "1,000만", value: 10_000_000 },
  { label: "3,000만", value: 30_000_000 },
  { label: "5,000만", value: 50_000_000 },
  { label: "1억", value: 100_000_000 },
] as const;

const monthlyPresets = [
  { label: "0", value: 0 },
  { label: "30만", value: 300_000 },
  { label: "50만", value: 500_000 },
  { label: "100만", value: 1_000_000 },
] as const;
const compoundYearPresets = COMPOUND_YEAR_PRESETS.map((value) => ({
  label: `${value}년`,
  value,
}));
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title flex items-center gap-2">
        <TrendingUp class="h-4 w-4 text-primary" />
        복리 조건 입력
      </h2>
    </div>

    <div class="retro-panel-content space-y-4">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">초기 투자금</label>
          <div class="relative">
            <input
              aria-label="초기 투자금"
              type="text"
              inputmode="numeric"
              class="retro-input pr-8"
              :value="initialAmount.toLocaleString('ko-KR')"
              @input="emit('update:initialAmount', parseInput(($event.target as HTMLInputElement).value))"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">원</span>
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            <Button
              v-for="preset in initialPresets"
              :key="preset.label"
              type="button"
              variant="outline"
              size="chipSm"
              @click="emit('update:initialAmount', preset.value)"
            >
              {{ preset.label }}
            </Button>
          </div>
        </div>

        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">월 추가 적립금</label>
          <div class="relative">
            <input
              aria-label="월 추가 적립금"
              type="text"
              inputmode="numeric"
              class="retro-input pr-8"
              :value="monthlyContribution.toLocaleString('ko-KR')"
              @input="emit('update:monthlyContribution', parseInput(($event.target as HTMLInputElement).value))"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">원</span>
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            <Button
              v-for="preset in monthlyPresets"
              :key="preset.label"
              type="button"
              variant="outline"
              size="chipSm"
              @click="emit('update:monthlyContribution', preset.value)"
            >
              {{ preset.label }}
            </Button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">연 수익률 (%)</label>
          <div class="flex items-center gap-3">
            <ShSlider
              :model-value="annualRate"
              :min="1"
              :max="20"
              :step="0.5"
              :value-text="`연 수익률 ${annualRate.toFixed(1)}%`"
              class="flex-1"
              aria-label="연 수익률 슬라이더"
              @update:model-value="emit('update:annualRate', $event)"
            />
            <span class="shrink-0 whitespace-nowrap text-right text-body font-semibold tabular-nums">
              {{ annualRate.toFixed(1) }}%
            </span>
          </div>
          <ShPresetGroup
            :model-value="annualRate"
            :options="COMPOUND_RATE_PRESETS"
            label="연 수익률 빠른 선택"
            class="mt-3"
            @update:model-value="emit('update:annualRate', $event)"
          />
        </div>

        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">투자 기간</label>
          <div class="flex items-center gap-3">
            <ShSlider
              :model-value="years"
              :min="1"
              :max="40"
              :step="1"
              :value-text="`투자 기간 ${years}년`"
              class="flex-1"
              aria-label="투자 기간 슬라이더"
              @update:model-value="emit('update:years', $event)"
            />
            <span class="shrink-0 whitespace-nowrap text-right text-body font-semibold tabular-nums">{{ years }}년</span>
          </div>
          <ShPresetGroup
            :model-value="years"
            :options="compoundYearPresets"
            label="투자 기간 빠른 선택"
            class="mt-3"
            @update:model-value="emit('update:years', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
