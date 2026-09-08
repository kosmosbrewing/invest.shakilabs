<script setup lang="ts">
/**
 * 입력 범위 클램프 알림 — loan.shakilabs의 같은 이름 컴포넌트를 이식했다.
 *
 * 범위 밖 입력을 기본값으로 되돌리면(예전 동작) 7,000만원을 넣은 사용자가
 * 5,000만원 결과를 보게 된다. 지금은 경계로 자르는데, 자른 사실을 알리지 않으면
 * 입력칸과 결과가 어긋난 채 남아 또 다른 조용한 오답이 된다.
 */
import type { ClampNotice } from "@/lib/inputRange";
import { formatNumber } from "@/lib/utils";

defineProps<{ notices: ClampNotice[] }>();
</script>

<template>
  <p
    v-if="notices.length > 0"
    role="alert"
    class="retro-panel-muted p-3 text-caption font-semibold text-status-danger"
  >
    입력 가능 범위를 벗어나
    <template v-for="(n, i) in notices" :key="n.key">
      <span v-if="i > 0">, </span>{{ n.label }} {{ formatNumber(n.entered) }} → {{ formatNumber(n.applied) }}
    </template>
    로 계산했습니다. 범위 안의 값을 입력하면 그대로 계산됩니다.
  </p>
</template>
