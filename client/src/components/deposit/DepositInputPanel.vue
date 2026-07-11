<script setup lang="ts">
import { Landmark } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import type { TaxType, PaymentType } from "@/data/interestData";
import { TAX_TYPE_OPTIONS, PAYMENT_TYPE_OPTIONS, DEPOSIT_PERIOD_PRESETS, RATE_PRESETS } from "@/data/interestData";

defineProps<{
  principal: number;
  months: number;
  annualRate: number;
  taxType: TaxType;
  paymentType: PaymentType;
}>();

const emit = defineEmits<{
  "update:principal": [value: number];
  "update:months": [value: number];
  "update:annualRate": [value: number];
  "update:taxType": [value: TaxType];
  "update:paymentType": [value: PaymentType];
}>();

function parseInput(value: string): number {
  const num = Number(value.replace(/[^0-9.-]/g, ""));
  return isNaN(num) ? 0 : Math.max(0, num);
}

const principalPresets = [
  { label: "1,000만", value: 10_000_000 },
  { label: "3,000만", value: 30_000_000 },
  { label: "5,000만", value: 50_000_000 },
  { label: "1억", value: 100_000_000 },
] as const;
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title flex items-center gap-2">
        <Landmark class="h-4 w-4 text-primary" />
        예금 조건 입력
      </h2>
    </div>

    <div class="retro-panel-content space-y-4">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">예금 원금</label>
          <div class="relative">
            <input
              aria-label="예금 원금"
              type="text"
              inputmode="numeric"
              class="retro-input pr-8"
              :value="principal.toLocaleString('ko-KR')"
              @input="emit('update:principal', parseInput(($event.target as HTMLInputElement).value))"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">원</span>
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            <Button
              v-for="preset in principalPresets"
              :key="preset.label"
              type="button"
              variant="outline"
              size="chipSm"
              @click="emit('update:principal', preset.value)"
            >
              {{ preset.label }}
            </Button>
          </div>
        </div>

        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">연이율 (%)</label>
          <div class="flex items-center gap-3">
            <input
              aria-label="예금 연이율 범위"
              type="range"
              min="0.5"
              max="10"
              step="0.1"
              class="h-2 flex-1 accent-primary"
              :value="annualRate"
              @input="emit('update:annualRate', Number(($event.target as HTMLInputElement).value))"
            />
            <span class="w-14 text-right text-body font-semibold tabular-nums">
              {{ annualRate.toFixed(1) }}%
            </span>
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            <Button
              v-for="preset in RATE_PRESETS"
              :key="preset.label"
              type="button"
              variant="outline"
              size="chipSm"
              @click="emit('update:annualRate', preset.value)"
            >
              {{ preset.label }}
            </Button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">예금 기간</label>
          <div class="flex items-center gap-3">
            <input
              aria-label="예금 기간 범위"
              type="range"
              min="1"
              max="60"
              step="1"
              class="h-2 flex-1 accent-primary"
              :value="months"
              @input="emit('update:months', Number(($event.target as HTMLInputElement).value))"
            />
            <span class="w-14 text-right text-body font-semibold tabular-nums">{{ months }}개월</span>
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            <Button
              v-for="period in DEPOSIT_PERIOD_PRESETS"
              :key="period"
              type="button"
              variant="outline"
              size="chipSm"
              @click="emit('update:months', period)"
            >
              {{ period }}개월
            </Button>
          </div>
        </div>

        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">이자지급방식</label>
          <div class="grid grid-cols-1 gap-2">
            <label
              v-for="opt in PAYMENT_TYPE_OPTIONS"
              :key="opt.key"
              :class="[
                'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-caption transition-colors',
                paymentType === opt.key
                  ? 'border-primary bg-primary/8 font-semibold text-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/50',
              ]"
            >
              <input
                type="radio"
                name="depositPaymentType"
                class="retro-radio"
                :value="opt.key"
                :checked="paymentType === opt.key"
                @change="emit('update:paymentType', opt.key as PaymentType)"
              />
              {{ opt.label }}
            </label>
          </div>
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
                name="depositTaxType"
                class="retro-radio"
                :value="opt.key"
                :checked="taxType === opt.key"
                @change="emit('update:taxType', opt.key as TaxType)"
              />
              {{ opt.label }}
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
