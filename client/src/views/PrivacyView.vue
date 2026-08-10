<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import { useConstantsStore } from "@/stores/constants";

const constantsStore = useConstantsStore();
</script>

<template>
  <SEOHead
    title="개인정보 처리방침"
    description="shakilabs.com/invest의 개인정보 처리방침입니다. 9개 투자·이자 계산기가 받는 입력 항목 전부, 주소창에 남는 금액과 남지 않는 금액, 쿠키와 제3자 광고(Google AdSense), 맞춤 광고 해제 방법을 안내합니다."
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

        <h2 class="text-heading font-bold">1. 수집하지 않는 정보 — 계산기가 받는 입력값 전부</h2>
        <p class="text-body text-muted-foreground">
          본 서비스는 회원가입·로그인 기능이 없으며 이름, 연락처, 주민등록번호 등 개인 식별
          정보를 직접 수집하지 않습니다. 투자·자산 계산기는 성격상 민감한 금액을 다루므로,
          어떤 계산기가 무엇을 입력받는지 아래에 전부 공개합니다. 이 값들은 예외 없이 이용자의
          브라우저(기기) 안에서만 계산되며 운영자 서버로 전송되거나 저장되지 않습니다.
        </p>
        <ul class="text-body text-muted-foreground space-y-1 list-disc list-inside">
          <li>가상자산 양도세 — 취득가액, 양도가액, 필요경비</li>
          <li>배당소득세 — 배당금액, 배당 지급 국가, 그 외 금융소득 합계</li>
          <li>해외주식 양도소득세 — 매도금액, 매수금액, 거래 수수료, 같은 해 다른 종목의 양도차익·양도차손</li>
          <li>ISA 만기 비교 — 연 납입액, 기대 연 수익률, 보유 연수, 계좌 유형(일반형·서민형)</li>
          <li>증여세 — 증여재산가액, 10년 내 이미 사용한 공제액, 증여자와의 관계, 세대생략 여부</li>
          <li>상속세 — 상속재산 총액, 채무, 금융재산, 배우자 유무, 자녀 수</li>
          <li>적금·예금 이자 — 월 적립액 또는 예치 원금, 기간(개월), 연이율, 과세 유형, 이자 지급 방식</li>
          <li>복리 성장 — 초기 투자금, 월 추가 납입액, 연 수익률, 투자 기간</li>
        </ul>
        <p class="text-body text-muted-foreground">
          증여세·상속세 계산기가 받는 가족 관계(배우자 유무, 자녀 수, 증여자와의 관계)는 공제
          한도를 고르기 위한 선택지일 뿐이며, 이름 등 특정인을 식별할 수 있는 항목은 입력란
          자체가 없습니다.
        </p>

        <h2 class="text-heading font-bold">2. 주소창에 남는 금액과 남지 않는 금액</h2>
        <p class="text-body text-muted-foreground">
          본 서비스에는 <code class="text-tiny">/invest/isa/1200</code>,
          <code class="text-tiny">/invest/crypto-tax/1000</code>처럼 금액이 포함된 주소가
          있습니다. 이 숫자는 운영자가 미리 정해 둔 대표 금액이며, 해당 주소로 들어오면 계산기가
          그 값으로 시작할 뿐입니다. <strong>이용자가 직접 입력한 금액은 주소창에 반영되지
          않습니다</strong> — 입력을 바꿔도 주소는 그대로이므로, 계산 결과 화면의 주소를 복사해
          공유하더라도 본인이 넣은 금액은 상대방에게 전달되지 않습니다. 방문 통계에 남는 것은
          이 고정된 대표 주소뿐입니다.
        </p>

        <h2 class="text-heading font-bold">3. 자동으로 수집되는 정보와 쿠키</h2>
        <p class="text-body text-muted-foreground">
          서비스 개선을 위해 Google Analytics를 사용하며, 방문 페이지, 체류 시간, 유입 경로,
          브라우저 종류 등 개인을 직접 식별할 수 없는 통계 정보가 수집될 수 있습니다. 계산기
          이용 통계도 함께 기록하지만, 전송되는 항목은 <strong>어떤 계산기를 썼는지(예:
          crypto-tax), 어느 주소에서 썼는지, 계산이 자동 수행됐는지</strong> 세 가지뿐입니다.
          입력한 금액이나 계산 결과값은 이 이벤트에 포함되지 않습니다. 오류 추적에는 Sentry를
          사용하며 개인 식별 정보 전송 옵션은 꺼 둔 상태로 운영합니다. 이용자가 선택한
          밝게·어둡게 화면 설정은 브라우저의 로컬 저장소에만 남고 외부로 전송되지 않습니다.
          쿠키는 웹사이트가 브라우저에 저장하는 작은 텍스트 파일로, 이용자는 브라우저 설정에서
          쿠키 저장을 거부하거나 저장된 쿠키를 삭제할 수 있습니다. 쿠키를 차단해도 계산기
          이용에는 제한이 없습니다. Google의 데이터 처리에 대한 자세한 내용은
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" class="retro-link">
            Google 개인정보 처리방침</a>을 참조하세요.
        </p>

        <h2 class="text-heading font-bold">4. 제3자 광고 쿠키와 맞춤 광고 (Google AdSense)</h2>
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

        <h2 class="text-heading font-bold">5. 개인정보의 제3자 제공</h2>
        <p class="text-body text-muted-foreground">
          운영자는 이용자의 개인정보를 제3자에게 판매하거나 임의로 제공하지 않습니다. 다만 위에서
          안내한 분석·광고 도구가 쿠키를 통해 수집하는 정보는 각 사업자의 개인정보 처리방침에
          따라 처리되며, 법령에 근거한 적법한 요청이 있는 경우에 한해 관련 정보가 제공될 수
          있습니다.
        </p>

        <h2 class="text-heading font-bold">6. 개인정보 보유 및 파기</h2>
        <p class="text-body text-muted-foreground">
          본 서비스는 별도의 개인정보를 수집·저장하지 않으므로 자체 보유·파기 대상이 없습니다.
          1항에 열거한 계산 입력값은 애초에 서버로 오지 않으며, 페이지를 새로고침하거나 닫으면
          브라우저 메모리에서 사라집니다. 따라서 "지난번에 넣은 상속재산 금액을 지워 달라"는
          요청은 응할 대상 자체가 없습니다. Google Analytics 및 AdSense를 통해 수집되는
          비식별 데이터는 각 서비스의 보존 정책에 따라 처리·파기됩니다.
        </p>

        <h2 class="text-heading font-bold">7. 이용자의 권리</h2>
        <ul class="text-body text-muted-foreground space-y-1 list-disc list-inside">
          <li>브라우저 설정에서 쿠키를 차단하거나 삭제할 수 있습니다.</li>
          <li>위 4항의 링크에서 맞춤 광고를 언제든지 해제할 수 있습니다.</li>
          <li>Google Analytics 수집을 원하지 않는 경우
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" class="retro-link">Google Analytics 차단 브라우저 부가기능</a>을
            설치할 수 있습니다.
          </li>
          <li>개인정보 관련 열람·정정·삭제를 요청하려면 아래 연락처로 문의해 주세요. 확인 가능한
            범위에서 지체 없이 처리합니다.</li>
        </ul>

        <h2 class="text-heading font-bold">8. 방침 변경 고지</h2>
        <p class="text-body text-muted-foreground">
          본 개인정보 처리방침이 변경되는 경우, 변경 사항을 본 페이지에 게시하며 시행일을
          갱신합니다.
        </p>

        <h2 class="text-heading font-bold">9. 개인정보 보호책임 및 문의</h2>
        <p class="text-body text-muted-foreground">
          운영: ShakiLabs · 문의:
          <a :href="`mailto:${constantsStore.supportEmail}`" class="retro-link">
            {{ constantsStore.supportEmail }}
          </a>
        </p>

        <p class="text-tiny text-muted-foreground mt-6">
          시행일: 2026년 3월 19일 · 최종 개정일: 2026년 8월 10일
        </p>
      </div>
    </div>
  </div>
</template>
