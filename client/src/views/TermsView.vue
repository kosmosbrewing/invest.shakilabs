<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import { useConstantsStore } from "@/stores/constants";

const constantsStore = useConstantsStore();
</script>

<template>
  <SEOHead
    title="이용약관"
    description="shakilabs.com/invest의 서비스 이용약관입니다. 서비스 성격, 정보 제공의 한계(투자·세무 자문 아님), 광고 게재, 면책 조항과 준거법을 안내합니다."
  />

  <div class="container py-5">
    <div class="retro-panel">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">이용약관</h1>
      </div>

      <div class="retro-panel-content space-y-4">
        <h2 class="text-heading font-bold">1. 목적</h2>
        <p class="text-body text-muted-foreground">
          본 약관은 ShakiLabs가 운영하는 shakilabs.com/invest(이하 "본 서비스")의 이용 조건과
          운영자·이용자의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다. 이용자가 본
          서비스를 이용하는 경우 본 약관에 동의한 것으로 봅니다.
        </p>

        <h2 class="text-heading font-bold">2. 서비스의 성격</h2>
        <p class="text-body text-muted-foreground">
          본 서비스는 배당소득세, 가상자산 과세, 해외주식 양도소득세, ISA 절세 효과, 증여세·상속세,
          예금·적금·복리 이자를 추정하고 비교할 수 있도록 돕는 무료 참고용 계산 도구입니다. 모든
          계산은 이용자가 입력한 값과 공개된 세율·공제 기준을 근거로 이용자의 브라우저 안에서
          수행되며, 운영자는 입력값을 서버에 저장하지 않습니다. 각 계산기에는 적용한 세율과 데이터
          기준일이 함께 표기되므로 이용자는 계산 근거를 직접 확인하면서 결과를 해석할 수 있습니다.
        </p>

        <h2 class="text-heading font-bold">3. 정보 제공의 한계 — 투자·세무 자문이 아님</h2>
        <p class="text-body text-muted-foreground">
          본 서비스가 제공하는 계산 결과와 가이드 콘텐츠는 일반적인 정보 제공 목적의 참고용
          추정치입니다. 본 서비스는 자본시장법상 투자자문·투자일임, 금융소비자보호법상 금융상품
          자문·판매·중개, 세무사법상 세무 대리 서비스가 아니며, 특정 금융상품의 매수·매도나 특정
          절세 방안을 권유하지 않습니다. 실제 세액과 투자 손익은 개인별 소득 구간, 보유 기간,
          법령 개정에 따라 달라지므로, 투자·증여·상속 등 실제 의사결정 전에는 반드시 세무사 등
          자격을 갖춘 전문가 또는 국세청 등 관계기관의 확인을 거쳐야 합니다.
        </p>

        <h2 class="text-heading font-bold">4. 광고 게재</h2>
        <p class="text-body text-muted-foreground">
          본 서비스는 무료 운영 재원을 마련하기 위해 Google AdSense 등 제3자 광고 플랫폼이
          제공하는 광고를 게재할 수 있습니다. 광고의 내용은 광고 플랫폼과 광고주가 결정하며,
          운영자는 개별 광고의 내용을 사전에 선택하거나 보증하지 않습니다. 이용자가 광고를 통해
          접한 상품·서비스와 관련하여 광고주와 거래하는 경우 해당 거래의 당사자는 이용자와
          광고주이며, 운영자는 그 거래에 개입하지 않고 이로 인한 손해에 대해 책임을 지지 않습니다.
          광고 쿠키의 사용과 맞춤 광고 해제 방법은 개인정보 처리방침에서 안내합니다.
        </p>

        <h2 class="text-heading font-bold">5. 면책 조항</h2>
        <ul class="text-body text-muted-foreground space-y-1 list-disc list-inside">
          <li>
            계산 결과는 참고용 추정치이며, 실제 납부 세액·수령 이자와 차이가 있을 수 있습니다.
          </li>
          <li>
            세율과 공제 기준은 현행 세법 및 예정 개정안을 기반으로 하지만, 법령 변경 사항이 즉시
            반영되지 않을 수 있습니다. 특히 가상자산 과세는 시행 전 예정 기준입니다.
          </li>
          <li>
            개인별 소득 구간, 기타 공제 항목, 지방세 특례 등은 계산에 포함되지 않을 수 있습니다.
          </li>
          <li>
            본 서비스의 계산 결과를 근거로 한 투자·세무 의사결정과 그 결과에 대한 책임은
            이용자에게 있으며, 운영자는 고의 또는 중대한 과실이 없는 한 책임을 지지 않습니다.
          </li>
          <li>
            정확한 세액은 국세청·홈택스에서, 금융상품 조건은 각 금융회사에서 최종 확인해야 합니다.
          </li>
          <li>
            운영자는 천재지변, 통신 장애 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지
            않습니다.
          </li>
        </ul>

        <h2 class="text-heading font-bold">6. 지식재산권</h2>
        <p class="text-body text-muted-foreground">
          본 서비스의 디자인, 코드, 콘텐츠에 대한 저작권은 운영자에게 있습니다. 계산 결과의
          공유·인용은 출처를 표기하는 조건으로 자유롭게 할 수 있으나, 서비스 자체를 복제하거나
          상업적으로 재배포하는 행위는 금지합니다.
        </p>

        <h2 class="text-heading font-bold">7. 서비스 변경 및 중단</h2>
        <p class="text-body text-muted-foreground">
          운영자는 서비스 개선을 위해 기능을 추가·변경할 수 있으며, 불가피한 사정이 있는 경우
          사전 고지 없이 서비스의 일부 또는 전부를 중단할 수 있습니다. 무료 서비스 특성상 서비스
          중단에 따른 별도 보상은 제공되지 않습니다. 이용자는 서비스를 자동화된 수단으로 과도하게
          호출하거나 정상적인 운영을 방해하는 행위를 해서는 안 됩니다.
        </p>

        <h2 class="text-heading font-bold">8. 약관 변경과 준거법</h2>
        <p class="text-body text-muted-foreground">
          본 약관은 필요 시 변경될 수 있으며, 변경된 약관은 본 페이지에 게시하는 것으로 효력이
          발생합니다. 변경 이후 서비스를 계속 이용하는 경우 변경된 약관에 동의한 것으로 봅니다.
          본 약관은 대한민국 법령에 따라 해석됩니다.
        </p>

        <h2 class="text-heading font-bold">9. 문의</h2>
        <p class="text-body text-muted-foreground">
          운영: ShakiLabs · 문의:
          <a :href="`mailto:${constantsStore.supportEmail}`" class="retro-link">
            {{ constantsStore.supportEmail }}
          </a>
        </p>

        <p class="text-tiny text-muted-foreground mt-6">
          시행일: 2026년 3월 19일 · 최종 개정일: 2026년 8월 5일
        </p>
      </div>
    </div>
  </div>
</template>
