<script setup lang="ts">
import { computed } from "vue";
import { Loader2 } from "lucide-vue-next";
import { cn } from "@/lib/utils";

type SpinnerSize = "sm" | "md" | "lg";
type SpinnerColor = "primary" | "white" | "muted" | "foreground";

const props = withDefaults(
  defineProps<{
    size?: SpinnerSize;
    center?: boolean;
    variant?: "dots" | "spinner";
    color?: SpinnerColor;
    fullscreen?: boolean;
    message?: string;
  }>(),
  {
    size: "md",
    center: true,
    variant: "dots",
    color: "primary",
    fullscreen: false,
    message: "",
  }
);

const dotSizes: Record<SpinnerSize, string> = { sm: "h-2 w-2", md: "h-3 w-3", lg: "h-4 w-4" };
const spinnerSizes: Record<SpinnerSize, string> = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };

const textColorClasses = computed(() => ({
  primary: "text-primary",
  white: "text-white dark:text-foreground",
  muted: "text-muted-foreground",
  foreground: "text-foreground",
})[props.color]);

const dotColorClasses = computed(() => ({
  primary: "bg-primary",
  white: "bg-white dark:bg-foreground",
  muted: "bg-muted-foreground",
  foreground: "bg-foreground",
})[props.color]);

const wrapperClasses = computed(() => {
  if (props.fullscreen) {
    return "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 text-center backdrop-blur-sm";
  }
  if (props.center) return "flex flex-col items-center justify-center py-20 text-center";
  return "inline-flex items-center gap-2";
});
</script>

<template>
  <div :class="wrapperClasses">
    <Loader2
      v-if="variant === 'spinner'"
      :class="cn(spinnerSizes[size], textColorClasses, 'animate-spin')"
    />
    <div v-else class="flex items-center gap-1.5">
      <span
        v-for="index in 3"
        :key="index"
        :class="cn(dotSizes[size], dotColorClasses, 'animate-bounce-dot rounded-full')"
        :style="{ animationDelay: `${(index - 1) * 0.15}s` }"
      />
    </div>

    <p
      v-if="message"
      :class="cn(center || fullscreen ? 'mt-4' : '', 'text-body text-muted-foreground')"
    >
      {{ message }}
    </p>
  </div>
</template>

<style scoped>
@keyframes bounce-dot {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-12px); }
}

.animate-bounce-dot {
  animation: bounce-dot 0.7s ease-in-out infinite;
}
</style>
