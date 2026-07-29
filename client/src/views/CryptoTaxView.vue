<script setup lang="ts">
import { ShSurface, ShText } from "@shakilabs/ui";
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import IntentRelatedLinks from "@/components/invest/IntentRelatedLinks.vue";
import RelatedServices from "@/components/common/RelatedServices.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import { CRYPTO_TAX_GUIDE } from "@/data/seoGuides";
import CryptoInputPanel from "@/components/crypto/CryptoInputPanel.vue";
import CryptoResultPanel from "@/components/crypto/CryptoResultPanel.vue";
import CalculatorPageHeader from "@/components/invest/CalculatorPageHeader.vue";
import CalculatorInteractionTracker from "@/components/analytics/CalculatorInteractionTracker.vue";
import { useCryptoTaxCalc } from "@/composables/useCryptoTaxCalc";
import { CRYPTO_TAX_STATUS_NOTE, INVEST_DATA_UPDATED } from "@/data/investTaxRates";
import { formatManWon } from "@/lib/utils";
import { computed } from "vue";

const props = defineProps<{ initialPurchase?: number }>();
const amountLabel = computed(() => props.initialPurchase ? formatManWon(props.initialPurchase) : null);
const seoTitle = computed(() =>
  amountLabel.value ? `${amountLabel.value} 가상자산 세금 시뮬레이터 | 2027 예정 과세 기준` : "가상자산 세금 시뮬레이터 | 2027 예정 과세 기준",
);
const seoDesc = computed(() =>
  amountLabel.value ? `${amountLabel.value} 투자 시 양도차익에 대한 예상 세금을 시뮬레이션합니다.` : "2027년 예정 과세 기준으로 양도차익에서 기본공제 250만원을 반영해 예상 세금을 계산합니다.",
);

const calc = useCryptoTaxCalc(props.initialPurchase);

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
    :title="seoTitle"
    :description="seoDesc"
    :json-ld="faqJsonLd"
  />

  <div class="text-resize-layout container space-y-5 py-5">
    <CalculatorPageHeader title="가상자산 세금 시뮬레이터" />

    <ShSurface as="section" padding="none" class="overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <ShText as="h2" variant="heading">과세 기준 안내</ShText>
        <FreshBadge :message="`${INVEST_DATA_UPDATED} 기준`" />
      </div>
      <div class="retro-panel-content space-y-2">
        <p class="text-body text-muted-foreground">{{ CRYPTO_TAX_STATUS_NOTE }}</p>
        <p class="text-tiny text-muted-foreground">
          매수금액, 매도금액, 필요경비를 넣어 2027년 예정 기준 세후 수익을 빠르게 시뮬레이션합니다.
        </p>
      </div>
    </ShSurface>

    <CalculatorInteractionTracker
      calculator-id="crypto_tax"
      page-path="/invest/crypto-tax"
    >
      <CryptoInputPanel
        :purchase-amount="calc.purchaseAmount.value"
        :sale-amount="calc.saleAmount.value"
        :expenses="calc.expenses.value"
        @update:purchase-amount="calc.purchaseAmount.value = $event"
        @update:sale-amount="calc.saleAmount.value = $event"
        @update:expenses="calc.expenses.value = $event"
      />
    </CalculatorInteractionTracker>

    <CryptoResultPanel :result="calc.result.value" />
    <IntentRelatedLinks current-path="/crypto-tax" />
    <FaqAccordionPanel :items="faqItems" :extra="CRYPTO_TAX_GUIDE.faqs" />
    <RelatedServices />

    <SeoRichGuide
      :title="CRYPTO_TAX_GUIDE.title"
      :intro="CRYPTO_TAX_GUIDE.intro"
      :sections="CRYPTO_TAX_GUIDE.sections"      :disclaimer="CRYPTO_TAX_GUIDE.disclaimer"
    />
  </div>
</template>
