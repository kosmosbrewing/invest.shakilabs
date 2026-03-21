<script setup lang="ts">
import { computed } from "vue";
import { useRoute, RouterLink } from "vue-router";

const route = useRoute();

const tabs = [
  { key: "crypto-tax", label: "가상자산세", to: "/crypto-tax" },
  { key: "dividend-tax", label: "배당소득세", to: "/dividend-tax" },
  { key: "isa", label: "ISA 비교", to: "/isa" },
  { key: "gift-tax", label: "증여세", to: "/gift-tax" },
] as const;

const activePath = computed(() => route.path);

function isActiveTab(key: (typeof tabs)[number]["key"]): boolean {
  return activePath.value.startsWith(`/${key}`);
}
</script>

<template>
  <nav class="sticky top-0 z-50 border-b border-primary/20 bg-primary shadow-sm" aria-label="주요 메뉴">
    <div class="container">
      <div class="flex h-12 items-center gap-2">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.key"
          :to="tab.to"
          :aria-current="isActiveTab(tab.key) ? 'page' : undefined"
          :class="[
            'touch-target relative inline-flex h-12 shrink-0 items-center justify-center px-3 text-center text-[0.82rem] font-semibold leading-tight transition-all duration-200 sm:text-body',
            isActiveTab(tab.key)
              ? 'text-primary-foreground'
              : 'text-primary-foreground/70 hover:text-primary-foreground/90',
          ]"
        >
          <span class="break-keep">{{ tab.label }}</span>
          <span
            v-if="isActiveTab(tab.key)"
            class="absolute inset-x-1 bottom-0 h-[3px] rounded-full bg-white"
          />
        </RouterLink>
      </div>
    </div>
  </nav>
</template>
