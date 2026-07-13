<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import {
  ShPrimaryNavigation,
  type PrimaryNavigationItem,
} from "@shakilabs/ui";

const route = useRoute();
const tabs: readonly PrimaryNavigationItem[] = [
  { key: "all", label: "투자 도구", to: "/all" },
  { key: "crypto-tax", label: "가상자산세", to: "/crypto-tax" },
  { key: "dividend-tax", label: "배당소득세", to: "/dividend-tax" },
  { key: "isa", label: "ISA 비교", to: "/isa" },
  { key: "gift-tax", label: "증여세", to: "/gift-tax" },
];

const mobileDefaultKeys = ["all", "crypto-tax", "dividend-tax", "isa"] as const;

const activeItem = computed(() =>
  tabs.find((item) => route.path.startsWith(`/${item.key}`)),
);

const mobileItems = computed(() => {
  const keys: string[] = [...mobileDefaultKeys];

  if (activeItem.value && !keys.includes(activeItem.value.key)) {
    keys[3] = activeItem.value.key;
  }

  return keys
    .map((key) => tabs.find((item) => item.key === key))
    .filter((item): item is PrimaryNavigationItem => Boolean(item));
});
</script>

<template>
  <ShPrimaryNavigation
    :items="tabs"
    :mobile-items="mobileItems"
    :active-key="activeItem?.key"
    :link-component="RouterLink"
    :mobile-columns="2"
  />
</template>
