// 계산기 8페이지 파생 다이제스트 — seoGuides.ts가 여기서 가져가 일반 안내 절보다 앞에 싣는다.
// 처음 네 페이지(증여·상속·ISA·배당)는 누진세율·공제 구조에서 경계와 역전이 나왔고,
// 뒤의 네 페이지(적금·예금·가상자산·해외주식)는 "선형이라 발견이 없다"고 적어 두었던 곳인데
// 실제로 엔진을 축마다 돌려 보니 회차별 예치 기간·이중 반올림·내림 처리·기본공제가
// 각각 계단과 상쇄를 만들고 있었다. 남은 /compound-interest는 두 페이지의 교차 비교에서 다룬다.
export { GIFT_TAX_DIGEST, GIFT_BASE } from "./giftTaxDigest";
export { INHERITANCE_TAX_DIGEST, INHERITANCE_BASE } from "./inheritanceTaxDigest";
export { ISA_DIGEST, ISA_BASE } from "./isaDigest";
export { DIVIDEND_TAX_DIGEST, DIVIDEND_BASE } from "./dividendTaxDigest";
export { SAVINGS_INTEREST_DIGEST, SAVINGS_BASE } from "./savingsInterestDigest";
export { DEPOSIT_INTEREST_DIGEST, DEPOSIT_BASE } from "./depositInterestDigest";
export { CRYPTO_TAX_DIGEST, CRYPTO_BASE } from "./cryptoTaxDigest";
export { FOREIGN_STOCK_TAX_DIGEST, FOREIGN_BASE } from "./foreignStockTaxDigest";
