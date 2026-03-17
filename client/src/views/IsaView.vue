<script setup lang="ts">
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import RelatedCalculatorLinks from "@/components/common/RelatedCalculatorLinks.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import IsaInputPanel from "@/components/isa/IsaInputPanel.vue";
import IsaResultPanel from "@/components/isa/IsaResultPanel.vue";
import { useIsaCalc } from "@/composables/useIsaCalc";
import { INVEST_DATA_UPDATED } from "@/data/investTaxRates";

const calc = useIsaCalc();

const faqItems = [
  {
    q: "ISA 일반형과 서민형 차이는 무엇인가요?",
    a: "일반형은 비과세 200만원, 서민형은 비과세 400만원을 적용하며 초과분만 9.9% 분리과세합니다.",
  },
  {
    q: "절세 효과가 크게 나오는 조건은 무엇인가요?",
    a: "총 수익이 비과세 한도에 가까울수록, 그리고 일반 계좌에서 낼 세금이 커질수록 ISA 절세 효과가 크게 체감됩니다.",
  },
  {
    q: "의무 가입기간 3년은 왜 중요한가요?",
    a: "ISA는 최소 3년 유지가 기본이므로 단기 자금보다 중기 투자 계획에서 절세 효과를 보는 구조입니다.",
  },
] as const;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};
</script>

<template>
  <SEOHead
    title="2026 ISA 만기 세후 비교 | ISA vs 일반계좌 절세 효과"
    description="ISA(개인종합자산관리계좌) 만기 시 세후 수령액을 일반 계좌와 비교합니다. 비과세 200만·400만원 혜택 확인."
    :json-ld="faqJsonLd"
  />

  <div class="container space-y-5 py-5">
    <section class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">ISA 만기 세후 비교</h1>
        <FreshBadge :message="`${INVEST_DATA_UPDATED} 기준`" />
      </div>
      <div class="retro-panel-content space-y-2">
        <p class="text-body text-muted-foreground">ISA 계좌와 일반 계좌의 만기 시 세후 수령액 차이를 계산합니다.</p>
        <p class="text-tiny text-muted-foreground">연 투자금, 수익률, 보유 기간을 바꿔보며 절세 효과 변화를 바로 확인할 수 있습니다.</p>
      </div>
    </section>

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
    <RelatedCalculatorLinks current-path="/isa" />
    <FaqAccordionPanel :items="faqItems" />
  </div>
</template>
