<script setup lang="ts">
import { Banknote } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { DIVIDEND_TAX } from "@/data/investTaxRates";

type CountryKey = "KR" | keyof typeof DIVIDEND_TAX.FOREIGN_RATES;

defineProps<{
  dividendAmount: number;
  country: CountryKey;
  otherFinancialIncome: number;
}>();

const emit = defineEmits<{
  "update:dividendAmount": [value: number];
  "update:country": [value: CountryKey];
  "update:otherFinancialIncome": [value: number];
}>();

const countries: ReadonlyArray<{ value: CountryKey; label: string }> = [
  { value: "KR", label: "국내 (한국)" },
  ...Object.entries(DIVIDEND_TAX.FOREIGN_RATES).map(([key, info]) => ({
    value: key as CountryKey,
    label: `${info.label} (${(info.localRate * 100).toFixed(1)}%)`,
  })),
];

const dividendPresets = [
  { label: "100만", value: 1_000_000 },
  { label: "500만", value: 5_000_000 },
  { label: "2,000만", value: 20_000_000 },
] as const;

const incomePresets = [
  { label: "0원", value: 0 },
  { label: "1,000만", value: 10_000_000 },
  { label: "2,000만", value: 20_000_000 },
] as const;

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
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">배당금(세전)</label>
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
          <div class="mt-3 flex flex-wrap gap-2">
            <Button
              v-for="preset in dividendPresets"
              :key="preset.label"
              type="button"
              variant="outline"
              size="chipSm"
              @click="emit('update:dividendAmount', preset.value)"
            >
              {{ preset.label }}
            </Button>
          </div>
        </div>

        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">배당 국가</label>
          <div class="grid grid-cols-1 gap-2">
            <label
              v-for="countryItem in countries"
              :key="countryItem.value"
              :class="[
                'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-caption transition-colors',
                country === countryItem.value
                  ? 'border-primary bg-primary/8 font-semibold text-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/50',
              ]"
            >
              <input
                type="radio"
                name="country"
                class="retro-radio"
                :value="countryItem.value"
                :checked="country === countryItem.value"
                @change="emit('update:country', countryItem.value)"
              />
              {{ countryItem.label }}
            </label>
          </div>
        </div>

        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">기타 금융소득</label>
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
          <p class="mt-2 text-tiny text-muted-foreground">연간 합계 2,000만원 초과 시 종합과세입니다.</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <Button
              v-for="preset in incomePresets"
              :key="preset.label"
              type="button"
              variant="outline"
              size="chipSm"
              @click="emit('update:otherFinancialIncome', preset.value)"
            >
              {{ preset.label }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
