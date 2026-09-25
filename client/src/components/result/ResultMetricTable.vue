<script setup lang="ts">
import {
  ShBadge,
  ShSurface,
  ShTable,
  ShTableBody,
  ShTableCell,
  ShTableHead,
  ShTableHeader,
  ShTableRow,
} from "@shakilabs/ui";

type MetricTone = "default" | "primary" | "success" | "danger" | "warning";

interface ResultMetricRow {
  label: string;
  value: string;
  description?: string;
  badge?: string;
  tone?: MetricTone;
}

defineProps<{ rows: readonly ResultMetricRow[] }>();

const toneClassMap: Record<MetricTone, string> = {
  default: "text-foreground",
  primary: "text-primary",
  success: "text-status-success",
  danger: "text-status-danger",
  warning: "text-status-warning",
};

function toneClass(tone?: MetricTone): string {
  return tone ? toneClassMap[tone] : toneClassMap.default;
}
</script>

<template>
  <!-- lg(1024px+)에서는 결과 칸이 1×2 틀의 반폭(~480~540px)이라 표의 "설명" 열이
       가려져 칸 안 가로 스크롤이 생긴다 — 표는 결과가 전폭인 md~lg 구간에만 두고
       lg부터는 다시 카드 목록으로 보여준다(모바일 카드 재사용, 열을 지우지 않는다). -->
  <div class="space-y-3 md:hidden lg:block">
    <ShSurface
      v-for="row in rows"
      :key="row.label"
      class="space-y-2"
      padding="sm"
    >
      <div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <p class="text-caption font-semibold text-muted-foreground">{{ row.label }}</p>
            <ShBadge v-if="row.badge" tone="primary">{{ row.badge }}</ShBadge>
          </div>
          <p v-if="row.description" class="text-tiny text-muted-foreground">
            {{ row.description }}
          </p>
        </div>
        <p :class="['text-body font-bold tabular-nums sm:text-right', toneClass(row.tone)]">
          {{ row.value }}
        </p>
      </div>
    </ShSurface>
  </div>

  <div class="hidden md:block lg:hidden">
    <ShTable aria-label="계산 결과 항목별 상세" density="compact">
      <ShTableHeader>
        <ShTableRow>
          <ShTableHead>항목</ShTableHead>
          <ShTableHead>설명</ShTableHead>
          <ShTableHead numeric>결과</ShTableHead>
        </ShTableRow>
      </ShTableHeader>
      <ShTableBody>
        <ShTableRow v-for="row in rows" :key="row.label">
          <ShTableCell emphasis>
            <div class="flex items-center gap-2">
              <span>{{ row.label }}</span>
              <ShBadge v-if="row.badge" tone="primary">{{ row.badge }}</ShBadge>
            </div>
          </ShTableCell>
          <ShTableCell>{{ row.description ?? "-" }}</ShTableCell>
          <ShTableCell numeric emphasis :class="toneClass(row.tone)">
            {{ row.value }}
          </ShTableCell>
        </ShTableRow>
      </ShTableBody>
    </ShTable>
  </div>
</template>
