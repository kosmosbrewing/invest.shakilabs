import { z } from "zod";

/**
 * 숫자 입력의 범위 정의와 클램프 — loan.shakilabs `client/src/lib/validators.ts`에서 이식.
 *
 * 예전 invest의 sanitize는 zod safeParse가 실패하면 **필드 기본값**으로 되돌렸다.
 * 그래서 매도금액 70,000,000.5를 넣으면 조용히 기본값 50,000,000으로 계산되고
 * 화면에는 오류 표시가 없어, 사용자가 넣은 값과 결과가 어긋난 채 남는 오답이 났다.
 * 다이제스트가 엔진을 직접 호출하므로 그 오답이 산문에까지 실렸다.
 *
 * 지금은 범위 밖 입력을 기본값이 아니라 **경계로 클램프**하고, 잘린 사실을
 * clampNoticesFor()로 화면에 알린다. 숫자로 읽을 수 없는 값만 기본값으로 간다.
 *
 * 상한은 필드마다 한 번만 적는다 — zod `.max()`는 덧씌워지지 않고 누적되어
 * 작은 값이 이기므로, 기본 스키마에 뷰별 상한을 얹으면 조용히 무효가 된다(loan 전례).
 */
export interface NumField {
  schema: z.ZodType<number>;
  min: number;
  max: number;
  int: boolean;
  /** 클램프 알림에 쓰는 한국어 라벨 */
  label: string;
}

export function numField(label: string, min: number, max: number, int = true): NumField {
  const base = z.coerce.number().min(min).max(max);
  return { schema: int ? base.int() : base, min, max, int, label };
}

export interface ClampNotice {
  key: string;
  label: string;
  entered: number;
  applied: number;
}

/** 입력이 범위 밖이라 잘린 필드 목록. 비어 있으면 입력 그대로 계산된 것이다. */
export function clampNoticesFor(
  fields: Record<string, NumField>,
  input: Record<string, unknown> | undefined,
): ClampNotice[] {
  const notices: ClampNotice[] = [];
  for (const [key, field] of Object.entries(fields)) {
    const raw = input?.[key];
    // 숫자가 아닌 값은 클램프가 아니라 기본값 복귀이므로 알리지 않는다
    if (typeof raw !== "number" || !Number.isFinite(raw)) continue;
    if (raw >= field.min && raw <= field.max) continue;
    notices.push({
      key,
      label: field.label,
      entered: raw,
      applied: Math.min(field.max, Math.max(field.min, raw)),
    });
  }
  return notices;
}

/**
 * 숫자 하나를 읽어 범위 안으로 클램프한다. 범위 밖이어도 기본값으로 되돌리지 않는다 —
 * 500억을 넣은 사용자에게 기본값 결과를 보여 주는 조용한 오답보다, 상한으로 잘린 결과가 정직하다.
 */
export function readNumber(field: NumField, value: unknown, fallback: number): number {
  if (value === null || value === undefined || value === "" || typeof value === "boolean") return fallback;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  const clamped = Math.min(field.max, Math.max(field.min, n));
  return field.int ? Math.round(clamped) : clamped;
}

export function readAllNumbers<T extends Record<string, NumField>>(
  fields: T,
  input: Partial<Record<keyof T, unknown>> | undefined,
  defaults: Record<keyof T, number>,
): Record<keyof T, number> {
  const out = {} as Record<keyof T, number>;
  for (const key of Object.keys(fields) as (keyof T)[]) {
    out[key] = readNumber(fields[key], input?.[key], defaults[key]);
  }
  return out;
}

type SchemaOf<T extends Record<string, NumField>> = { [K in keyof T]: T[K]["schema"] };

/** FIELDS 한 곳에서 zod 스키마를 파생시킨다 — 스키마와 sanitize가 같은 범위를 읽게 하기 위함 */
export function schemasOf<T extends Record<string, NumField>>(fields: T): SchemaOf<T> {
  return Object.fromEntries(Object.entries(fields).map(([k, f]) => [k, f.schema])) as SchemaOf<T>;
}

/** 열거형·불리언처럼 클램프 개념이 없는 값은 유효하지 않으면 기본값으로 간다 */
export function readEnum<T extends string>(values: readonly T[], value: unknown, fallback: T): T {
  return typeof value === "string" && (values as readonly string[]).includes(value) ? (value as T) : fallback;
}

export function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}
