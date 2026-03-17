<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { AlertTriangle, Check, CheckCircle2, Info, X } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AlertType = "success" | "error" | "warning" | "info";
type ConfirmVariant = "success" | "destructive";

const props = withDefaults(
  defineProps<{
    class?: string;
    message?: string;
    type?: AlertType;
    duration?: number;
    confirmMode?: boolean;
    confirmVariant?: ConfirmVariant;
    confirmText?: string;
    cancelText?: string;
  }>(),
  {
    class: "",
    message: "",
    type: "success",
    duration: 2000,
    confirmMode: false,
    confirmVariant: "success",
    confirmText: "확인",
    cancelText: "취소",
  }
);

const emit = defineEmits<{
  (event: "close"): void;
  (event: "confirm"): void;
  (event: "cancel"): void;
}>();

const isVisible = ref(true);
const isDestructive = computed(() => props.confirmVariant === "destructive");
const alertStyles = computed(() => {
  if (props.confirmMode) return "";
  if (props.type === "error") return "bg-destructive text-destructive-foreground";
  return "bg-primary text-primary-foreground";
});
const containerStyles = computed(() => {
  if (props.confirmMode) {
    return "pointer-events-auto w-[280px] overflow-hidden rounded-2xl border border-border bg-background shadow-2xl sm:w-[320px]";
  }
  return "pointer-events-auto flex items-center gap-2 rounded-2xl px-5 py-3 shadow-lg";
});

let timer: ReturnType<typeof setTimeout> | null = null;

function onAfterLeave(): void {
  emit("close");
}

function handleConfirm(): void {
  emit("confirm");
  isVisible.value = false;
}

function handleCancel(): void {
  emit("cancel");
  isVisible.value = false;
}

onMounted(() => {
  if (props.confirmMode) return;
  timer = setTimeout(() => {
    isVisible.value = false;
  }, props.duration);
});

onUnmounted(() => {
  if (timer) clearTimeout(timer);
});
</script>

<template>
  <Teleport to="body">
    <Transition
      v-if="confirmMode"
      appear
      appear-active-class="animate-in fade-in-0 duration-200"
      enter-active-class="animate-in fade-in-0 duration-200"
      leave-active-class="animate-out fade-out-0 duration-150"
    >
      <div v-if="isVisible" class="fixed inset-0 z-50 bg-black/50" @click="handleCancel" />
    </Transition>

    <div
      :class="['pointer-events-none fixed z-50 flex justify-center', confirmMode ? 'inset-0 items-center pt-[10vh] sm:pb-[8vh] sm:pt-0' : 'left-0 right-0 top-8']"
    >
      <Transition
        appear
        :appear-active-class="confirmMode ? 'animate-in fade-in-0 zoom-in-95 slide-in-from-top-4 duration-200 sm:slide-in-from-bottom-0' : 'animate-in fade-in-0 slide-in-from-top-5 duration-300'"
        :enter-active-class="confirmMode ? 'animate-in fade-in-0 zoom-in-95 slide-in-from-top-4 duration-200 sm:slide-in-from-bottom-0' : 'animate-in fade-in-0 slide-in-from-top-5 duration-300'"
        :leave-active-class="confirmMode ? 'animate-out fade-out-0 zoom-out-95 slide-out-to-top-4 duration-150 sm:slide-out-to-bottom-0' : 'animate-out fade-out-0 slide-out-to-top-5 duration-200'"
        @after-leave="onAfterLeave"
      >
        <div v-if="isVisible" :class="cn(containerStyles, alertStyles, props.class)" role="alert">
          <template v-if="confirmMode">
            <div class="flex flex-col items-center gap-2.5 px-5 pb-4 pt-6 sm:px-6 sm:pb-4 sm:pt-6">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 sm:h-14 sm:w-14">
                <CheckCircle2 v-if="!isDestructive" class="h-6 w-6 text-primary sm:h-8 sm:w-8" />
                <AlertTriangle v-else class="h-6 w-6 text-primary sm:h-8 sm:w-8" />
              </div>
              <p class="text-center text-caption font-medium text-foreground whitespace-pre-line sm:text-body">
                {{ message }}
              </p>
            </div>
            <div class="flex border-t border-border">
              <Button @click="handleCancel" variant="ghost" class="flex-1 rounded-none border-r border-border py-3 text-muted-foreground hover:bg-muted/50 sm:py-3.5">
                {{ cancelText }}
              </Button>
              <Button @click="handleConfirm" variant="ghost" class="flex-1 rounded-none py-3 text-primary hover:bg-primary/5 hover:text-primary sm:py-3.5">
                {{ confirmText }}
              </Button>
            </div>
          </template>

          <template v-else>
            <slot>
              <Check v-if="type === 'success'" class="h-4 w-4" />
              <AlertTriangle v-else-if="type === 'warning'" class="h-4 w-4" />
              <Info v-else-if="type === 'info'" class="h-4 w-4" />
              <X v-else class="h-4 w-4" />
              <p class="text-body font-medium">{{ message }}</p>
            </slot>
          </template>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>
