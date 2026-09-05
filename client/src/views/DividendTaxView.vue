<script setup lang="ts">
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import IntentRelatedLinks from "@/components/invest/IntentRelatedLinks.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import { mergeFaqs } from "@/lib/faqMerge";
import { DIVIDEND_TAX_GUIDE } from "@/data/seoGuides";
import DividendInputPanel from "@/components/dividend/DividendInputPanel.vue";
import DividendResultPanel from "@/components/dividend/DividendResultPanel.vue";
import CalculatorPageHeader from "@/components/invest/CalculatorPageHeader.vue";
import CalculatorInteractionTracker from "@/components/analytics/CalculatorInteractionTracker.vue";
import { useDividendTaxCalc } from "@/composables/useDividendTaxCalc";
import { INVEST_DATA_UPDATED } from "@/data/investTaxRates";
import { formatManWon } from "@/lib/utils";
import { computed } from "vue";

const props = defineProps<{ initialDividend?: number }>();
// 금액 변종(/dividend-tax/{금액})은 대표 페이지와 프리렌더 본문이 100% 동일하므로
// canonical·hreflang·og:url을 /dividend-tax로 통합한다
// (seo-routes.mjs CANONICAL_OVERRIDES와 동일 규약 · noindex 아님, 프리렌더 유지).
const canonicalPath = computed(() =>
  props.initialDividend != null ? "/dividend-tax" : undefined,
);
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
    a: "이자와 배당 합계가 2,000만원을 넘으면 초과분이 근로·사업소득 등 다른 종합소득과 합산되어 누진세율로 과세됩니다. 다만 소득세법 제62조의 비교과세에 따라 종합과세 세액은 금융소득 전체를 14%로 분리과세한 세액보다 낮아지지 않으므로, 다른 소득이 없거나 적으면 추가 세부담이 0원일 수 있고 다른 소득이 많을수록 추가 세부담이 커집니다.",
  },
  {
    q: "외국납부세액공제도 고려되나요?",
    a: "해외 배당 계산에는 현지 원천징수와 국내 추가세액을 반영하고, 종합과세 시나리오에는 외국납부세액공제를 한도(산출세액 × 국외소득 비율) 안에서 반영합니다. 해외 배당은 배당가산·배당세액공제 대상이 아닙니다.",
  },
] as const;

// 화면에 실제 렌더되는 병합 FAQ와 구조화 데이터를 일치시킨다 (스키마 규칙)
const mergedFaqs = mergeFaqs(faqItems, DIVIDEND_TAX_GUIDE.faqs);
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: mergedFaqs.map((faq) => ({
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
    :canonical-path="canonicalPath"
  />

  <div class="container space-y-5 py-5">
    <CalculatorPageHeader title="배당소득세 계산기" />

    <section class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">과세 기준 안내</h2>
        <FreshBadge :message="`${INVEST_DATA_UPDATED} 기준`" />
      </div>
      <div class="retro-panel-content space-y-2">
        <p class="text-body text-muted-foreground">국내·해외 배당금의 원천징수와 예상 실수령액을 계산합니다.</p>
        <p class="text-tiny text-muted-foreground">금융소득 종합과세 기준 2,000만원 초과 여부까지 함께 확인할 수 있습니다.</p>
      </div>
    </section>

    <CalculatorInteractionTracker
      calculator-id="dividend_tax"
      page-path="/invest/dividend-tax"
    >
      <DividendInputPanel
        :dividend-amount="calc.dividendAmount.value"
        :country="calc.country.value"
        :other-financial-income="calc.otherFinancialIncome.value"
        :other-comprehensive-income="calc.otherComprehensiveIncome.value"
        @update:dividend-amount="calc.dividendAmount.value = $event"
        @update:country="calc.country.value = $event"
        @update:other-financial-income="calc.otherFinancialIncome.value = $event"
        @update:other-comprehensive-income="calc.otherComprehensiveIncome.value = $event"
      />
    </CalculatorInteractionTracker>

    <DividendResultPanel :result="calc.result.value" />
    <IntentRelatedLinks current-path="/dividend-tax" />
    <FaqAccordionPanel :items="mergedFaqs" />

    <SeoRichGuide
      :title="DIVIDEND_TAX_GUIDE.title"
      :intro="DIVIDEND_TAX_GUIDE.intro"
      :sections="DIVIDEND_TAX_GUIDE.sections"      :disclaimer="DIVIDEND_TAX_GUIDE.disclaimer"
    />
  </div>
</template>
