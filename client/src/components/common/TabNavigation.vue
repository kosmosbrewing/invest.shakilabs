<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { ShPrimaryNavigation, type PrimaryNavigationItem } from "@shakilabs/ui";
import { INVEST_TABS, INVEST_MOBILE_DEFAULT_KEYS } from "@/data/investTabs";

const route = useRoute();
const tabs = INVEST_TABS;

const activeItem = computed(() =>
  tabs.find((item) => route.path.startsWith(`/${item.key}`)),
);

const mobileItems = computed(() => {
  const keys: string[] = [...INVEST_MOBILE_DEFAULT_KEYS];

  if (activeItem.value && !keys.includes(activeItem.value.key)) {
    keys[3] = activeItem.value.key;
  }

  return keys
    .map((key) => tabs.find((item) => item.key === key))
    .filter((item): item is PrimaryNavigationItem => Boolean(item));
});
</script>

<template>
  <!-- 모바일(<48rem)은 헤더의 좌측 드로어가 대신한다(v3 §3.3-1) — 링크는
       AppHeader의 nav-items(INVEST_TABS, 같은 출처)로 드로어에 그대로 렌더되어
       크롤 경로는 유지된다. -->
  <ShPrimaryNavigation
    class="invest-secondary-nav"
    :items="tabs"
    :mobile-items="mobileItems"
    :active-key="activeItem?.key"
    :link-component="RouterLink"
    :mobile-columns="2"
  />
</template>

<style scoped>
@media (max-width: 47.99rem) {
  .invest-secondary-nav {
    display: none;
  }
}
</style>
