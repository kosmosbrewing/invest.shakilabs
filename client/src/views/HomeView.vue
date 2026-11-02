<script setup lang="ts">
import { ArrowRight } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { ShSurface, ShText } from "@shakilabs/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import RelatedServices from "@/components/common/RelatedServices.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import { HOME_INTENTS, HOME_RATE_TABLE } from "@/data/homeHighlights";
import { INVEST_DATA_UPDATED } from "@/data/investTaxRates";
import { buildCanonicalUrl } from "@/lib/site";

const SEO_TITLE = "투자 세금 계산기 | 2026 세율·공제 한눈에";
const SEO_DESCRIPTION =
  "예금·적금 이자부터 배당소득세, 해외주식 양도세, ISA, 증여·상속세까지 9개 계산기를 세후 기준으로 비교합니다. 2026년 세율과 공제 한도를 표로 정리했습니다.";

// 홈에서 연결되는 계산기 목록을 구조화 데이터로도 노출한다
const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "투자·저축 계산기 목록",
  itemListElement: HOME_INTENTS.map((intent, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: intent.action,
    url: buildCanonicalUrl(intent.path),
  })),
};
</script>

<template>
  <SEOHead
    :title="SEO_TITLE"
    :description="SEO_DESCRIPTION"
    :json-ld="[itemListJsonLd]"
    kind="home"
  />

  <div class="sh-container sh-container--page space-y-5 py-5">
    <ShSurface padding="lg">
      <ShText as="h1" variant="display">세금을 뺀 다음에 비교해야 답이 보입니다</ShText>
      <!-- 허브 도입은 한 문장. 세 문장 설명·"믿고 쓰려면" 카드 3장·종합 가이드·FAQ는 2026-11 UI 감사에서 뺐다(GA4 28일 허브 조회 0). -->
      <ShText tone="muted" class="mt-3">
        이자 15.4%, 해외주식·가상자산 양도차익 22%를 뺀 세후 금액으로 비교하는 계산기 9개.
      </ShText>
      <div class="mt-4 flex flex-wrap gap-2">
        <RouterLink
          to="/all"
          class="sh-button sh-button--primary sh-button--md no-underline"
        >
          전체 계산기 보기 <ArrowRight class="h-4 w-4" aria-hidden="true" />
        </RouterLink>
        <RouterLink
          to="/deposit-interest"
          class="sh-button sh-button--secondary sh-button--md no-underline"
        >
          예금 이자부터 계산하기
        </RouterLink>
      </div>
    </ShSurface>

    <section aria-labelledby="home-intents-title">
      <div class="mb-3">
        <ShText id="home-intents-title" as="h2" variant="heading">지금 궁금한 질문부터 고르세요</ShText>
      </div>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="intent in HOME_INTENTS"
          :key="intent.key"
          :to="intent.path"
          class="block no-underline"
        >
          <ShSurface variant="outlined" padding="md" class="flex h-full flex-col hover:border-primary">
            <ShText as="h3" variant="body" class="font-semibold">{{ intent.question }}</ShText>
            <span class="mt-3 inline-flex items-center gap-1 text-caption font-semibold text-primary">
              {{ intent.action }} <ArrowRight class="h-4 w-4" aria-hidden="true" />
            </span>
          </ShSurface>
        </RouterLink>
      </div>
    </section>

    <ShSurface as="section" padding="lg" aria-labelledby="home-rates-title">
      <ShText id="home-rates-title" as="h2" variant="heading">2026년 기준 핵심 숫자</ShText>
      <ShText variant="caption" tone="muted" class="mt-1">
        계산기마다 흩어져 있는 세율과 공제 한도를 한 표로 모았습니다. ({{ INVEST_DATA_UPDATED }} 기준)
      </ShText>
      <!-- 좁은 화면에서 3열은 마지막 열이 뭉개진다. 비고를 기준 아래로 접어 2열로 유지한다 -->
      <Table class="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead scope="col" class="w-2/5">항목</TableHead>
            <TableHead scope="col">기준</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="row in HOME_RATE_TABLE" :key="row.item">
            <TableCell class="align-top font-semibold">{{ row.item }}</TableCell>
            <TableCell class="align-top">
              <span class="block font-semibold">{{ row.value }}</span>
              <span class="mt-0.5 block text-caption text-muted-foreground">{{ row.note }}</span>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </ShSurface>

    <RelatedServices />
  </div>
</template>
