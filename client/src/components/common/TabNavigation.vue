<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { ShPrimaryNavigation } from "@shakilabs/ui";
import { INVEST_TABS } from "@/data/investTabs";

const route = useRoute();
const tabs = INVEST_TABS;

const activeItem = computed(() =>
  tabs.find((item) => route.path.startsWith(`/${item.key}`)),
);
</script>

<template>
  <!-- 모바일(<48rem)에서는 패키지가 이 탭 줄을 숨기고 헤더 ☰가 같은 목록을 연다(0.3.38).
       ☰ 목록은 항상 DOM에 렌더되므로 크롤 경로는 끊기지 않는다. -->
  <ShPrimaryNavigation
    :items="tabs"
    :active-key="activeItem?.key"
    :link-component="RouterLink"
  />
</template>
