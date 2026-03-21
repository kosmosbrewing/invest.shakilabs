<script setup lang="ts">
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import RelatedCalculatorLinks from "@/components/common/RelatedCalculatorLinks.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import DividendInputPanel from "@/components/dividend/DividendInputPanel.vue";
import DividendResultPanel from "@/components/dividend/DividendResultPanel.vue";
import { useDividendTaxCalc } from "@/composables/useDividendTaxCalc";
import { INVEST_DATA_UPDATED } from "@/data/investTaxRates";
import { formatManWon } from "@/lib/utils";
import { computed } from "vue";

const props = defineProps<{ initialDividend?: number }>();
const amountLabel = computed(() => props.initialDividend ? formatManWon(props.initialDividend) : null);
const seoTitle = computed(() =>
  amountLabel.value ? `배당금 ${amountLabel.value} 배당소득세 계산기 | 국내·해외` : "2026 배당소득세 계산기 | 국내·해외 배당세금 계산",
);
const seoDesc = computed(() =>
  amountLabel.value ? `배당금 ${amountLabel.value} 수령 시 원천징수와 종합과세 기준 세부담을 계산합니다.` : "국내 배당은 15.4% 원천징수, 해외 배당은 현지 원천징수 후 차액 반영까지 계산합니다.",
);

const calc = useDividendTaxCalc(props.initialDividend);

const faqItems = [
  {
    q: "국내 배당과 해외 배당은 무엇이 다른가요?",
    a: "국내 배당은 15.4% 원천징수가 기본이고, 해외 배당은 현지 원천징수 후 국내 세율과의 차액을 추가 반영해야 할 수 있습니다.",
  },
  {
    q: "금융소득 2,000만원을 넘으면 어떻게 되나요?",
    a: "이자와 배당 합계가 2,000만원을 넘으면 종합과세 대상이 되어 기존 원천징수 외 추가 세부담이 생길 수 있습니다.",
  },
  {
    q: "외국납부세액공제도 고려되나요?",
    a: "해외 배당 계산에는 현지 원천징수와 국내 추가세액을 반영하고, 종합과세 시나리오에는 외국납부세액공제를 단순화해 반영합니다.",
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
    :title="seoTitle"
    :description="seoDesc"
    :json-ld="faqJsonLd"
  />

  <div class="container space-y-5 py-5">
    <section class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">2026 배당소득세 계산기</h1>
        <FreshBadge :message="`${INVEST_DATA_UPDATED} 기준`" />
      </div>
      <div class="retro-panel-content space-y-2">
        <p class="text-body text-muted-foreground">국내·해외 배당금의 원천징수와 예상 실수령액을 계산합니다.</p>
        <p class="text-tiny text-muted-foreground">금융소득 종합과세 기준 2,000만원 초과 여부까지 함께 확인할 수 있습니다.</p>
      </div>
    </section>

    <DividendInputPanel
      :dividend-amount="calc.dividendAmount.value"
      :country="calc.country.value"
      :other-financial-income="calc.otherFinancialIncome.value"
      @update:dividend-amount="calc.dividendAmount.value = $event"
      @update:country="calc.country.value = $event"
      @update:other-financial-income="calc.otherFinancialIncome.value = $event"
    />

    <DividendResultPanel :result="calc.result.value" />
    <RelatedCalculatorLinks current-path="/dividend-tax" />
    <FaqAccordionPanel :items="faqItems" />
  </div>
</template>
