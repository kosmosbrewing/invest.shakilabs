<script setup lang="ts">
import { PiggyBank } from "lucide-vue-next";
import { ShPresetGroup, ShSlider } from "@shakilabs/ui";
import { Button } from "@/components/ui/button";
import type { TaxType } from "@/data/interestData";
import { TAX_TYPE_OPTIONS, SAVINGS_PERIOD_PRESETS, RATE_PRESETS } from "@/data/interestData";

defineProps<{
  monthlyDeposit: number;
  months: number;
  annualRate: number;
  taxType: TaxType;
}>();

const emit = defineEmits<{
  "update:monthlyDeposit": [value: number];
  "update:months": [value: number];
  "update:annualRate": [value: number];
  "update:taxType": [value: TaxType];
}>();

function parseInput(value: string): number {
  const num = Number(value.replace(/[^0-9.-]/g, ""));
  return isNaN(num) ? 0 : Math.max(0, num);
}

const depositPresets = [
  { label: "10만", value: 100_000 },
  { label: "30만", value: 300_000 },
  { label: "50만", value: 500_000 },
  { label: "100만", value: 1_000_000 },
] as const;
const periodPresets = SAVINGS_PERIOD_PRESETS.map((value) => ({
  label: `${value}개월`,
  value,
}));
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title flex items-center gap-2">
        <PiggyBank class="h-4 w-4 text-primary" />
        적금 조건 입력
      </h2>
    </div>

    <div class="retro-panel-content space-y-4">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">월 적립액</label>
          <div class="relative">
            <input
              aria-label="월 적립액"
              type="text"
              inputmode="numeric"
              class="retro-input pr-8"
              :value="monthlyDeposit.toLocaleString('ko-KR')"
              @input="emit('update:monthlyDeposit', parseInput(($event.target as HTMLInputElement).value))"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">원</span>
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            <Button
              v-for="preset in depositPresets"
              :key="preset.label"
              type="button"
              variant="outline"
              size="chipSm"
              @click="emit('update:monthlyDeposit', preset.value)"
            >
              {{ preset.label }}
            </Button>
          </div>
        </div>

        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">연이율 (%)</label>
          <div class="flex items-center gap-3">
            <ShSlider
              :model-value="annualRate"
              :min="0.5"
              :max="10"
              :step="0.1"
              :value-text="`적금 연이율 ${annualRate.toFixed(1)}%`"
              class="flex-1"
              aria-label="적금 연이율 슬라이더"
              @update:model-value="emit('update:annualRate', $event)"
            />
            <span class="shrink-0 whitespace-nowrap text-right text-body font-semibold tabular-nums">
              {{ annualRate.toFixed(1) }}%
            </span>
          </div>
          <ShPresetGroup
            :model-value="annualRate"
            :options="RATE_PRESETS"
            label="적금 연이율 빠른 선택"
            class="mt-3"
            @update:model-value="emit('update:annualRate', $event)"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">적금 기간</label>
          <div class="flex items-center gap-3">
            <ShSlider
              :model-value="months"
              :min="1"
              :max="60"
              :step="1"
              :value-text="`적금 기간 ${months}개월`"
              class="flex-1"
              aria-label="적금 기간 슬라이더"
              @update:model-value="emit('update:months', $event)"
            />
            <span class="shrink-0 whitespace-nowrap text-right text-body font-semibold tabular-nums">{{ months }}개월</span>
          </div>
          <ShPresetGroup
            :model-value="months"
            :options="periodPresets"
            label="적금 기간 빠른 선택"
            class="mt-3"
            @update:model-value="emit('update:months', $event)"
          />
        </div>

        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">이자과세</label>
          <div class="grid grid-cols-1 gap-2">
            <label
              v-for="opt in TAX_TYPE_OPTIONS"
              :key="opt.key"
              :class="[
                'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-caption transition-colors',
                taxType === opt.key
                  ? 'border-primary bg-primary/8 font-semibold text-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/50',
              ]"
            >
              <input
                type="radio"
                name="savingsTaxType"
                class="retro-radio"
                :value="opt.key"
                :checked="taxType === opt.key"
                @change="emit('update:taxType', opt.key)"
              />
              {{ opt.label }}
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
