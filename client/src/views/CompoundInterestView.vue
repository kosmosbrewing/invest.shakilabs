<script setup lang="ts">
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import RelatedCalculatorLinks from "@/components/common/RelatedCalculatorLinks.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import CompoundInputPanel from "@/components/compound/CompoundInputPanel.vue";
import CompoundResultPanel from "@/components/compound/CompoundResultPanel.vue";
import CalculatorPageHeader from "@/components/invest/CalculatorPageHeader.vue";
import { useCompoundInterestCalc } from "@/composables/useCompoundInterestCalc";
import { INTEREST_DATA_UPDATED } from "@/data/interestData";
import { formatManWon } from "@/lib/utils";
import { computed } from "vue";

const props = defineProps<{ initialAmountMan?: number }>();
const amountLabel = computed(() =>
  props.initialAmountMan ? formatManWon(props.initialAmountMan * 10_000) : null,
);
const seoTitle = computed(() =>
  amountLabel.value
    ? `${amountLabel.value} 복리 계산기 | 단리 vs 복리 시뮬레이션`
    : "2026 복리 계산기 | 단리 vs 복리 비교·72법칙",
);
const seoDesc = computed(() =>
  amountLabel.value
    ? `${amountLabel.value} 투자 시 단리와 복리의 차이를 시뮬레이션합니다.`
    : "초기 투자금과 월 적립금을 입력하면 단리와 복리의 최종 금액 차이를 비교합니다. 72법칙으로 원금 2배 시점도 확인.",
);

const calc = useCompoundInterestCalc(props.initialAmountMan);

const faqItems = [
  {
    q: "복리와 단리의 차이는 무엇인가요?",
    a: "단리는 원금에만 이자가 붙고, 복리는 원금+이자에 다시 이자가 붙습니다. 기간이 길수록 복리 효과가 크게 나타납니다.",
  },
  {
    q: "72법칙이란 무엇인가요?",
    a: "72를 연수익률(%)로 나누면 원금이 2배가 되는 대략적인 기간을 구할 수 있습니다. 예: 연 6%면 72/6 = 약 12년.",
  },
  {
    q: "월 적립금도 복리가 적용되나요?",
    a: "네, 이 계산기에서는 매월 적립금에도 월복리를 적용합니다. 적립식 투자의 복리 효과를 확인할 수 있습니다.",
  },
  {
    q: "세금은 반영되나요?",
    a: "이 계산기는 세전 기준입니다. 실제 투자에서는 이자소득세(15.4%) 등이 추가로 발생할 수 있습니다.",
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
  <SEOHead :title="seoTitle" :description="seoDesc" :json-ld="faqJsonLd" />

  <div class="container space-y-5 py-5">
    <CalculatorPageHeader title="복리 계산기" />

    <section class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">계산 기준 안내</h2>
        <FreshBadge :message="`${INTEREST_DATA_UPDATED} 기준`" />
      </div>
      <div class="retro-panel-content space-y-2">
        <p class="text-body text-muted-foreground">초기 투자금과 월 적립금을 입력하면 단리와 복리의 최종 금액 차이를 비교합니다.</p>
        <p class="text-tiny text-muted-foreground">72법칙으로 원금 2배 도달 시점도 확인할 수 있습니다.</p>
      </div>
    </section>

    <CompoundInputPanel
      :initial-amount="calc.initialAmount.value"
      :monthly-contribution="calc.monthlyContribution.value"
      :annual-rate="calc.annualRate.value"
      :years="calc.years.value"
      @update:initial-amount="calc.initialAmount.value = $event"
      @update:monthly-contribution="calc.monthlyContribution.value = $event"
      @update:annual-rate="calc.annualRate.value = $event"
      @update:years="calc.years.value = $event"
    />

    <CompoundResultPanel :result="calc.result.value" />
    <RelatedCalculatorLinks current-path="/compound-interest" />
    <FaqAccordionPanel :items="faqItems" />
  </div>
</template>
