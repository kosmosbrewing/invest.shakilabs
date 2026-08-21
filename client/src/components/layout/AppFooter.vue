<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { ShSiteFooter } from "@shakilabs/ui";
import { FOOTER_ALL_LINK, FOOTER_SECTIONS } from "@/data/footerNav";
import { useConstantsStore } from "@/stores/constants";

const constantsStore = useConstantsStore();
const year = new Date().getFullYear();
const SUPPORT_EMAIL = constantsStore.supportEmail;

const policyLinks = [
  { to: "/about", label: "사이트 안내" },
  { to: "/terms", label: "이용약관" },
  { to: "/privacy", label: "개인정보 처리방침" },
  // 블로그는 root 소유(shakilabs.com/blog)라 앱 라우터 밖이다 — href를 주어
  // RouterLink 대신 <a href>로 나가게 한다(RouterLink면 /invest/blog로 깨진다).
  { to: "", href: "/blog", label: "블로그" },
  { to: "", href: `mailto:${SUPPORT_EMAIL}`, label: "문의" },
];

const note = computed(() => "본 계산 결과는 참고용 추정치이며, 실제 납부액과 다를 수 있습니다.");
</script>

<template>
  <ShSiteFooter
    app="invest"
    :sections="FOOTER_SECTIONS"
    :all-link="FOOTER_ALL_LINK"
    :policy-links="policyLinks"
    :note="note"
    site-label="shakilabs.com/invest"
    :copyright="`Copyright © ${year} shakilabs.com`"
    :link-component="RouterLink"
  />
</template>
