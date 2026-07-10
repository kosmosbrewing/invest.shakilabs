<script setup lang="ts">
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import RelatedCalculatorLinks from "@/components/common/RelatedCalculatorLinks.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import DepositInputPanel from "@/components/deposit/DepositInputPanel.vue";
import DepositResultPanel from "@/components/deposit/DepositResultPanel.vue";
import { useDepositInterestCalc } from "@/composables/useDepositInterestCalc";
import {
  COOPERATIVE_DEPOSIT_SOURCE_URL,
  DEPOSIT_PROTECTION_SOURCE_URL,
  INTEREST_DATA_UPDATED,
} from "@/data/interestData";
import { formatManWon } from "@/lib/utils";
import { computed } from "vue";

const props = defineProps<{ initialPrincipalMan?: number }>();
const amountLabel = computed(() =>
  props.initialPrincipalMan ? formatManWon(props.initialPrincipalMan * 10_000) : null,
);
const seoTitle = computed(() =>
  amountLabel.value
    ? `${amountLabel.value} 예금 이자 계산기 | 만기 수령액 시뮬레이션`
    : "2026 예금 이자 계산기 | 정기예금 만기·세후 이자 계산",
);
const seoDesc = computed(() =>
  amountLabel.value
    ? `${amountLabel.value} 예금 시 만기 수령액과 세후 이자를 계산합니다.`
    : "예금 원금, 이율, 기간을 입력하면 만기 수령액과 세후 이자를 바로 확인합니다. 만기일시/월이자 방식 비교.",
);

const calc = useDepositInterestCalc(props.initialPrincipalMan);

const faqItems = [
  {
    q: "만기일시지급과 월이자지급의 차이는 무엇인가요?",
    a: "만기일시지급은 만기에 원금+이자를 한번에 받고, 월이자지급은 매월 이자를 받고 만기에 원금만 돌려받습니다. 월이자를 재투자하지 않으면 총 수령액은 비슷합니다.",
  },
  {
    q: "예금자 보호는 얼마까지 되나요?",
    a: "2025년 9월 1일부터 금융기관별 1인당 원금과 이자를 합해 1억원까지 보호됩니다. 보호 대상 상품 여부는 금융회사 표시를 확인해야 합니다.",
  },
  {
    q: "정기예금과 적금의 이자 차이는?",
    a: "같은 금리라면 정기예금이 이자가 더 많습니다. 적금은 매월 조금씩 넣으므로 실제 예치 기간이 짧아 이자가 적습니다.",
  },
  {
    q: "이자소득세율은 얼마인가요?",
    a: "일반과세는 15.4%입니다. 2026년 신규 조합등예탁금의 일반 대상은 소득세 5%와 농어촌특별세를 합한 5.9%를 비교값으로 사용합니다. 농어민·소득요건 충족자와 기존 가입자는 적용 방식이 다를 수 있습니다.",
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
        <h1 class="retro-title">예금 이자 계산기</h1>
        <FreshBadge :message="`${INTEREST_DATA_UPDATED} 기준`" />
      </div>
      <div class="retro-panel-content space-y-2">
        <p class="text-body text-muted-foreground">예금 원금, 이율, 기간을 입력하면 세후 이자와 만기 수령액을 계산합니다.</p>
        <p class="text-tiny text-muted-foreground">만기일시지급과 월이자지급 방식을 선택해 비교할 수 있습니다.</p>
        <p class="flex flex-wrap gap-x-2 text-tiny text-muted-foreground">
          <span>공식 근거:</span>
          <a :href="COOPERATIVE_DEPOSIT_SOURCE_URL" target="_blank" rel="noopener noreferrer" class="retro-link">조세특례제한법 제89조의3</a>
          <a :href="DEPOSIT_PROTECTION_SOURCE_URL" target="_blank" rel="noopener noreferrer" class="retro-link">금융위원회 예금보호한도</a>
        </p>
      </div>
    </section>

    <DepositInputPanel
      :principal="calc.principal.value"
      :months="calc.months.value"
      :annual-rate="calc.annualRate.value"
      :tax-type="calc.taxType.value"
      :payment-type="calc.paymentType.value"
      @update:principal="calc.principal.value = $event"
      @update:months="calc.months.value = $event"
      @update:annual-rate="calc.annualRate.value = $event"
      @update:tax-type="calc.taxType.value = $event"
      @update:payment-type="calc.paymentType.value = $event"
    />

    <DepositResultPanel :result="calc.result.value" :payment-type="calc.paymentType.value" />
    <RelatedCalculatorLinks current-path="/deposit-interest" />
    <FaqAccordionPanel :items="faqItems" />
  </div>
</template>
