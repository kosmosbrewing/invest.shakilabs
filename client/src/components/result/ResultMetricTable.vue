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
  <div class="space-y-3 md:hidden">
    <ShSurface
      v-for="row in rows"
      :key="row.label"
      class="space-y-2"
      padding="sm"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <p class="text-caption font-semibold text-muted-foreground">{{ row.label }}</p>
            <ShBadge v-if="row.badge" tone="primary">{{ row.badge }}</ShBadge>
          </div>
          <p v-if="row.description" class="text-tiny text-muted-foreground">
            {{ row.description }}
          </p>
        </div>
        <p :class="['text-body font-bold tabular-nums', toneClass(row.tone)]">
          {{ row.value }}
        </p>
      </div>
    </ShSurface>
  </div>

  <div class="hidden md:block">
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
