<script setup lang="ts">
import { computed } from "vue";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { mergeFaqs } from "@/lib/faqMerge";

interface FaqItem {
  q: string;
  a: string;
}

const props = defineProps<{
  title?: string;
  items: readonly FaqItem[];
  // SEO 가이드에 따로 있던 FAQ — 중복을 걸러 이 아코디언 하나로 합쳐 노출한다
  // (같은 페이지에 FAQ 블록이 두 번 나오던 가독성 문제 해소)
  extra?: readonly FaqItem[];
}>();

const visibleItems = computed(() => mergeFaqs(props.items, props.extra));
</script>

<template>
  <section class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">{{ title ?? "자주 묻는 질문" }}</h2>
    </div>
    <div class="retro-panel-content space-y-3">
      <slot name="before" />
      <Accordion type="single" collapsible>
        <AccordionItem
          v-for="(item, index) in visibleItems"
          :key="item.q"
          :value="`faq-${index}`"
        >
          <AccordionTrigger class="text-left text-caption">
            {{ item.q }}
          </AccordionTrigger>
          <!-- force-mount: 이 답변들은 FAQPage 스키마가 신고하는 텍스트다. 접었을 때
               언마운트되면 스키마에는 있고 DOM에는 없는 유령 답변이 되므로(9라우트 73문항
               라이브 실측), 항상 렌더하고 닫힘 상태는 CSS로만 감춘다. -->
          <AccordionContent force-mount>
            {{ item.a }}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </section>
</template>
