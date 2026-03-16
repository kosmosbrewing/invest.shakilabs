<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import DividendInputPanel from "@/components/dividend/DividendInputPanel.vue";
import DividendResultPanel from "@/components/dividend/DividendResultPanel.vue";
import { useDividendTaxCalc } from "@/composables/useDividendTaxCalc";

const calc = useDividendTaxCalc();
</script>

<template>
  <div class="container space-y-4 py-6">
    <SEOHead
      title="2026 배당소득세 계산기 | 국내·해외 배당세금 계산"
      description="국내외 주식 배당소득에 대한 세금을 계산합니다. 원천징수, 종합과세 비교까지 한번에."
    />

    <h1 class="text-h1 font-brand">2026 배당소득세 계산기</h1>
    <p class="text-caption text-muted-foreground -mt-2">
      국내·해외 주식 배당금에 대한 세금과 실수령액을 계산합니다.
    </p>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <DividendInputPanel
        :dividend-amount="calc.dividendAmount.value"
        :country="calc.country.value"
        :other-financial-income="calc.otherFinancialIncome.value"
        @update:dividend-amount="calc.dividendAmount.value = $event"
        @update:country="calc.country.value = $event as any"
        @update:other-financial-income="calc.otherFinancialIncome.value = $event"
      />

      <DividendResultPanel :result="calc.result.value" />
    </div>
  </div>
</template>
