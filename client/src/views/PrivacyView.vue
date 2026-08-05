<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import { useConstantsStore } from "@/stores/constants";

const constantsStore = useConstantsStore();
</script>

<template>
  <SEOHead
    title="개인정보 처리방침"
    description="shakilabs.com/invest의 개인정보 처리방침입니다. 계산 입력값의 브라우저 내 처리 원칙, 쿠키와 제3자 광고(Google AdSense), 맞춤 광고 해제 방법, 이용자의 권리를 안내합니다."
  />

  <div class="container py-5">
    <div class="retro-panel">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">개인정보 처리방침</h1>
      </div>

      <div class="retro-panel-content space-y-4">
        <p class="text-body text-muted-foreground">
          shakilabs.com/invest(이하 "본 서비스")는 ShakiLabs가 운영하는 투자 세금·이자 계산
          서비스로, 이용자의 개인정보를 소중히 여기며 개인정보 보호 관련 법령을 준수합니다.
          본 방침은 본 서비스가 어떤 정보를 어떻게 처리하는지, 이용자가 어떤 권리를 어떻게
          행사할 수 있는지를 안내합니다.
        </p>

        <h2 class="text-heading font-bold">1. 수집하지 않는 정보 — 계산 입력값</h2>
        <p class="text-body text-muted-foreground">
          본 서비스는 회원가입·로그인 기능이 없으며 이름, 연락처, 주민등록번호 등 개인 식별
          정보를 직접 수집하지 않습니다. 이용자가 계산기에 입력하는 투자 원금, 월 적립금,
          수익률, 배당금, 양도차익, 증여·상속 재산가액 등의 값은 전부 이용자의 브라우저(기기)
          안에서만 계산되며, 운영자 서버로 전송되거나 저장되지 않습니다. 민감할 수 있는 자산
          정보가 기기 밖으로 나가지 않는 구조이므로 안심하고 이용할 수 있습니다.
        </p>

        <h2 class="text-heading font-bold">2. 자동으로 수집되는 정보와 쿠키</h2>
        <p class="text-body text-muted-foreground">
          서비스 개선을 위해 Google Analytics를 사용하며, 방문 페이지, 체류 시간, 유입 경로,
          브라우저 종류 등 개인을 직접 식별할 수 없는 통계 정보가 수집될 수 있습니다. 쿠키는
          웹사이트가 브라우저에 저장하는 작은 텍스트 파일로, 이용자는 브라우저 설정에서 쿠키
          저장을 거부하거나 저장된 쿠키를 삭제할 수 있습니다. 쿠키를 차단해도 계산기 이용에는
          제한이 없습니다. Google의 데이터 처리에 대한 자세한 내용은
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" class="retro-link">
            Google 개인정보 처리방침</a>을 참조하세요.
        </p>

        <h2 class="text-heading font-bold">3. 제3자 광고 쿠키와 맞춤 광고 (Google AdSense)</h2>
        <p class="text-body text-muted-foreground">
          본 서비스는 무료 운영을 위해 Google AdSense를 통한 광고를 게재합니다. 광고 게재와
          관련해 다음 사항을 알려드립니다.
        </p>
        <ul class="text-body text-muted-foreground space-y-1 list-disc list-inside">
          <li>
            Google을 포함한 제3자 광고 사업자는 쿠키를 사용하여 이용자의 본 서비스 또는 다른
            웹사이트 방문 기록을 기반으로 광고를 게재합니다.
          </li>
          <li>
            Google은 광고 쿠키를 사용하여 이용자의 관심사에 맞춘 맞춤 광고를 표시할 수 있습니다.
          </li>
          <li>
            이용자는
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" class="retro-link">Google 광고 설정</a>에서
            맞춤 광고를 해제할 수 있으며,
            <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer" class="retro-link">www.aboutads.info/choices</a>를
            방문하여 다른 제3자 광고 사업자의 맞춤 광고 쿠키도 일괄 거부할 수 있습니다.
          </li>
        </ul>
        <p class="text-body text-muted-foreground">
          맞춤 광고를 해제하더라도 광고 자체는 계속 표시될 수 있으며, 이 경우 관심사와 무관한
          일반 광고가 게재됩니다.
        </p>

        <h2 class="text-heading font-bold">4. 개인정보의 제3자 제공</h2>
        <p class="text-body text-muted-foreground">
          운영자는 이용자의 개인정보를 제3자에게 판매하거나 임의로 제공하지 않습니다. 다만 위에서
          안내한 분석·광고 도구가 쿠키를 통해 수집하는 정보는 각 사업자의 개인정보 처리방침에
          따라 처리되며, 법령에 근거한 적법한 요청이 있는 경우에 한해 관련 정보가 제공될 수
          있습니다.
        </p>

        <h2 class="text-heading font-bold">5. 개인정보 보유 및 파기</h2>
        <p class="text-body text-muted-foreground">
          본 서비스는 별도의 개인정보를 수집·저장하지 않으므로 자체 보유·파기 대상이 없습니다.
          Google Analytics 및 AdSense를 통해 수집되는 비식별 데이터는 각 서비스의 보존 정책에
          따라 처리·파기됩니다.
        </p>

        <h2 class="text-heading font-bold">6. 이용자의 권리</h2>
        <ul class="text-body text-muted-foreground space-y-1 list-disc list-inside">
          <li>브라우저 설정에서 쿠키를 차단하거나 삭제할 수 있습니다.</li>
          <li>위 3항의 링크에서 맞춤 광고를 언제든지 해제할 수 있습니다.</li>
          <li>Google Analytics 수집을 원하지 않는 경우
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" class="retro-link">Google Analytics 차단 브라우저 부가기능</a>을
            설치할 수 있습니다.
          </li>
          <li>개인정보 관련 열람·정정·삭제를 요청하려면 아래 연락처로 문의해 주세요. 확인 가능한
            범위에서 지체 없이 처리합니다.</li>
        </ul>

        <h2 class="text-heading font-bold">7. 방침 변경 고지</h2>
        <p class="text-body text-muted-foreground">
          본 개인정보 처리방침이 변경되는 경우, 변경 사항을 본 페이지에 게시하며 시행일을
          갱신합니다.
        </p>

        <h2 class="text-heading font-bold">8. 개인정보 보호책임 및 문의</h2>
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
