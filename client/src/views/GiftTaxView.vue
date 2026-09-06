<script setup lang="ts">
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import IntentRelatedLinks from "@/components/invest/IntentRelatedLinks.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import { mergeFaqs } from "@/lib/faqMerge";
import { GIFT_TAX_GUIDE } from "@/data/seoGuides";
import GiftTaxInputPanel from "@/components/gift/GiftTaxInputPanel.vue";
import GiftTaxResultPanel from "@/components/gift/GiftTaxResultPanel.vue";
import CalculatorPageHeader from "@/components/invest/CalculatorPageHeader.vue";
import CalculatorInteractionTracker from "@/components/analytics/CalculatorInteractionTracker.vue";
import { useGiftTaxCalc } from "@/composables/useGiftTaxCalc";
import { GIFT_TAX_FAQS, GIFT_TAX_SOURCES, GIFT_TAX_UPDATED } from "@/data/giftTax";
import { formatManWon } from "@/lib/utils";
import { computed } from "vue";

const props = defineProps<{ initialGift?: number }>();
// 금액 변종(/gift-tax/{금액})은 대표 페이지와 프리렌더 본문이 100% 동일하므로
// canonical·hreflang·og:url을 /gift-tax로 통합한다
// (seo-routes.mjs CANONICAL_OVERRIDES와 동일 규약 · noindex 아님, 프리렌더 유지).
const canonicalPath = computed(() =>
  props.initialGift != null ? "/gift-tax" : undefined,
);
const amountLabel = computed(() => props.initialGift ? formatManWon(props.initialGift) : null);
const seoTitle = computed(() =>
  amountLabel.value ? `${amountLabel.value} 증여세 계산기 | 2026 공제 한도 반영` : "증여세 계산기 | 2026 공제 한도 반영",
);
const seoDesc = computed(() =>
  amountLabel.value ? `${amountLabel.value} 증여 시 관계별 공제 한도와 예상 증여세를 계산합니다.` : "증여금액과 관계를 입력하면 공제 한도를 반영해 예상 증여세를 계산합니다.",
);

const calc = useGiftTaxCalc(props.initialGift);

// 화면에 실제 렌더되는 병합 FAQ와 구조화 데이터를 일치시킨다 (스키마 규칙)
const mergedFaqs = mergeFaqs(GIFT_TAX_FAQS, GIFT_TAX_GUIDE.faqs);
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
    <CalculatorPageHeader title="증여세 계산기" />

    <section class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">과세 기준 안내</h2>
        <FreshBadge :message="`${GIFT_TAX_UPDATED} 기준`" />
      </div>
      <div class="retro-panel-content space-y-2">
        <p class="text-body text-muted-foreground">관계별 10년 합산 공제와 누진세율을 기준으로 예상 세액을 계산합니다.</p>
        <p class="text-tiny text-muted-foreground">배우자, 자녀, 부모, 기타 친족별 공제 차이와 세대생략 가산세, 기한 내 신고 시 신고세액공제 3%까지 확인할 수 있습니다.</p>
      </div>
    </section>

    <CalculatorInteractionTracker
      calculator-id="gift_tax"
      page-path="/invest/gift-tax"
    >
      <GiftTaxInputPanel
        :gift-amount="calc.giftAmount.value"
        :prior-deduction-used="calc.priorDeductionUsed.value"
        :relationship="calc.relationship.value"
        :is-generation-skipping="calc.isGenerationSkipping.value"
        @update:gift-amount="calc.giftAmount.value = $event"
        @update:prior-deduction-used="calc.priorDeductionUsed.value = $event"
        @update:relationship="calc.relationship.value = $event"
        @update:is-generation-skipping="calc.isGenerationSkipping.value = $event"
      />
    </CalculatorInteractionTracker>

    <GiftTaxResultPanel :result="calc.result.value" />
    <IntentRelatedLinks current-path="/gift-tax" />
    <FaqAccordionPanel title="출처 및 FAQ" :items="mergedFaqs">
      <template #before>
        <div class="rounded-lg bg-muted/40 px-3 py-2 text-tiny text-muted-foreground">
          <p v-for="source in GIFT_TAX_SOURCES" :key="source.url">
            {{ source.name }} ·
            <a :href="source.url" class="text-primary underline" target="_blank" rel="noopener noreferrer">
              {{ source.basis }}
            </a>
          </p>
        </div>
      </template>
    </FaqAccordionPanel>

    <SeoRichGuide
      :title="GIFT_TAX_GUIDE.title"
      :intro="GIFT_TAX_GUIDE.intro"
      :sections="GIFT_TAX_GUIDE.sections"      :disclaimer="GIFT_TAX_GUIDE.disclaimer"
    />
  </div>
</template>
