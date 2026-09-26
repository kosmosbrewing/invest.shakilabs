<script setup lang="ts">
import { onMounted } from "vue";
import { RouterLink } from "vue-router";
import { ShNextActions } from "@shakilabs/ui";
import type { NextActionItem } from "@shakilabs/ui";
import { getRelatedInvestTools } from "@/data/investNavigation";
import { trackEvent } from "@/lib/analytics";

// 카드 문법(제목 + 한 줄)과 폭 판정(반폭이면 목록, 전폭이면 3열)은 패키지 ShNextActions가 맡는다 —
// 앱마다 카드·CTA 문구·격자를 따로 두지 않기 위해서다.
// 허브 링크("전체 도구 보기")는 두지 않는다: 같은 /all을 상단 탭·드로어·푸터가 원시 HTML에서 이미 링크한다.
const props = defineProps<{ currentPath: string }>();
const links = getRelatedInvestTools(props.currentPath);
const currentTool = props.currentPath.slice(1).replaceAll("-", "_");
const items: NextActionItem[] = links.map((link) => ({
  key: link.key,
  title: link.title,
  to: link.path,
  note: link.note,
}));

onMounted(() => {
  links.forEach((link) => trackEvent("related_tool_impression", {
    app_id: "invest",
    from_tool: currentTool,
    to_tool: link.key,
    placement: "after_result",
  }));
});

// 이벤트 이름·파라미터는 카드 교체 전과 같다(to_tool = 도구 key) — GA4 비교가 끊기지 않게.
function trackRelatedClick(item: NextActionItem): void {
  trackEvent("related_tool_click", {
    app_id: "invest",
    from_tool: currentTool,
    to_tool: item.key,
    placement: "after_result",
  });
}
</script>

<template>
  <ShNextActions :items="items" :link-component="RouterLink" @select="trackRelatedClick" />
</template>
