<script setup lang="ts">
// 차트 본체는 @shakilabs/ui ShRankedBars — 이 파일은 invest의 retro-chart 크롬만 입힌다.
// 호출부(IsaResultPanel.vue)의 props 이름(label/note/items/formatValue)은 그대로 유지한다.
import { ShRankedBars } from "@shakilabs/ui";
import type { RankedBarItem } from "@shakilabs/ui";

defineProps<{
  /** 패키지에서는 title이지만, 호출부를 고치지 않기 위해 label 이름을 유지한다. */
  label: string;
  note: string;
  items: readonly RankedBarItem[];
  // 패키지 계약이 null(산출 불가)까지 받으므로 여기서도 넓혀야 타입이 통과한다. formatWon은 이미 null 처리를 한다.
  formatValue: (value: number | null) => string;
}>();
</script>

<template>
  <section class="retro-chart">
    <ShRankedBars :items="items" :note="note" :format-value="formatValue">
      <template #header="{ titleId }">
        <h3 :id="titleId" class="text-caption text-muted-foreground">{{ label }}</h3>
      </template>
    </ShRankedBars>
  </section>
</template>
