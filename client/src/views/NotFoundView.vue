<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import { RouterLink } from "vue-router";
</script>

<template>
  <div class="container py-16 text-center space-y-4">
    <SEOHead
      title="404 - 페이지를 찾을 수 없습니다"
      description="요청하신 페이지를 찾을 수 없습니다."
      :noindex="true"
    />

    <h1 class="text-display font-brand text-muted-foreground">404</h1>
    <p class="text-body text-muted-foreground">페이지를 찾을 수 없습니다.</p>

    <div class="flex justify-center gap-3 pt-4">
      <RouterLink to="/crypto-tax" class="retro-button">가상자산세 계산기</RouterLink>
      <RouterLink to="/dividend-tax" class="retro-button-subtle">배당세 계산기</RouterLink>
    </div>
  </div>
</template>
