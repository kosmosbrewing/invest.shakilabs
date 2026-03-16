<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Moon, Sun } from "lucide-vue-next";
import { RouterLink } from "vue-router";

const THEME_STORAGE_KEY = "invest-calc:theme:v1";
type ThemeMode = "light" | "dark";

const theme = ref<ThemeMode>("light");

function applyTheme(next: ThemeMode): void {
  theme.value = next;
  document.documentElement.classList.toggle("dark", next === "dark");
  localStorage.setItem(THEME_STORAGE_KEY, next);
}

function toggleTheme(): void {
  applyTheme(theme.value === "dark" ? "light" : "dark");
}

onMounted(() => {
  theme.value = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
});
</script>

<template>
  <header class="border-b border-border bg-primary/8">
    <div class="container pt-2.5 pb-2.5">
      <div class="overflow-hidden">
        <div class="retro-titlebar h-11 border-b-0 px-2 bg-transparent">
          <div class="flex h-full w-full items-center gap-2 sm:gap-4">
            <RouterLink
              to="/"
              aria-label="ShakiLabs 홈"
              class="inline-flex h-8 shrink-0 items-center gap-1.5 px-0.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <span
                class="inline-flex h-6 w-6 items-center justify-center rounded-md bg-muted/60 ring-1 ring-border/60"
                aria-hidden="true"
              >
                <svg class="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 12L6 3l4 9-4 9z M10 12l4-9 4 9-4 9z M18 12l4-9" />
                </svg>
              </span>
              <span class="hidden sm:inline font-brand text-tiny font-semibold tracking-wide text-foreground/90">
                invest.shakilabs.com
              </span>
            </RouterLink>
            <div class="flex min-w-0 flex-1 items-center justify-center overflow-hidden px-1 text-center font-brand text-caption tracking-[-0.01em]">
              <span class="text-muted-foreground">2026 투자 세금 계산기</span>
            </div>
            <button
              type="button"
              class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded border border-border/70 bg-transparent text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              :aria-label="theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'"
              @click="toggleTheme"
            >
              <Moon v-if="theme === 'dark'" class="h-4 w-4" />
              <Sun v-else class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
