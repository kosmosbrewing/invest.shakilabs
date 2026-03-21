<script setup lang="ts">
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import RelatedCalculatorLinks from "@/components/common/RelatedCalculatorLinks.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import SavingsInputPanel from "@/components/savings/SavingsInputPanel.vue";
import SavingsResultPanel from "@/components/savings/SavingsResultPanel.vue";
import { useSavingsInterestCalc } from "@/composables/useSavingsInterestCalc";
import { INTEREST_DATA_UPDATED } from "@/data/interestData";
import { formatManWon } from "@/lib/utils";
import { computed } from "vue";

const props = defineProps<{ initialMonthlyMan?: number }>();
const amountLabel = computed(() =>
  props.initialMonthlyMan ? `월 ${formatManWon(props.initialMonthlyMan * 10_000)}` : null,
);
const seoTitle = computed(() =>
  amountLabel.value
    ? `${amountLabel.value} 적금 이자 계산기 | 만기 수령액 시뮬레이션`
    : "2026 적금 이자 계산기 | 만기 수령액·세후 이자 계산",
);
const seoDesc = computed(() =>
  amountLabel.value
    ? `${amountLabel.value} 적금 시 만기 수령액과 세후 이자를 계산합니다.`
    : "적금 월 적립액, 이율, 기간을 입력하면 만기 수령액과 세후 이자를 바로 확인할 수 있습니다.",
);

const calc = useSavingsInterestCalc(props.initialMonthlyMan);

const faqItems = [
  {
    q: "적금 이자는 단리와 복리 중 어떤 방식으로 계산되나요?",
    a: "대부분의 시중 적금 상품은 단리로 계산됩니다. 이 계산기도 단리 기준으로 세후 이자와 만기 수령액을 산출합니다.",
  },
  {
    q: "이자소득세는 얼마나 부과되나요?",
    a: "일반과세는 15.4%(소득세 14% + 지방소득세 1.4%), 세금우대는 9.5%, 비과세 상품은 0%입니다.",
  },
  {
    q: "세금우대 적금은 누가 가입할 수 있나요?",
    a: "조합원(농·수·신협, 새마을금고 등)으로 가입 시 1인당 3,000만원 한도로 9.5% 세금우대를 받을 수 있습니다.",
  },
  {
    q: "중도해지하면 이자는 어떻게 되나요?",
    a: "중도해지 시 약정금리가 아닌 중도해지 금리가 적용되어 이자가 크게 줄어듭니다. 가능하면 만기까지 유지하는 것이 유리합니다.",
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
    <section class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">적금 이자 계산기</h1>
        <FreshBadge :message="`${INTEREST_DATA_UPDATED} 기준`" />
      </div>
      <div class="retro-panel-content space-y-2">
        <p class="text-body text-muted-foreground">월 적립액, 연이율, 기간을 입력하면 만기 수령액과 세후 이자를 바로 계산합니다.</p>
        <p class="text-tiny text-muted-foreground">일반과세(15.4%), 세금우대(9.5%), 비과세 중 선택하여 세후 수령액을 비교할 수 있습니다.</p>
      </div>
    </section>

    <SavingsInputPanel
      :monthly-deposit="calc.monthlyDeposit.value"
      :months="calc.months.value"
      :annual-rate="calc.annualRate.value"
      :tax-type="calc.taxType.value"
      @update:monthly-deposit="calc.monthlyDeposit.value = $event"
      @update:months="calc.months.value = $event"
      @update:annual-rate="calc.annualRate.value = $event"
      @update:tax-type="calc.taxType.value = $event"
    />

    <SavingsResultPanel :result="calc.result.value" />
    <RelatedCalculatorLinks current-path="/savings-interest" />
    <FaqAccordionPanel :items="faqItems" />
  </div>
</template>
