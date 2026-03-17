import { z } from "zod";

const amountSchema = z.coerce.number().int().min(0).max(50_000_000_000);
const relationshipValues = ["spouse", "adult-child", "minor-child", "parent", "other"] as const;

export const giftTaxInputSchema = z.object({
  giftAmount: amountSchema,
  priorDeductionUsed: amountSchema,
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

function readField<T>(schema: z.ZodType<T>, value: unknown, fallback: T): T {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}

export function sanitizeGiftTaxInput(input?: Partial<GiftTaxInput>): GiftTaxInput {
  return {
    giftAmount: readField(amountSchema, input?.giftAmount, DEFAULT_GIFT_TAX_INPUT.giftAmount),
    priorDeductionUsed: readField(
      amountSchema,
      input?.priorDeductionUsed,
      DEFAULT_GIFT_TAX_INPUT.priorDeductionUsed,
    ),
    relationship: readField(
      z.enum(relationshipValues),
      input?.relationship,
      DEFAULT_GIFT_TAX_INPUT.relationship,
    ),
    isGenerationSkipping: readField(
      z.boolean(),
      input?.isGenerationSkipping,
      DEFAULT_GIFT_TAX_INPUT.isGenerationSkipping,
    ),
  };
}
