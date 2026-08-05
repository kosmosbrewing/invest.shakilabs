<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import { RouterLink } from "vue-router";
import { buttonVariants } from "@/components/ui/button";
import { useConstantsStore } from "@/stores/constants";

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

        <h2 class="text-heading font-bold">주요 기능</h2>
        <ul class="about-feature-list text-body text-muted-foreground space-y-1 list-disc list-inside">
          <li>배당소득세 계산 — 금융소득 종합과세 기준 포함</li>
          <li>가상자산 세금 시뮬레이터 — 2027년 예정 과세 기준</li>
          <li>ISA 만기 세후 비교 — 일반계좌 대비 절세 효과 확인</li>
          <li>증여세 계산기 — 증여공제·세율 구간별 자동 계산</li>
        </ul>

        <h2 class="text-heading font-bold">데이터 기준</h2>
        <ul class="text-body text-muted-foreground space-y-1 list-disc list-inside">
          <li>세율·공제 기준: {{ constantsStore.feeDataUpdated }} 기준</li>
          <li>가상자산 과세: 2027년 시행 예정 기준 (시행 시점에 따라 변경 가능)</li>
          <li>ISA 비과세 한도: 현행 세법 기준</li>
        </ul>
        <p class="text-body text-muted-foreground">
          세법 개정, 공제 한도 변경 등은 시점에 따라 달라질 수 있습니다.
          본 서비스는 빠른 의사결정을 돕기 위한 참고용 도구이며, 정확한 세액은 세무 전문가 상담을 권장합니다.
        </p>

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
