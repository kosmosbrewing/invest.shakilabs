<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import { RouterLink } from "vue-router";
import { buttonVariants } from "@/components/ui/button";
import { useConstantsStore } from "@/stores/constants";
// 데이터 기준일은 각 계산기가 실제로 쓰는 상수에서 파생시킨다 (수동 표기 시 구식화)
import { CRYPTO_TAX_EFFECTIVE_DATE } from "@/data/investTaxRates";
import { INTEREST_DATA_UPDATED } from "@/data/interestData";
import { FOREIGN_STOCK_TAX_UPDATED } from "@/data/foreignStockTax";

const constantsStore = useConstantsStore();
</script>

<template>
  <SEOHead
    title="서비스 안내"
    description="shakilabs.com/invest는 배당소득세, 가상자산세, ISA 만기 비교, 증여세를 빠르게 계산하는 투자 세금 계산기입니다."
  />

  <div class="container py-5 space-y-5">
    <div class="retro-panel">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">서비스 안내</h1>
      </div>

      <div class="retro-panel-content space-y-4">
        <h2 class="text-heading font-bold">투자 세금 계산기</h2>
        <p class="text-body text-muted-foreground">
          shakilabs.com/invest는 투자 수익에 관련된 세금을 빠르게 계산하는 무료 도구입니다.
          배당소득세, 가상자산 양도소득세, ISA 만기 세후 비교, 증여세를 한곳에서
          시뮬레이션하여 투자 의사결정에 도움을 드립니다.
        </p>

        <h2 class="text-heading font-bold">계산기 9종</h2>
        <ul class="about-feature-list text-body text-muted-foreground space-y-1 list-disc list-inside">
          <li>
            <RouterLink to="/dividend-tax" class="retro-link">배당소득세</RouterLink>
            — 국내 배당 15.4% 원천징수, 해외 배당은 현지 원천징수분을 차감한 뒤 차액만 추가 반영합니다.
            금융소득 2,000만원 초과 시 종합과세 구간으로 자동 전환합니다.
          </li>
          <li>
            <RouterLink to="/crypto-tax" class="retro-link">가상자산 세금</RouterLink>
            — 2027년 1월 1일 이후 양도분 예정 기준. 기본공제 250만원 차감 후 22%(소득세 20% + 지방소득세 2%).
          </li>
          <li>
            <RouterLink to="/foreign-stock-tax" class="retro-link">해외주식 양도소득세</RouterLink>
            — 연간 양도차익에서 기본공제 250만원을 뺀 금액에 22% 적용. 국가와 무관하게 세율은 동일합니다.
          </li>
          <li>
            <RouterLink to="/isa" class="retro-link">ISA 만기 세후 비교</RouterLink>
            — 일반형 비과세 200만원 / 서민형 400만원, 초과분 9.9% 분리과세를 일반계좌 15.4%와 대조합니다.
          </li>
          <li>
            <RouterLink to="/gift-tax" class="retro-link">증여세</RouterLink>
            — 배우자 6억, 성년 자녀·직계존속 5천만, 미성년 자녀 2천만, 기타 친족 1천만원의 10년 합산 공제를 반영합니다.
          </li>
          <li>
            <RouterLink to="/inheritance-tax" class="retro-link">상속세</RouterLink>
            — 일괄공제 5억과 기초공제 2억 중 유리한 쪽, 배우자공제(최소 5억~최대 30억), 금융재산공제, 장례비를 반영합니다.
          </li>
          <li>
            <RouterLink to="/savings-interest" class="retro-link">적금 이자</RouterLink>
            ·
            <RouterLink to="/deposit-interest" class="retro-link">예금 이자</RouterLink>
            — 만기일시지급·월이자지급을 구분하고, 일반과세 15.4% / 조합 예탁금 / 비과세 세 가지 과세 유형을 지원합니다.
          </li>
          <li>
            <RouterLink to="/compound-interest" class="retro-link">복리</RouterLink>
            — 단리 대비 최종 금액 차이와 72법칙 기준 원금 2배 도달 시점을 함께 보여줍니다.
          </li>
        </ul>

        <h2 class="text-heading font-bold">데이터 기준</h2>
        <ul class="text-body text-muted-foreground space-y-1 list-disc list-inside">
          <li>투자 세율·공제 기준(배당·가상자산·ISA): {{ constantsStore.feeDataUpdated }} 기준</li>
          <li>이자·증여 기준(적금·예금·복리·증여세·상속세): {{ INTEREST_DATA_UPDATED }} 기준</li>
          <li>해외주식 양도소득세 기준: {{ FOREIGN_STOCK_TAX_UPDATED }} 기준</li>
          <li>가상자산 과세: {{ CRYPTO_TAX_EFFECTIVE_DATE }} 시행 예정 기준 (시행 시점에 따라 변경 가능)</li>
        </ul>
        <p class="text-body text-muted-foreground">
          세법 개정, 공제 한도 변경 등은 시점에 따라 달라질 수 있습니다.
          본 서비스는 빠른 의사결정을 돕기 위한 참고용 도구이며, 정확한 세액은 세무 전문가 상담을 권장합니다.
        </p>

        <h2 class="text-heading font-bold">계산 범위와 한계</h2>
        <p class="text-body text-muted-foreground">
          계산기가 무엇을 반영하지 않는지 먼저 밝히는 편이 오차를 줄인다고 보고, 알려진 한계를 그대로 공개합니다.
        </p>
        <ul class="text-body text-muted-foreground space-y-1 list-disc list-inside">
          <li>
            증여세 — 혼인·출산 전후 2년 이내 직계존속 증여에 적용될 수 있는 추가 공제(통합 한도 1억원)는
            자동 반영하지 않습니다. 해당자는 신고 전 별도로 확인해야 합니다.
          </li>
          <li>
            상속세 — 장례비는 실제 지출액 입력 기능이 없어 법정 최소 공제액 500만원을 고정 반영합니다.
            봉안시설·자연장지 비용은 별도 한도로 추가될 수 있습니다.
          </li>
          <li>
            해외주식 — 매수·매도 각각의 결제일 매매기준율을 자동으로 가져오지 않습니다.
            원화로 환산한 금액을 직접 입력하는 방식이며, 현지 원천징수분의 외국납부세액공제도 별도 확인이 필요합니다.
          </li>
          <li>
            가상자산 — 시행 전 제도라 예정 기준 시뮬레이션입니다. 실제 시행 시점과 세부 규정은 달라질 수 있습니다.
          </li>
          <li>
            공통 — 입력값은 브라우저 안에서만 계산되며 서버로 전송하거나 저장하지 않습니다.
          </li>
        </ul>

        <h2 class="text-heading font-bold">검증 방법</h2>
        <p class="text-body text-muted-foreground">
          모든 세율·공제·이자 계산 기준은 국세청, 국가법령정보센터(소득세법·상속세 및 증여세법·조세특례제한법 등),
          홈택스 등 공공 기관이 공개한 자료를 기준으로 교차 검증합니다. 법령이나 공제 한도가
          개정되면 확인 즉시 계산 로직에 반영하고, 각 계산기에 데이터 기준일을 함께 표기합니다.
        </p>

        <h2 class="text-heading font-bold">운영자 정보</h2>
        <p class="text-body text-muted-foreground">
          운영: ShakiLabs · 문의:
          <a :href="`mailto:${constantsStore.supportEmail}`" class="retro-link">{{ constantsStore.supportEmail }}</a>
        </p>
        <p class="text-body text-muted-foreground">
          오류 제보나 데이터 수정 요청, 기능 건의도 같은 주소로 보내주시면 확인 후 반영합니다.
        </p>
      </div>
    </div>

    <div class="text-center">
      <RouterLink :class="buttonVariants({ variant: 'default' })" to="/crypto-tax">
        세금 계산하기
      </RouterLink>
    </div>
  </div>
</template>
