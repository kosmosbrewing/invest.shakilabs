import { z } from "zod";
import {
  clampNoticesFor,
  numField,
  readAllNumbers,
  readBoolean,
  schemasOf,
  type ClampNotice,
  type NumField,
} from "@/lib/inputRange";

const AMOUNT_MAX = 50_000_000_000;

// 필드 정의 한 곳 — 스키마와 sanitize·클램프 알림이 모두 이 객체를 읽는다
const FIELDS = {
  totalEstate: numField("총 상속재산", 0, AMOUNT_MAX),
  debt: numField("채무", 0, AMOUNT_MAX),
  financialAssets: numField("금융재산", 0, AMOUNT_MAX),
  childrenCount: numField("자녀 수", 0, 10),
} satisfies Record<string, NumField>;

export const inheritanceTaxInputSchema = z.object({
  ...schemasOf(FIELDS),
  hasSpouse: z.boolean(),
});

export type InheritanceTaxInput = z.infer<typeof inheritanceTaxInputSchema>;

export const DEFAULT_INHERITANCE_TAX_INPUT: InheritanceTaxInput = {
  totalEstate: 2_000_000_000,
  debt: 0,
  financialAssets: 500_000_000,
  hasSpouse: true,
  childrenCount: 2,
};

export function sanitizeInheritanceTaxInput(
  input?: Partial<InheritanceTaxInput>,
): InheritanceTaxInput {
  return {
    ...readAllNumbers(FIELDS, input, DEFAULT_INHERITANCE_TAX_INPUT),
    hasSpouse: readBoolean(input?.hasSpouse, DEFAULT_INHERITANCE_TAX_INPUT.hasSpouse),
  };
}

/** 범위 밖이라 잘린 필드 — 화면 배너로 알린다 */
export function inheritanceTaxClampNotices(
  input?: Partial<InheritanceTaxInput>,
): ClampNotice[] {
  return clampNoticesFor(FIELDS, input as Record<string, unknown> | undefined);
}
