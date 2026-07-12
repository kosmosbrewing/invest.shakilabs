<script setup lang="ts">
import { PiggyBank } from "lucide-vue-next";
import { ShPresetGroup, ShSlider } from "@shakilabs/ui";
import { Button } from "@/components/ui/button";

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

const investmentPresets = [
  { label: "600만", value: 6_000_000 },
  { label: "1,200만", value: 12_000_000 },
  { label: "2,000만", value: 20_000_000 },
] as const;

const returnRatePresets = [
  { label: "3%", value: 0.03 },
  { label: "5%", value: 0.05 },
  { label: "8%", value: 0.08 },
] as const;

const holdingYearPresets = [3, 5, 10].map((value) => ({
  label: `${value}년`,
  value,
}));
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
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">ISA 유형</label>
          <div class="grid grid-cols-1 gap-2">
            <label
              :class="[
                'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-caption transition-colors',
                isaType === 'general'
                  ? 'border-primary bg-primary/8 font-semibold text-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/50',
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
                'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-caption transition-colors',
                isaType === 'low_income'
                  ? 'border-primary bg-primary/8 font-semibold text-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/50',
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

        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">연간 투자금액</label>
          <div class="relative">
            <input
              aria-label="연간 투자금액"
              type="text"
              inputmode="numeric"
              class="retro-input pr-8"
              :value="annualInvestment.toLocaleString('ko-KR')"
              @input="emit('update:annualInvestment', parseInput(($event.target as HTMLInputElement).value))"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">원</span>
          </div>
          <p class="mt-2 text-tiny text-muted-foreground">연간 한도 2,000만원 기준 비교입니다.</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <Button
              v-for="preset in investmentPresets"
              :key="preset.label"
              type="button"
              variant="outline"
              size="chipSm"
              @click="emit('update:annualInvestment', preset.value)"
            >
              {{ preset.label }}
            </Button>
          </div>
        </div>

        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">예상 연 수익률</label>
          <div class="flex items-center gap-3">
            <ShSlider
              :model-value="annualReturnRate"
              :min="0.01"
              :max="0.2"
              :step="0.005"
              :value-text="`예상 연 수익률 ${(annualReturnRate * 100).toFixed(1)}%`"
              class="flex-1"
              aria-label="예상 연 수익률 슬라이더"
              @update:model-value="emit('update:annualReturnRate', $event)"
            />
            <span class="shrink-0 whitespace-nowrap text-right text-body font-semibold tabular-nums">
              {{ (annualReturnRate * 100).toFixed(1) }}%
            </span>
          </div>
          <ShPresetGroup
            :model-value="annualReturnRate"
            :options="returnRatePresets"
            label="예상 연 수익률 빠른 선택"
            class="mt-3"
            @update:model-value="emit('update:annualReturnRate', $event)"
          />
        </div>
      </div>

      <details class="retro-details">
        <summary class="retro-details-summary">
          <span>상세 설정: 투자 기간</span>
          <span class="retro-details-chevron">+</span>
        </summary>
        <div class="space-y-3 px-3 py-3 sm:px-4">
          <div class="flex items-center gap-3">
            <ShSlider
              :model-value="holdingYears"
              :min="3"
              :max="10"
              :step="1"
              :value-text="`ISA 보유 기간 ${holdingYears}년`"
              class="flex-1"
              aria-label="ISA 보유 기간 슬라이더"
              @update:model-value="emit('update:holdingYears', $event)"
            />
            <span class="shrink-0 whitespace-nowrap text-right text-body font-semibold tabular-nums">{{ holdingYears }}년</span>
          </div>
          <ShPresetGroup
            :model-value="holdingYears"
            :options="holdingYearPresets"
            label="ISA 보유 기간 빠른 선택"
            @update:model-value="emit('update:holdingYears', $event)"
          />
          <p class="text-tiny text-muted-foreground">의무 가입기간은 최소 3년이며, 길수록 복리 효과가 커집니다.</p>
        </div>
      </details>
    </div>
  </div>
</template>
