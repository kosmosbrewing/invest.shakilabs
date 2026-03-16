<script setup lang="ts">
import { Banknote } from "lucide-vue-next";
import { DIVIDEND_TAX } from "@/data/investTaxRates";

defineProps<{
  dividendAmount: number;
  country: string;
  otherFinancialIncome: number;
}>();

const emit = defineEmits<{
  "update:dividendAmount": [value: number];
  "update:country": [value: string];
  "update:otherFinancialIncome": [value: number];
}>();

const countries = [
  { value: "KR", label: "국내 (한국)" },
  ...Object.entries(DIVIDEND_TAX.FOREIGN_RATES).map(([key, info]) => ({
    value: key,
    label: `${info.label} (${(info.localRate * 100).toFixed(1)}%)`,
  })),
];

function parseInput(value: string): number {
  const num = Number(value.replace(/[^0-9.-]/g, ""));
  return isNaN(num) ? 0 : Math.max(0, num);
}
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title flex items-center gap-2">
        <Banknote class="h-4 w-4 text-primary" />
        배당소득세 계산
      </h2>
    </div>

    <div class="retro-panel-content space-y-4">
      <div>
        <label class="block text-caption font-semibold text-foreground mb-1.5">
          배당금 (세전)
        </label>
        <div class="relative">
          <input
            type="text"
            inputmode="numeric"
            class="retro-input pr-8"
            :value="dividendAmount.toLocaleString('ko-KR')"
            @input="emit('update:dividendAmount', parseInput(($event.target as HTMLInputElement).value))"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">원</span>
        </div>
      </div>

      <div>
        <label class="block text-caption font-semibold text-foreground mb-1.5">
          배당 국가
        </label>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <label
            v-for="c in countries"
            :key="c.value"
            :class="[
              'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-caption cursor-pointer transition-colors',
              country === c.value
                ? 'border-primary bg-primary/8 text-foreground font-semibold'
                : 'border-border hover:border-primary/50 text-muted-foreground',
            ]"
          >
            <input
              type="radio"
              name="country"
              class="retro-radio"
              :value="c.value"
              :checked="country === c.value"
              @change="emit('update:country', c.value)"
            />
            {{ c.label }}
          </label>
        </div>
      </div>

      <div>
        <label class="block text-caption font-semibold text-foreground mb-1.5">
          기타 금융소득 (이자+배당, 연간)
        </label>
        <div class="relative">
          <input
            type="text"
            inputmode="numeric"
            class="retro-input pr-8"
            :value="otherFinancialIncome.toLocaleString('ko-KR')"
            @input="emit('update:otherFinancialIncome', parseInput(($event.target as HTMLInputElement).value))"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">원</span>
        </div>
        <p class="mt-1 text-tiny text-muted-foreground">
          연간 금융소득 합계가 2,000만원 초과 시 종합과세 대상
        </p>
      </div>
    </div>
  </div>
</template>
