<script setup lang="ts">
import type { Component } from "vue";
import { ArrowRight, Calculator } from "lucide-vue-next";

type RelatedServiceItem = {
  title: string;
  description: string;
  href: string;
  icon: Component;
};

const items: RelatedServiceItem[] = [
  {
    title: "종합소득세 계산",
    description: "배당·기타 투자수익과 함께 종합과세 구간까지 미리 점검합니다.",
    href: "https://finance.shakilabs.com/comprehensive-tax",
    icon: Calculator,
  },
];
</script>

<template>
  <section class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">관련 서비스</h2>
    </div>
    <div class="retro-panel-content space-y-4">
      <p class="text-caption leading-relaxed text-muted-foreground">
        투자 세금을 계산했다면 금융소득과 합산될 수 있는 세금 구간도 함께 확인해 보세요.
      </p>
      <div class="grid gap-3 sm:grid-cols-2">
        <a
          v-for="item in items"
          :key="item.href"
          :href="item.href"
          class="group flex flex-col rounded-[1.6rem] border border-border/70 bg-card p-4 text-left transition-[background-color,border-color,transform,box-shadow] duration-200 hover:-translate-y-[1px] hover:border-primary/25 hover:bg-muted/15"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-body font-bold text-foreground">{{ item.title }}</p>
              <p class="mt-1.5 text-caption text-muted-foreground">{{ item.description }}</p>
            </div>
            <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <component :is="item.icon" class="h-5 w-5" />
            </span>
          </div>
          <p class="mt-3 inline-flex items-center gap-1 text-caption font-semibold text-primary">
            바로 가기
            <ArrowRight class="h-3.5 w-3.5" />
          </p>
        </a>
      </div>
    </div>
  </section>
</template>
