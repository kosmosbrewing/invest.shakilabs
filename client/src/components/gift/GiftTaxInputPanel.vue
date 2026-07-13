<script setup lang="ts">
import { Landmark } from "lucide-vue-next";
import { ShPresetGroup } from "@shakilabs/ui";
import { GIFT_TAX_RELATIONSHIP_OPTIONS } from "@/data/giftTax";
import type { GiftTaxInput } from "@/lib/giftTaxValidators";

defineProps<{
  giftAmount: number;
  priorDeductionUsed: number;
  relationship: GiftTaxInput["relationship"];
  isGenerationSkipping: boolean;
}>();

const emit = defineEmits<{
  "update:giftAmount": [value: number];
  "update:priorDeductionUsed": [value: number];
  "update:relationship": [value: GiftTaxInput["relationship"]];
  "update:isGenerationSkipping": [value: boolean];
}>();

function parseInput(value: string): number {
  const parsed = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
}

const amountPresets = [
  { label: "5천만", value: 50_000_000 },
  { label: "1억", value: 100_000_000 },
  { label: "5억", value: 500_000_000 },
] as const;

const deductionPresets = [
  { label: "0원", value: 0 },
  { label: "2천만", value: 20_000_000 },
  { label: "5천만", value: 50_000_000 },
] as const;
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title flex items-center gap-2">
        <Landmark class="h-4 w-4 text-primary" />
        증여 정보
      </h2>
    </div>

    <div class="retro-panel-content space-y-4">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">증여금액</label>
          <input
            aria-label="증여금액"
            type="text"
            inputmode="numeric"
            class="retro-input"
            :value="giftAmount.toLocaleString('ko-KR')"
            @input="emit('update:giftAmount', parseInput(($event.target as HTMLInputElement).value))"
          />
          <ShPresetGroup
            :model-value="giftAmount"
            :options="amountPresets"
            label="증여금액 빠른 선택"
            class="mt-3"
            @update:model-value="emit('update:giftAmount', $event)"
          />
        </div>

        <div class="retro-panel-muted p-3.5">
          <label class="mb-2 block text-caption font-semibold text-foreground">기존 사용 공제액</label>
          <input
            aria-label="기존 사용 공제액"
            type="text"
            inputmode="numeric"
            class="retro-input"
            :value="priorDeductionUsed.toLocaleString('ko-KR')"
            @input="emit('update:priorDeductionUsed', parseInput(($event.target as HTMLInputElement).value))"
          />
          <p class="mt-2 text-tiny text-muted-foreground">10년 내 동일인 기준 누적 공제액입니다.</p>
          <ShPresetGroup
            :model-value="priorDeductionUsed"
            :options="deductionPresets"
            label="기존 사용 공제액 빠른 선택"
            class="mt-3"
            @update:model-value="emit('update:priorDeductionUsed', $event)"
          />
        </div>

        <div class="retro-panel-muted p-3.5">
          <span class="mb-2 block text-caption font-semibold text-foreground">관계</span>
          <ShPresetGroup
            :model-value="relationship"
            :options="GIFT_TAX_RELATIONSHIP_OPTIONS"
            label="증여자와의 관계 선택"
            @update:model-value="emit('update:relationship', $event)"
          />
        </div>
      </div>

      <details class="retro-details">
        <summary class="retro-details-summary">
          <span>상세 설정: 세대생략 여부</span>
          <span class="retro-details-chevron">+</span>
        </summary>
        <div class="px-3 py-3 sm:px-4">
          <label class="flex items-center gap-2 rounded-lg border border-border px-3 py-3">
            <input
              type="checkbox"
              class="retro-checkbox"
              :checked="isGenerationSkipping"
              @change="emit('update:isGenerationSkipping', ($event.target as HTMLInputElement).checked)"
            />
            <span class="text-caption font-semibold text-foreground">세대생략 가산세 30% 반영</span>
          </label>
        </div>
      </details>
    </div>
  </div>
</template>
