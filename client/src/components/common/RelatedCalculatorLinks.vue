<script setup lang="ts">
import { computed } from "vue";
import { ArrowRight, Banknote, Bitcoin, Gift, Globe, Landmark, PiggyBank, ScrollText, TrendingUp, Wallet } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { ActionCard } from "@/components/ui/action-card";

const props = defineProps<{
  currentPath: string;
}>();

const links = [
  {
    path: "/crypto-tax",
    title: "가상자산 세금",
    description: "기본공제 250만원과 22% 예정세율을 바로 확인합니다.",
    icon: Bitcoin,
  },
  {
    path: "/dividend-tax",
    title: "배당소득세 계산",
    description: "국내·해외 배당의 원천징수와 실효세율을 비교합니다.",
    icon: Banknote,
  },
  {
    path: "/isa",
    title: "ISA 만기 비교",
    description: "ISA 계좌와 일반 계좌의 세후 수령액 차이를 계산합니다.",
    icon: PiggyBank,
  },
  {
    path: "/gift-tax",
    title: "증여세 계산",
    description: "관계별 공제 한도와 누진세율을 반영해 예상 세액을 봅니다.",
    icon: Gift,
  },
  {
    path: "/savings-interest",
    title: "적금 이자 계산",
    description: "월 적립액·이율·기간별 만기 수령액과 세후 이자를 계산합니다.",
    icon: Wallet,
  },
  {
    path: "/deposit-interest",
    title: "예금 이자 계산",
    description: "정기예금 만기 수령액과 월이자를 계산합니다.",
    icon: Landmark,
  },
  {
    path: "/compound-interest",
    title: "복리 계산기",
    description: "단리와 복리의 차이를 비교하고 72법칙을 확인합니다.",
    icon: TrendingUp,
  },
  {
    path: "/inheritance-tax",
    title: "상속세 계산기",
    description: "법정 상속분과 누진세율을 반영해 예상 상속세를 계산합니다.",
    icon: ScrollText,
  },
  {
    path: "/foreign-stock-tax",
    title: "해외주식 양도소득세",
    description: "해외주식 250만원 기본공제와 22% 세율을 적용해 세금을 계산합니다.",
    icon: Globe,
  },
] as const;

const visibleLinks = computed(() => links.filter((link) => link.path !== props.currentPath));
</script>

<template>
  <section class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">다른 계산기도 확인해보세요</h2>
    </div>
    <div class="retro-panel-content">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ActionCard
          v-for="link in visibleLinks"
          :key="link.path"
          :as="RouterLink"
          :to="link.path"
          class="gap-0"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-body font-bold text-foreground">{{ link.title }}</p>
              <p class="mt-1.5 text-caption text-muted-foreground">{{ link.description }}</p>
            </div>
            <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <component :is="link.icon" class="h-5 w-5" />
            </span>
          </div>
          <p class="mt-3 inline-flex items-center gap-1 text-caption font-semibold text-primary">
            바로 가기 <ArrowRight class="h-3.5 w-3.5" />
          </p>
        </ActionCard>
      </div>
    </div>
  </section>
</template>
