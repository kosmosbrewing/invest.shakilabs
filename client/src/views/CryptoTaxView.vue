<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import CryptoInputPanel from "@/components/crypto/CryptoInputPanel.vue";
import CryptoResultPanel from "@/components/crypto/CryptoResultPanel.vue";
import { useCryptoTaxCalc } from "@/composables/useCryptoTaxCalc";
import { CRYPTO_TAX_STATUS_NOTE, INVEST_DATA_UPDATED } from "@/data/investTaxRates";

const calc = useCryptoTaxCalc();
</script>

<template>
  <div class="container space-y-4 py-6">
    <SEOHead
      title="가상자산 세금 시뮬레이터 | 2027 예정 과세 기준"
      description="가상자산(비트코인, 이더리움 등) 양도차익에 대한 예정 세액을 시뮬레이션합니다. 2027년 예정 기준, 기본공제 250만원과 22% 세율을 반영합니다."
    />

    <h1 class="text-h1 font-brand">가상자산 세금 시뮬레이터</h1>
    <p class="text-caption text-muted-foreground -mt-2">
      {{ CRYPTO_TAX_STATUS_NOTE }}
    </p>
    <p class="text-tiny text-muted-foreground">확인일: {{ INVEST_DATA_UPDATED }}</p>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <CryptoInputPanel
        :purchase-amount="calc.purchaseAmount.value"
        :sale-amount="calc.saleAmount.value"
        :expenses="calc.expenses.value"
        @update:purchase-amount="calc.purchaseAmount.value = $event"
        @update:sale-amount="calc.saleAmount.value = $event"
        @update:expenses="calc.expenses.value = $event"
      />

      <CryptoResultPanel :result="calc.result.value" />
    </div>
  </div>
</template>
