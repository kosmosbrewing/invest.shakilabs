import { z } from "zod";
import {
  clampNoticesFor,
  numField,
  readAllNumbers,
  readBoolean,
  readEnum,
  schemasOf,
  type ClampNotice,
  type NumField,
} from "@/lib/inputRange";

const AMOUNT_MAX = 50_000_000_000;
const relationshipValues = ["spouse", "adult-child", "minor-child", "parent", "other"] as const;

// 필드 정의 한 곳 — 스키마와 sanitize·클램프 알림이 모두 이 객체를 읽는다
const FIELDS = {
  giftAmount: numField("증여금액", 0, AMOUNT_MAX),
  priorDeductionUsed: numField("기공제액", 0, AMOUNT_MAX),
} satisfies Record<string, NumField>;

export const giftTaxInputSchema = z.object({
  ...schemasOf(FIELDS),
  relationship: z.enum(relationshipValues),
  isGenerationSkipping: z.boolean(),
});

export type GiftTaxInput = z.infer<typeof giftTaxInputSchema>;

export const DEFAULT_GIFT_TAX_INPUT: GiftTaxInput = {
  giftAmount: 300_000_000,
  priorDeductionUsed: 0,
  relationship: "adult-child",
  isGenerationSkipping: false,
};

export function sanitizeGiftTaxInput(input?: Partial<GiftTaxInput>): GiftTaxInput {
  return {
    ...readAllNumbers(FIELDS, input, DEFAULT_GIFT_TAX_INPUT),
    relationship: readEnum(relationshipValues, input?.relationship, DEFAULT_GIFT_TAX_INPUT.relationship),
    isGenerationSkipping: readBoolean(
      input?.isGenerationSkipping,
      DEFAULT_GIFT_TAX_INPUT.isGenerationSkipping,
    ),
  };
}

/** 범위 밖이라 잘린 필드 — 화면 배너로 알린다 */
export function giftTaxClampNotices(input?: Partial<GiftTaxInput>): ClampNotice[] {
  return clampNoticesFor(FIELDS, input as Record<string, unknown> | undefined);
}
