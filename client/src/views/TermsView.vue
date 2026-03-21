<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import { useConstantsStore } from "@/stores/constants";

const constantsStore = useConstantsStore();
</script>

<template>
  <SEOHead
    title="이용약관"
    description="shakilabs.com/invest의 서비스 이용약관입니다."
  />

  <div class="container py-5">
    <div class="retro-panel">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">이용약관</h1>
      </div>

      <div class="retro-panel-content space-y-4">
        <p class="text-body text-muted-foreground">
          shakilabs.com/invest(이하 "본 서비스")을 이용해 주셔서 감사합니다.
          본 서비스를 이용함으로써 아래 약관에 동의하게 됩니다.
        </p>

        <h2 class="text-heading font-bold">1. 서비스 개요</h2>
        <p class="text-body text-muted-foreground">
          본 서비스는 투자 관련 세금을 계산하는 무료 도구입니다.
          회원가입 없이 누구나 이용할 수 있으며, 배당소득세, 가상자산세,
          ISA 만기 비교, 증여세 계산 기능을 제공합니다.
        </p>

        <h2 class="text-heading font-bold">2. 면책 조항</h2>
        <ul class="text-body text-muted-foreground space-y-1 list-disc list-inside">
          <li>
            본 서비스의 계산 결과는 참고용 추정치이며, 실제 납부 세액과 차이가 있을 수 있습니다.
          </li>
          <li>
            세율과 공제 기준은 현행 세법 및 예정 개정안을 기반으로 하지만, 법령 변경 사항이 즉시 반영되지
            않을 수 있습니다.
          </li>
          <li>
            본 서비스의 계산 결과를 근거로 한 투자·세무 결정에 대해
            서비스 운영자는 책임을 지지 않습니다.
          </li>
          <li>
            개인별 소득 구간, 기타 공제 항목, 지방세 특례 등은 계산에 포함되지 않을 수 있습니다.
          </li>
        </ul>

        <h2 class="text-heading font-bold">3. 지식재산권</h2>
        <p class="text-body text-muted-foreground">
          본 서비스의 디자인, 코드, 콘텐츠에 대한 저작권은 서비스 운영자에게 있습니다.
          계산 결과의 공유·인용은 자유롭게 가능하나, 서비스 자체의 복제·재배포는 금지합니다.
        </p>

        <h2 class="text-heading font-bold">4. 광고</h2>
        <p class="text-body text-muted-foreground">
          본 서비스는 Google AdSense 등을 통해 광고를 게재할 수 있습니다.
          광고 콘텐츠는 서비스 운영자가 보증하는 것이 아닙니다.
        </p>

        <h2 class="text-heading font-bold">5. 서비스 변경 및 중단</h2>
        <p class="text-body text-muted-foreground">
          서비스 운영자는 사전 고지 없이 서비스의 기능을 변경하거나 중단할 수 있습니다.
          무료 서비스 특성상, 서비스 중단에 따른 별도 보상은 제공되지 않습니다.
        </p>

        <h2 class="text-heading font-bold">6. 약관 변경</h2>
        <p class="text-body text-muted-foreground">
          본 약관은 필요 시 변경될 수 있으며, 변경된 약관은 본 페이지에 게시하는 것으로 효력이 발생합니다.
        </p>

        <h2 class="text-heading font-bold">7. 문의</h2>
        <p class="text-body text-muted-foreground">
          이용약관 관련 문의:
          <a :href="`mailto:${constantsStore.supportEmail}`" class="retro-link">
            {{ constantsStore.supportEmail }}
          </a>
        </p>

        <p class="text-tiny text-muted-foreground mt-6">
          시행일: 2026년 3월 19일
        </p>
      </div>
    </div>
  </div>
</template>
