# 투자 계산기 · shakilabs

**▶ 라이브 서비스: <https://shakilabs.com/invest>**

가상자산·배당·해외주식 세금부터 증여·상속세, 예적금 이자·복리까지 투자 세금 계산기 모음.

## 주요 도구

- [가상자산 세금](https://shakilabs.com/invest/crypto-tax)
- [배당소득세](https://shakilabs.com/invest/dividend-tax)
- [해외주식 양도세](https://shakilabs.com/invest/foreign-stock-tax)
- [ISA 만기 비교](https://shakilabs.com/invest/isa)
- [증여세](https://shakilabs.com/invest/gift-tax)
- [상속세](https://shakilabs.com/invest/inheritance-tax)

전체 서비스 12종: <https://shakilabs.com>

## 스택

Vue 3 (Composition API) · TypeScript · Vite · Tailwind CSS · 공유 UI `@shakilabs/ui`
정적 프리렌더/SSG로 배포하며, 계산 로직은 Vitest 경계값 테스트로 검증합니다.

## 개발

```bash
cd client
npm install
npm run dev
```
