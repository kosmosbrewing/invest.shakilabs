// 파생 다이제스트 공용 포매터 (invest 앱).
//
// 다이제스트 산문의 숫자는 전부 엔진 실행값이라, 문장 안에서 숫자를 손으로 적는 일이 없어야 한다.
// 여기 함수만 거치게 하면 "계산기는 98,940,000원인데 산문은 9,894만원" 같은 드리프트가 생길 수 없다.
// 증여액·상속재산·수익률·다른 종합소득처럼 사용자가 고르는 값은 사실이 아니라 파라미터라,
// 산문에서 "가정"이라고 밝힌다(YMYL: 상속·증여세는 개인 상황에 따라 결과가 크게 갈린다).

export interface Finding {
  /** SeoRichGuide가 h3로 렌더한다. 결론을 그대로 담은 한 줄이어야 스캔이 된다. */
  h2: string;
  body: string;
}

export function won(value: number): string {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

/** 1,020,000 → "102만원", 855,000,000 → "8억 5,500만원", 3,000,000,000 → "30억원" */
export function manwon(value: number): string {
  const sign = value < 0 ? "-" : "";
  const man = Math.round(Math.abs(value) / 10_000);
  if (man < 10_000) return `${sign}${man.toLocaleString("ko-KR")}만원`;
  const eok = Math.floor(man / 10_000);
  const rest = man % 10_000;
  return rest === 0 ? `${sign}${eok}억원` : `${sign}${eok}억 ${rest.toLocaleString("ko-KR")}만원`;
}

/** 0.154 → "15.4%". 세율은 소수 셋째 자리까지 의미가 있어 자릿수를 인자로 받는다(일본 15.315%). */
export function pct(ratio: number, digits = 2): string {
  return `${Number((ratio * 100).toFixed(digits)).toString()}%`;
}

/** 비율 차이는 %가 아니라 %p — "70%와 39%의 차이 31%"로 읽히면 오독이다. */
export function pp(diffInPercentPoints: number, digits = 2): string {
  return `${Number(diffInPercentPoints.toFixed(digits)).toString()}%p`;
}

export function times(a: number, b: number, digits = 2): string {
  return `${(a / b).toFixed(digits)}배`;
}

export function num(value: number, digits = 0): string {
  return Number(value.toFixed(digits)).toLocaleString("ko-KR");
}

/** 3 → "3명", 자녀 수처럼 사람 수를 셀 때 */
export function people(count: number): string {
  return `${count}명`;
}

/** 3 → "3년" */
export function years(count: number): string {
  return `${count}년`;
}

// 숫자 포매터 뒤에 붙는 조사 — "원"(받침 ㄴ)·"%"·"배"·"명"·"년"이 섞이므로 고정 조사를 쓰면 "원로"가 된다.
function hasFinalConsonant(word: string): boolean {
  const last = word.charCodeAt(word.length - 1);
  const isHangul = last >= 0xac00 && last <= 0xd7a3;
  return isHangul && (last - 0xac00) % 28 !== 0;
}
function finalIsRieul(word: string): boolean {
  const last = word.charCodeAt(word.length - 1);
  const isHangul = last >= 0xac00 && last <= 0xd7a3;
  return isHangul && (last - 0xac00) % 28 === 8;
}
/** 은/는 */
export function eun(word: string): string { return `${word}${hasFinalConsonant(word) ? "은" : "는"}`; }
/** 을/를 */
export function eul(word: string): string { return `${word}${hasFinalConsonant(word) ? "을" : "를"}`; }
/** 이/가 */
export function ga(word: string): string { return `${word}${hasFinalConsonant(word) ? "이" : "가"}`; }
/** (으)로 */
export function ro(word: string): string { return `${word}${hasFinalConsonant(word) && !finalIsRieul(word) ? "으로" : "로"}`; }
/** 와/과 */
export function wa(word: string): string { return `${word}${hasFinalConsonant(word) ? "과" : "와"}`; }
/** (이)다 — 결론형 h3의 종결에 쓴다. 본문은 존댓말이므로 imnida를 쓴다. */
export function ida(word: string): string { return `${word}${hasFinalConsonant(word) ? "이다" : "다"}`; }
/** 입니다 — 본문 종결. 받침과 무관하게 형태가 같아 분기가 필요 없다. */
export function imnida(word: string): string { return `${word}입니다`; }
