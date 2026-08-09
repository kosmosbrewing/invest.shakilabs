<script setup lang="ts">
import { computed } from "vue";
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import IntentRelatedLinks from "@/components/invest/IntentRelatedLinks.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import { mergeFaqs } from "@/lib/faqMerge";
import { FOREIGN_STOCK_TAX_GUIDE } from "@/data/seoGuides";
import ForeignStockTaxInputPanel from "@/components/foreignStock/ForeignStockTaxInputPanel.vue";
import ForeignStockTaxResultPanel from "@/components/foreignStock/ForeignStockTaxResultPanel.vue";
import CalculatorPageHeader from "@/components/invest/CalculatorPageHeader.vue";
import CalculatorInteractionTracker from "@/components/analytics/CalculatorInteractionTracker.vue";
import { useForeignStockTaxCalc } from "@/composables/useForeignStockTaxCalc";
import { FOREIGN_STOCK_TAX_FAQS, FOREIGN_STOCK_TAX_SOURCES, FOREIGN_STOCK_TAX_UPDATED } from "@/data/foreignStockTax";
import { formatManWon } from "@/lib/utils";

const props = defineProps<{ initialSellAmount?: number }>();
// 금액 변종(/foreign-stock-tax/{금액})은 대표 페이지와 프리렌더 본문이 100% 동일하므로
// canonical·hreflang·og:url을 /foreign-stock-tax로 통합한다
// (seo-routes.mjs CANONICAL_OVERRIDES와 동일 규약 · noindex 아님, 프리렌더 유지).
const canonicalPath = computed(() =>
  props.initialSellAmount != null ? "/foreign-stock-tax" : undefined,
);
const amountLabel = computed(() => props.initialSellAmount ? formatManWon(props.initialSellAmount) : null);
const seoTitle = computed(() =>
  amountLabel.value
    ? `${amountLabel.value} 해외주식 양도소득세 계산기 | 250만 공제 반영`
    : "해외주식 양도소득세 계산기 | 미국·해외주식 세금 22%",
);
const seoDesc = computed(() =>
  amountLabel.value
    ? `매도금액 ${amountLabel.value} 기준 해외주식 양도소득세와 세후 수익을 계산합니다.`
    : "매도·매수 금액을 입력하면 해외주식 양도소득세(22%)와 기본공제를 반영한 세후 수익을 계산합니다.",
);

const calc = useForeignStockTaxCalc(props.initialSellAmount);

// 화면에 실제 렌더되는 병합 FAQ와 구조화 데이터를 일치시킨다 (스키마 규칙)
const mergedFaqs = mergeFaqs(FOREIGN_STOCK_TAX_FAQS, FOREIGN_STOCK_TAX_GUIDE.faqs);
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
    <CalculatorPageHeader title="해외주식 양도소득세 계산기" />

    <section class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">과세 기준 안내</h2>
        <FreshBadge :message="`${FOREIGN_STOCK_TAX_UPDATED} 기준`" />
      </div>
      <div class="retro-panel-content space-y-2">
        <p class="text-body text-muted-foreground">매도·매수 금액과 수수료를 입력하면 해외주식 양도소득세를 계산합니다.</p>
        <p class="text-tiny text-muted-foreground">연간 기본공제 250만원과 다른 종목 손익 합산을 반영합니다.</p>
      </div>
    </section>

    <CalculatorInteractionTracker
      calculator-id="foreign_stock_tax"
      page-path="/invest/foreign-stock-tax"
    >
      <ForeignStockTaxInputPanel
        :sell-amount="calc.sellAmount.value"
        :buy-amount="calc.buyAmount.value"
        :fees="calc.fees.value"
        :other-gains="calc.otherGains.value"
        :other-losses="calc.otherLosses.value"
        @update:sell-amount="calc.sellAmount.value = $event"
        @update:buy-amount="calc.buyAmount.value = $event"
        @update:fees="calc.fees.value = $event"
        @update:other-gains="calc.otherGains.value = $event"
        @update:other-losses="calc.otherLosses.value = $event"
      />
    </CalculatorInteractionTracker>

    <ForeignStockTaxResultPanel :result="calc.result.value" />
    <IntentRelatedLinks current-path="/foreign-stock-tax" />
    <FaqAccordionPanel title="출처 및 FAQ" :items="mergedFaqs">
      <template #before>
        <div class="rounded-lg bg-muted/40 px-3 py-2 text-tiny text-muted-foreground">
          <p v-for="source in FOREIGN_STOCK_TAX_SOURCES" :key="source.url">
            {{ source.name }} ·
            <a :href="source.url" class="text-primary underline" target="_blank" rel="noopener noreferrer">
              {{ source.basis }}
            </a>
          </p>
        </div>
      </template>
    </FaqAccordionPanel>

    <SeoRichGuide
      :title="FOREIGN_STOCK_TAX_GUIDE.title"
      :intro="FOREIGN_STOCK_TAX_GUIDE.intro"
      :sections="FOREIGN_STOCK_TAX_GUIDE.sections"      :disclaimer="FOREIGN_STOCK_TAX_GUIDE.disclaimer"
    />
  </div>
</template>
