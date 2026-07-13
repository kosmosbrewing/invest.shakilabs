<script setup lang="ts">
import { onMounted } from "vue";
import { ArrowRight } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { ShSurface, ShText } from "@shakilabs/ui";
import { getRelatedInvestTools } from "@/data/investNavigation";
import { trackEvent } from "@/lib/analytics";

const props = defineProps<{ currentPath: string }>();
const links = getRelatedInvestTools(props.currentPath);
const currentTool = props.currentPath.slice(1).replaceAll("-", "_");

onMounted(() => {
  links.forEach((link) => trackEvent("related_tool_impression", {
    app_id: "invest",
    from_tool: currentTool,
    to_tool: link.key,
    placement: "after_result",
  }));
});

function trackRelatedClick(toTool: string): void {
  trackEvent("related_tool_click", {
    app_id: "invest",
    from_tool: currentTool,
    to_tool: toTool,
    placement: "after_result",
  });
}
</script>

<template>
  <section :aria-labelledby="`${currentTool}-next-actions-title`">
    <div class="mb-3 flex flex-wrap items-end justify-between gap-2">
      <ShText :id="`${currentTool}-next-actions-title`" as="h2" variant="heading">
        계산 결과에서 다음 결정을 이어가세요
      </ShText>
      <RouterLink to="/all" class="retro-link text-caption font-semibold">
        전체 도구 보기
      </RouterLink>
    </div>
    <div class="grid gap-3 md:grid-cols-3">
      <RouterLink
        v-for="link in links"
        :key="link.path"
        :to="link.path"
        class="block no-underline"
        @click="trackRelatedClick(link.key)"
      >
        <ShSurface variant="outlined" padding="md" class="group flex h-full flex-col hover:border-primary">
          <ShText as="h3" variant="heading">{{ link.title }}</ShText>
          <ShText variant="caption" tone="muted" class="mt-2 flex-1">{{ link.description }}</ShText>
          <span class="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-primary">
            바로 계산하기 <ArrowRight class="h-4 w-4" aria-hidden="true" />
          </span>
        </ShSurface>
      </RouterLink>
    </div>
  </section>
</template>
