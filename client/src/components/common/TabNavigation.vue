<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import {
  ShPrimaryNavigation,
  type PrimaryNavigationItem,
} from "@shakilabs/ui";

const route = useRoute();
const tabs: readonly PrimaryNavigationItem[] = [
  { key: "crypto-tax", label: "가상자산세", to: "/crypto-tax" },
  { key: "dividend-tax", label: "배당소득세", to: "/dividend-tax" },
  { key: "isa", label: "ISA 비교", to: "/isa" },
  { key: "gift-tax", label: "증여세", to: "/gift-tax" },
];

const activeItem = computed(() =>
  tabs.find((item) => route.path.startsWith(`/${item.key}`)),
);
</script>

<template>
  <ShPrimaryNavigation
    :items="tabs"
    :active-key="activeItem?.key"
    :link-component="RouterLink"
    :mobile-columns="2"
  />
</template>
