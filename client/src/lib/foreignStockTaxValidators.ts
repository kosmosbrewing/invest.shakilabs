import { z } from "zod";

const amountSchema = z.coerce.number().int().min(0).max(50_000_000_000);

export const foreignStockTaxInputSchema = z.object({
  sellAmount: amountSchema,
  buyAmount: amountSchema,
  fees: amountSchema,
  otherGains: amountSchema,
  otherLosses: amountSchema,
});

export type ForeignStockTaxInput = z.infer<typeof foreignStockTaxInputSchema>;

export const DEFAULT_FOREIGN_STOCK_TAX_INPUT: ForeignStockTaxInput = {
  sellAmount: 50_000_000,
  buyAmount: 30_000_000,
  fees: 500_000,
  otherGains: 0,
  otherLosses: 0,
};

function readField<T>(schema: z.ZodType<T>, value: unknown, fallback: T): T {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}

export function sanitizeForeignStockTaxInput(input?: Partial<ForeignStockTaxInput>): ForeignStockTaxInput {
  return {
    sellAmount: readField(amountSchema, input?.sellAmount, DEFAULT_FOREIGN_STOCK_TAX_INPUT.sellAmount),
    buyAmount: readField(amountSchema, input?.buyAmount, DEFAULT_FOREIGN_STOCK_TAX_INPUT.buyAmount),
    fees: readField(amountSchema, input?.fees, DEFAULT_FOREIGN_STOCK_TAX_INPUT.fees),
    otherGains: readField(amountSchema, input?.otherGains, DEFAULT_FOREIGN_STOCK_TAX_INPUT.otherGains),
    otherLosses: readField(amountSchema, input?.otherLosses, DEFAULT_FOREIGN_STOCK_TAX_INPUT.otherLosses),
  };
}
