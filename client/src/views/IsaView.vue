<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import IsaInputPanel from "@/components/isa/IsaInputPanel.vue";
import IsaResultPanel from "@/components/isa/IsaResultPanel.vue";
import { useIsaCalc } from "@/composables/useIsaCalc";

const calc = useIsaCalc();
</script>

<template>
  <div class="container space-y-4 py-6">
    <SEOHead
      title="2026 ISA 만기 세후 비교 | ISA vs 일반계좌 절세 효과"
      description="ISA(개인종합자산관리계좌) 만기 시 세후 수령액을 일반 계좌와 비교합니다. 비과세 200만·400만원 혜택 확인."
    />

    <h1 class="text-h1 font-brand">ISA 만기 세후 비교</h1>
    <p class="text-caption text-muted-foreground -mt-2">
      ISA 계좌와 일반 계좌의 만기 시 세후 수령액을 비교합니다.
    </p>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <IsaInputPanel
        :annual-investment="calc.annualInvestment.value"
        :annual-return-rate="calc.annualReturnRate.value"
        :holding-years="calc.holdingYears.value"
        :isa-type="calc.isaType.value"
        @update:annual-investment="calc.annualInvestment.value = $event"
        @update:annual-return-rate="calc.annualReturnRate.value = $event"
        @update:holding-years="calc.holdingYears.value = $event"
        @update:isa-type="calc.isaType.value = $event"
      />

      <IsaResultPanel :result="calc.result.value" />
    </div>
  </div>
</template>
