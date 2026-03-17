<script setup lang="ts">
import { computed } from "vue";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type MetricTone = "default" | "primary" | "success" | "danger" | "warning";

interface ResultMetricRow {
  label: string;
  value: string;
  description?: string;
  badge?: string;
  tone?: MetricTone;
}

const props = defineProps<{
  rows: readonly ResultMetricRow[];
}>();

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

const mobileRows = computed(() => props.rows);
</script>

<template>
  <div class="space-y-3 md:hidden">
    <Card
      v-for="row in mobileRows"
      :key="row.label"
      class="space-y-2 border-border/70 px-4 py-3"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <p class="text-caption font-semibold text-muted-foreground">{{ row.label }}</p>
            <Badge v-if="row.badge" variant="outline" class="border-primary/20 bg-primary/5 text-[10px] text-primary">
              {{ row.badge }}
            </Badge>
          </div>
          <p v-if="row.description" class="text-tiny text-muted-foreground">{{ row.description }}</p>
        </div>
        <p :class="['text-body font-bold tabular-nums', toneClass(row.tone)]">
          {{ row.value }}
        </p>
      </div>
    </Card>
  </div>

  <div class="hidden md:block">
    <Table class="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <TableHeader class="bg-card/95">
        <TableRow class="hover:bg-transparent">
          <TableHead>항목</TableHead>
          <TableHead>설명</TableHead>
          <TableHead class="text-right">결과</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="row in rows" :key="row.label">
          <TableCell class="font-semibold text-foreground">
            <div class="flex items-center gap-2">
              <span>{{ row.label }}</span>
              <Badge v-if="row.badge" variant="outline" class="border-primary/20 bg-primary/5 text-[10px] text-primary">
                {{ row.badge }}
              </Badge>
            </div>
          </TableCell>
          <TableCell class="text-muted-foreground">
            {{ row.description ?? "-" }}
          </TableCell>
          <TableCell :class="`text-right font-bold tabular-nums ${toneClass(row.tone)}`">
            {{ row.value }}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
