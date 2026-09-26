<script setup lang="ts">
import { useId } from "vue";
import { ShPresetGroup } from "@shakilabs/ui";
import { TrendingUp } from "lucide-vue-next";
import { SELL_AMOUNT_PRESETS } from "@/data/foreignStockTax";
import { formatWon } from "@/lib/utils";

defineProps<{
  sellAmount: number;
  buyAmount: number;
  fees: number;
  otherGains: number;
  otherLosses: number;
}>();

const emit = defineEmits<{
  "update:sellAmount": [value: number];
  "update:buyAmount": [value: number];
  "update:fees": [value: number];
  "update:otherGains": [value: number];
  "update:otherLosses": [value: number];
}>();

function parseInput(value: string): number {
  const parsed = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
}
const sellAmountPresetOptions = SELL_AMOUNT_PRESETS.map((value) => ({ label: formatWon(value), value }));

// 왜: 보이는 작은 제목을 <label for>로 칸에 묶어야 스크린리더가 "편집, 빈칸" 대신 칸 이름을 읽는다
const sellAmountId = useId();
const buyAmountId = useId();
const feesId = useId();
const otherGainsId = useId();
const otherLossesId = useId();
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title flex items-center gap-2">
        <TrendingUp class="h-4 w-4 text-primary" />
        양도 정보
      </h2>
    </div>

    <div class="retro-panel-content space-y-4">
      <!-- 1×2 틀의 반폭 칸(lg+)에서는 1열 — 3열이면 칸당 129px라 안내문이 4~5줄로 꺾이고 프리셋이 세로로 쌓인다.
           틀이 한 줄로 쌓이는 sm~lg에서는 입력 카드가 전폭이라 3열을 유지한다. -->
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
        <div class="retro-panel-muted p-3.5">
          <label :for="sellAmountId" class="mb-2 block text-caption font-semibold text-foreground">매도금액 (원화)</label>
          <input
            :id="sellAmountId"
            type="text"
            inputmode="numeric"
            class="retro-input"
            :value="sellAmount.toLocaleString('ko-KR')"
            @input="emit('update:sellAmount', parseInput(($event.target as HTMLInputElement).value))"
          />
          <ShPresetGroup
            :model-value="sellAmount"
            :options="sellAmountPresetOptions"
            label="매도금액 빠른 선택"
            class="mt-3"
            @update:model-value="emit('update:sellAmount', $event)"
          />
        </div>

        <div class="retro-panel-muted p-3.5">
          <label :for="buyAmountId" class="mb-2 block text-caption font-semibold text-foreground">매수금액 (원화)</label>
          <input
            :id="buyAmountId"
            type="text"
            inputmode="numeric"
            class="retro-input"
            :value="buyAmount.toLocaleString('ko-KR')"
            @input="emit('update:buyAmount', parseInput(($event.target as HTMLInputElement).value))"
          />
          <p class="mt-2 text-tiny text-muted-foreground">환전 시 적용된 환율 기준 원화 금액을 입력하세요.</p>
        </div>

        <div class="retro-panel-muted p-3.5">
          <label :for="feesId" class="mb-2 block text-caption font-semibold text-foreground">필요경비 (수수료 등)</label>
          <input
            :id="feesId"
            type="text"
            inputmode="numeric"
            class="retro-input"
            :value="fees.toLocaleString('ko-KR')"
            @input="emit('update:fees', parseInput(($event.target as HTMLInputElement).value))"
          />
          <p class="mt-2 text-tiny text-muted-foreground">매매 수수료, 환전 수수료 등 비용입니다.</p>
        </div>
      </div>

      <details class="retro-details">
        <summary class="retro-details-summary">
          <span>상세 설정: 다른 종목 손익 합산</span>
          <span class="retro-details-chevron">+</span>
        </summary>
        <div class="grid grid-cols-1 gap-3 px-3 py-3 sm:grid-cols-2 sm:px-4">
          <div class="retro-panel-muted p-3.5">
            <label :for="otherGainsId" class="mb-2 block text-caption font-semibold text-foreground">다른 종목 양도차익</label>
            <input
              :id="otherGainsId"
              type="text"
              inputmode="numeric"
              class="retro-input"
              :value="otherGains.toLocaleString('ko-KR')"
              @input="emit('update:otherGains', parseInput(($event.target as HTMLInputElement).value))"
            />
          </div>
          <div class="retro-panel-muted p-3.5">
            <label :for="otherLossesId" class="mb-2 block text-caption font-semibold text-foreground">다른 종목 양도차손</label>
            <input
              :id="otherLossesId"
              type="text"
              inputmode="numeric"
              class="retro-input"
              :value="otherLosses.toLocaleString('ko-KR')"
              @input="emit('update:otherLosses', parseInput(($event.target as HTMLInputElement).value))"
            />
          </div>
        </div>
      </details>
    </div>
  </div>
</template>
