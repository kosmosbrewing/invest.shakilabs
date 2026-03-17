<script setup lang="ts">
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FaqItem {
  q: string;
  a: string;
}

defineProps<{
  title?: string;
  items: readonly FaqItem[];
}>();
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
          v-for="(item, index) in items"
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
