import { z } from "zod";
import {
  clampNoticesFor,
  numField,
  readAllNumbers,
  schemasOf,
  type ClampNotice,
  type NumField,
} from "@/lib/inputRange";

const AMOUNT_MAX = 50_000_000_000;

// 필드 정의 한 곳 — 스키마와 sanitize·클램프 알림이 모두 이 객체를 읽는다
const FIELDS = {
  sellAmount: numField("매도금액", 0, AMOUNT_MAX),
  buyAmount: numField("매수금액", 0, AMOUNT_MAX),
  fees: numField("필요경비", 0, AMOUNT_MAX),
  otherGains: numField("다른 종목 양도차익", 0, AMOUNT_MAX),
  otherLosses: numField("다른 종목 양도차손", 0, AMOUNT_MAX),
} satisfies Record<string, NumField>;

export const foreignStockTaxInputSchema = z.object(schemasOf(FIELDS));

export type ForeignStockTaxInput = z.infer<typeof foreignStockTaxInputSchema>;

export const DEFAULT_FOREIGN_STOCK_TAX_INPUT: ForeignStockTaxInput = {
  sellAmount: 50_000_000,
  buyAmount: 30_000_000,
  fees: 500_000,
  otherGains: 0,
  otherLosses: 0,
};

export function sanitizeForeignStockTaxInput(
  input?: Partial<ForeignStockTaxInput>,
): ForeignStockTaxInput {
  return readAllNumbers(FIELDS, input, DEFAULT_FOREIGN_STOCK_TAX_INPUT);
}

/** 범위 밖이라 잘린 필드 — 화면 배너로 알린다 */
export function foreignStockTaxClampNotices(
  input?: Partial<ForeignStockTaxInput>,
): ClampNotice[] {
  return clampNoticesFor(FIELDS, input as Record<string, unknown> | undefined);
}
