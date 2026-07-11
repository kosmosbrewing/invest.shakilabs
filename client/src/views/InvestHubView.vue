<script setup lang="ts">
import { ArrowRight } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { ShSurface, ShText } from "@shakilabs/ui";
import SEOHead from "@/components/common/SEOHead.vue";
import { INVEST_TOOL_GROUPS } from "@/data/investNavigation";
</script>

<template>
  <SEOHead
    title="투자 계산기 전체 보기 | 목적별 9개 금융·세금 도구"
    description="저축·자산 성장, 투자 세금, 증여·상속 목적별로 필요한 계산기를 빠르게 찾으세요."
  />
  <div class="container space-y-5 py-5">
    <ShSurface padding="lg">
      <ShText as="p" variant="caption" tone="muted">INVEST TOOL DIRECTORY</ShText>
      <ShText as="h1" variant="display" class="mt-2">목적부터 고르면 계산기가 선명해집니다</ShText>
      <ShText tone="muted" class="mt-3 max-w-3xl">
        세후 수익, 투자 과세, 자산 이전 중 지금 내 결정과 가까운 묶음에서 시작하세요.
      </ShText>
    </ShSurface>

    <section v-for="group in INVEST_TOOL_GROUPS" :key="group.key" :aria-labelledby="`${group.key}-title`">
      <div class="mb-3">
        <ShText :id="`${group.key}-title`" as="h2" variant="heading">{{ group.title }}</ShText>
        <ShText variant="caption" tone="muted" class="mt-1">{{ group.description }}</ShText>
      </div>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink v-for="tool in group.tools" :key="tool.path" :to="tool.path" class="block no-underline">
          <ShSurface variant="outlined" padding="md" class="group flex h-full flex-col hover:border-primary">
            <ShText as="h3" variant="heading">{{ tool.title }}</ShText>
            <ShText variant="caption" tone="muted" class="mt-2 flex-1">{{ tool.description }}</ShText>
            <span class="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-primary">
              계산 시작 <ArrowRight class="h-4 w-4" aria-hidden="true" />
            </span>
          </ShSurface>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
