<script setup lang="ts">
import { computed } from "vue";
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import IntentRelatedLinks from "@/components/invest/IntentRelatedLinks.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import { mergeFaqs } from "@/lib/faqMerge";
import { INHERITANCE_TAX_GUIDE } from "@/data/seoGuides";
import InheritanceTaxInputPanel from "@/components/inheritance/InheritanceTaxInputPanel.vue";
import InheritanceTaxResultPanel from "@/components/inheritance/InheritanceTaxResultPanel.vue";
import CalculatorPageHeader from "@/components/invest/CalculatorPageHeader.vue";
import CalculatorInteractionTracker from "@/components/analytics/CalculatorInteractionTracker.vue";
import { useInheritanceTaxCalc } from "@/composables/useInheritanceTaxCalc";
import { INHERITANCE_TAX_FAQS, INHERITANCE_TAX_SOURCES, INHERITANCE_TAX_UPDATED } from "@/data/inheritanceTax";
import { formatManWon } from "@/lib/utils";

const props = defineProps<{ initialEstate?: number }>();
// 금액 변종(/inheritance-tax/{금액})은 대표 페이지와 프리렌더 본문이 100% 동일하므로
// canonical·hreflang·og:url을 /inheritance-tax로 통합한다
// (seo-routes.mjs CANONICAL_OVERRIDES와 동일 규약 · noindex 아님, 프리렌더 유지).
const canonicalPath = computed(() =>
  props.initialEstate != null ? "/inheritance-tax" : undefined,
);
const amountLabel = computed(() => props.initialEstate ? formatManWon(props.initialEstate) : null);
const seoTitle = computed(() =>
  amountLabel.value
    ? `${amountLabel.value} 상속세 계산기 | 배우자·자녀 공제 반영`
    : "상속세 계산기 | 배우자공제·일괄공제·금융재산공제 반영",
);
const seoDesc = computed(() =>
  amountLabel.value
    ? `상속재산 ${amountLabel.value} 기준 배우자공제와 일괄공제를 반영한 예상 상속세를 계산합니다.`
    : "상속재산과 공제 조건을 입력하면 배우자·일괄·금융재산 공제를 반영한 상속세를 계산합니다.",
);

const calc = useInheritanceTaxCalc(props.initialEstate);

// 화면에 실제 렌더되는 병합 FAQ와 구조화 데이터를 일치시킨다 (스키마 규칙)
const mergedFaqs = mergeFaqs(INHERITANCE_TAX_FAQS, INHERITANCE_TAX_GUIDE.faqs);
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
    <CalculatorPageHeader title="상속세 계산기" />

    <section class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">과세 기준 안내</h2>
        <FreshBadge :message="`${INHERITANCE_TAX_UPDATED} 기준`" />
      </div>
      <div class="retro-panel-content space-y-2">
        <p class="text-body text-muted-foreground">배우자공제, 일괄공제, 금융재산공제를 반영하여 예상 상속세를 계산합니다.</p>
        <p class="text-tiny text-muted-foreground">기한 내 신고세액공제(3%)까지 반영한 실납부 세액을 확인할 수 있습니다.</p>
      </div>
    </section>

    <CalculatorInteractionTracker
      calculator-id="inheritance_tax"
      page-path="/invest/inheritance-tax"
    >
      <InheritanceTaxInputPanel
        :total-estate="calc.totalEstate.value"
        :debt="calc.debt.value"
        :financial-assets="calc.financialAssets.value"
        :has-spouse="calc.hasSpouse.value"
        :children-count="calc.childrenCount.value"
        @update:total-estate="calc.totalEstate.value = $event"
        @update:debt="calc.debt.value = $event"
        @update:financial-assets="calc.financialAssets.value = $event"
        @update:has-spouse="calc.hasSpouse.value = $event"
        @update:children-count="calc.childrenCount.value = $event"
      />
    </CalculatorInteractionTracker>

    <InheritanceTaxResultPanel :result="calc.result.value" />
    <IntentRelatedLinks current-path="/inheritance-tax" />
    <FaqAccordionPanel title="출처 및 FAQ" :items="mergedFaqs">
      <template #before>
        <div class="rounded-lg bg-muted/40 px-3 py-2 text-tiny text-muted-foreground">
          <p v-for="source in INHERITANCE_TAX_SOURCES" :key="source.url">
            {{ source.name }} ·
            <a :href="source.url" class="text-primary underline" target="_blank" rel="noopener noreferrer">
              {{ source.basis }}
            </a>
          </p>
        </div>
      </template>
    </FaqAccordionPanel>

    <SeoRichGuide
      :title="INHERITANCE_TAX_GUIDE.title"
      :intro="INHERITANCE_TAX_GUIDE.intro"
      :sections="INHERITANCE_TAX_GUIDE.sections"      :disclaimer="INHERITANCE_TAX_GUIDE.disclaimer"
    />
  </div>
</template>
