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
          <AccordionContent>
            {{ item.a }}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </section>
</template>
