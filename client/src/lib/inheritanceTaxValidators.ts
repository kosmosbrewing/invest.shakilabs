import { z } from "zod";

const amountSchema = z.coerce.number().int().min(0).max(50_000_000_000);

export const inheritanceTaxInputSchema = z.object({
  totalEstate: amountSchema,
  debt: amountSchema,
  financialAssets: amountSchema,
  hasSpouse: z.boolean(),
  childrenCount: z.coerce.number().int().min(0).max(10),
});

export type InheritanceTaxInput = z.infer<typeof inheritanceTaxInputSchema>;

export const DEFAULT_INHERITANCE_TAX_INPUT: InheritanceTaxInput = {
  totalEstate: 2_000_000_000,
  debt: 0,
  financialAssets: 500_000_000,
  hasSpouse: true,
  childrenCount: 2,
};

function readField<T>(schema: z.ZodType<T>, value: unknown, fallback: T): T {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}

export function sanitizeInheritanceTaxInput(input?: Partial<InheritanceTaxInput>): InheritanceTaxInput {
  return {
    totalEstate: readField(amountSchema, input?.totalEstate, DEFAULT_INHERITANCE_TAX_INPUT.totalEstate),
    debt: readField(amountSchema, input?.debt, DEFAULT_INHERITANCE_TAX_INPUT.debt),
    financialAssets: readField(amountSchema, input?.financialAssets, DEFAULT_INHERITANCE_TAX_INPUT.financialAssets),
    hasSpouse: readField(z.boolean(), input?.hasSpouse, DEFAULT_INHERITANCE_TAX_INPUT.hasSpouse),
    childrenCount: readField(z.coerce.number().int().min(0).max(10), input?.childrenCount, DEFAULT_INHERITANCE_TAX_INPUT.childrenCount),
  };
}
