<script setup lang="ts">
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import IntentRelatedLinks from "@/components/invest/IntentRelatedLinks.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import { SAVINGS_INTEREST_GUIDE } from "@/data/seoGuides";
import SavingsInputPanel from "@/components/savings/SavingsInputPanel.vue";
import SavingsResultPanel from "@/components/savings/SavingsResultPanel.vue";
import CalculatorPageHeader from "@/components/invest/CalculatorPageHeader.vue";
import { useSavingsInterestCalc } from "@/composables/useSavingsInterestCalc";
import { COOPERATIVE_DEPOSIT_SOURCE_URL, INTEREST_DATA_UPDATED } from "@/data/interestData";
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
    a: "일반과세는 15.4%입니다. 2026년 신규 조합등예탁금 일반 대상은 5.9%를 비교값으로 사용하며, 비과세 대상은 개인 요건과 가입 시점을 확인해야 합니다.",
  },
  {
    q: "세금우대 적금은 누가 가입할 수 있나요?",
    a: "조합등예탁금은 1인당 3,000만원 한도입니다. 2026년 신규 가입 일반 대상은 소득세 5% 저율분리과세가 적용되며, 농어민·소득요건 충족자는 별도 비과세 요건을 확인해야 합니다.",
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
    <CalculatorPageHeader title="적금 이자 계산기" />

    <section class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">계산 기준 안내</h2>
        <FreshBadge :message="`${INTEREST_DATA_UPDATED} 기준`" />
      </div>
      <div class="retro-panel-content space-y-2">
        <p class="text-body text-muted-foreground">월 적립액, 연이율, 기간을 입력하면 만기 수령액과 세후 이자를 바로 계산합니다.</p>
        <p class="text-tiny text-muted-foreground">일반과세(15.4%), 2026 조합 예탁금 일반 가정(5.9%), 비과세 중 선택해 세후 수령액을 비교합니다.</p>
        <p class="text-tiny text-muted-foreground">
          공식 근거:
          <a :href="COOPERATIVE_DEPOSIT_SOURCE_URL" target="_blank" rel="noopener noreferrer" class="retro-link">조세특례제한법 제89조의3</a>
        </p>
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
    <IntentRelatedLinks current-path="/savings-interest" />
    <FaqAccordionPanel :items="faqItems" />

    <SeoRichGuide
      :title="SAVINGS_INTEREST_GUIDE.title"
      :intro="SAVINGS_INTEREST_GUIDE.intro"
      :sections="SAVINGS_INTEREST_GUIDE.sections"
      :faqs="SAVINGS_INTEREST_GUIDE.faqs"
      :disclaimer="SAVINGS_INTEREST_GUIDE.disclaimer"
    />
  </div>
</template>
