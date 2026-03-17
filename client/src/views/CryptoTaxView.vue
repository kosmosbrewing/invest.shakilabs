<script setup lang="ts">
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import RelatedCalculatorLinks from "@/components/common/RelatedCalculatorLinks.vue";
import RelatedServices from "@/components/common/RelatedServices.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import CryptoInputPanel from "@/components/crypto/CryptoInputPanel.vue";
import CryptoResultPanel from "@/components/crypto/CryptoResultPanel.vue";
import { useCryptoTaxCalc } from "@/composables/useCryptoTaxCalc";
import { CRYPTO_TAX_STATUS_NOTE, INVEST_DATA_UPDATED } from "@/data/investTaxRates";

const calc = useCryptoTaxCalc();

const faqItems = [
  {
    q: "가상자산 세금 시뮬레이터는 어떤 기준으로 계산하나요?",
    a: "2027년 예정 과세 기준으로 양도차익에서 기본공제 250만원을 반영하고 남은 금액에 22% 세율을 적용해 계산합니다.",
  },
  {
    q: "아직 과세가 시행되지 않았는데 왜 미리 계산하나요?",
    a: "예정 기준으로 미리 세후 수익을 가늠해 보고 매도 시점과 목표 수익률을 계획하는 데 참고할 수 있기 때문입니다.",
  },
  {
    q: "매수·매도 수수료도 반영할 수 있나요?",
    a: "가능합니다. 필요경비 입력란에 거래 수수료와 기타 비용을 합산해 넣으면 과세표준을 더 보수적으로 볼 수 있습니다.",
  },
] as const;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};
</script>

<template>
  <SEOHead
    title="가상자산 세금 시뮬레이터 | 2027 예정 과세 기준"
    description="가상자산(비트코인, 이더리움 등) 양도차익에 대한 예정 세액을 시뮬레이션합니다. 2027년 예정 기준, 기본공제 250만원과 22% 세율을 반영합니다."
    :json-ld="faqJsonLd"
  />

  <div class="container space-y-5 py-5">
    <section class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">가상자산 세금 시뮬레이터</h1>
        <FreshBadge :message="`${INVEST_DATA_UPDATED} 기준`" />
      </div>
      <div class="retro-panel-content space-y-2">
        <p class="text-body text-muted-foreground">{{ CRYPTO_TAX_STATUS_NOTE }}</p>
        <p class="text-tiny text-muted-foreground">
          매수금액, 매도금액, 필요경비를 넣어 2027년 예정 기준 세후 수익을 빠르게 시뮬레이션합니다.
        </p>
      </div>
    </section>

    <CryptoInputPanel
      :purchase-amount="calc.purchaseAmount.value"
      :sale-amount="calc.saleAmount.value"
      :expenses="calc.expenses.value"
      @update:purchase-amount="calc.purchaseAmount.value = $event"
      @update:sale-amount="calc.saleAmount.value = $event"
      @update:expenses="calc.expenses.value = $event"
    />

    <CryptoResultPanel :result="calc.result.value" />
    <RelatedCalculatorLinks current-path="/crypto-tax" />
    <FaqAccordionPanel :items="faqItems" />
    <RelatedServices />
  </div>
</template>
