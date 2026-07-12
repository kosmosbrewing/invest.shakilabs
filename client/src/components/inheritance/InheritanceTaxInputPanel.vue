<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Landmark } from "lucide-vue-next";
import { ESTATE_PRESETS } from "@/data/inheritanceTax";
import { formatWon } from "@/lib/utils";

defineProps<{
  totalEstate: number;
  debt: number;
  financialAssets: number;
  hasSpouse: boolean;
  childrenCount: number;
}>();

const emit = defineEmits<{
  "update:totalEstate": [value: number];
  "update:debt": [value: number];
  "update:financialAssets": [value: number];
  "update:hasSpouse": [value: boolean];
  "update:childrenCount": [value: number];
}>();

function parseInput(value: string): number {
  const parsed = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
}
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title flex items-center gap-2">
        <Landmark class="h-4 w-4 text-primary" />
        상속 정보
      </h2>
    </div>

    <div class="retro-panel-content space-y-4">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <!-- 상속재산 -->
        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">상속재산 총액</label>
          <input
            aria-label="상속재산 총액"
            type="text"
            inputmode="numeric"
            class="retro-input"
            :value="totalEstate.toLocaleString('ko-KR')"
            @input="emit('update:totalEstate', parseInput(($event.target as HTMLInputElement).value))"
          />
          <div class="mt-3 flex flex-wrap gap-2">
            <Button
              v-for="preset in ESTATE_PRESETS"
              :key="preset"
              type="button"
              variant="outline"
              size="chipSm"
              @click="emit('update:totalEstate', preset)"
            >
              {{ formatWon(preset) }}
            </Button>
          </div>
        </div>

        <!-- 채무 -->
        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">채무 (공과금 포함)</label>
          <input
            aria-label="채무와 공과금"
            type="text"
            inputmode="numeric"
            class="retro-input"
            :value="debt.toLocaleString('ko-KR')"
            @input="emit('update:debt', parseInput(($event.target as HTMLInputElement).value))"
          />
          <p class="mt-2 text-tiny text-muted-foreground">피상속인의 부채·미납세금 등이 포함됩니다.</p>
        </div>

        <!-- 금융재산 -->
        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">순금융재산</label>
          <input
            aria-label="순금융재산"
            type="text"
            inputmode="numeric"
            class="retro-input"
            :value="financialAssets.toLocaleString('ko-KR')"
            @input="emit('update:financialAssets', parseInput(($event.target as HTMLInputElement).value))"
          />
          <p class="mt-2 text-tiny text-muted-foreground">예금·주식·보험금 등 금융자산에서 금융부채를 뺀 금액입니다.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <!-- 배우자 유무 -->
        <div class="retro-panel-muted p-3.5">
          <span class="mb-2 block text-caption font-semibold text-foreground">배우자 상속공제</span>
          <div class="profile-option-grid grid grid-cols-2 gap-2">
            <button
              type="button"
              class="rounded-lg border px-3 py-2.5 text-caption transition-colors"
              :class="hasSpouse ? 'border-primary bg-primary/8 font-semibold text-foreground' : 'border-border text-muted-foreground hover:border-primary/50'"
              @click="emit('update:hasSpouse', true)"
            >
              배우자 있음
            </button>
            <button
              type="button"
              class="rounded-lg border px-3 py-2.5 text-caption transition-colors"
              :class="!hasSpouse ? 'border-primary bg-primary/8 font-semibold text-foreground' : 'border-border text-muted-foreground hover:border-primary/50'"
              @click="emit('update:hasSpouse', false)"
            >
              배우자 없음
            </button>
          </div>
        </div>

        <!-- 자녀 수 -->
        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">자녀 수</label>
          <select
            aria-label="자녀 수"
            class="retro-input"
            :value="childrenCount"
            @change="emit('update:childrenCount', Number(($event.target as HTMLSelectElement).value))"
          >
            <option v-for="n in 7" :key="n - 1" :value="n - 1">{{ n - 1 }}명</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>
