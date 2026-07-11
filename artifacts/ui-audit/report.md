# UI 및 코드 품질 개선 결과

## 1. 요약
- 서비스: Invest; 초기 이슈 5개, 해결 5개, 잔여 0개.
- 현재 이슈: P0 0 / P1 0 / P2 0 / P3 0.
- 최종 gate: typecheck PASS, test PASS, build PASS, lint PASS.
- 브라우저: 1440x900 기본, 390x844 기본, 320x568 200% text의 대표 Critical 3개 조합 PASS.
- DOM: 상태 200, page overflow 0, h1 1개, visible unlabeled control 0, 좁은 텍스트 0, console/page/API 오류 0.
- Lighthouse 접근성 100, Best Practices 100.
- PC·태블릿·모바일 판정: 최종 대표 조합 PASS. 초기 전체 감사 증거는 로컬 raw artifact로 보존했습니다.
- 코드 판정: 이번 감사 범위의 열린 코드 품질 이슈가 없습니다.

## 2. 최종 검증
| 조합 | 결과 | 근거 |
|---|---|---|
| 1440x900 default | PASS | status·overflow·heading·label·console 자동 측정 |
| 390x844 default | PASS | 모바일 UI와 touch/text 재측정 |
| 320x568 text 200% | PASS | page width와 narrow text 재측정 |
| typecheck → test → build | PASS | 저장소 로컬 명령 |

- 추가 검증: 27개 모바일 대표 라우트에서 12px 미만 판단 텍스트 0, 24px 미만 독립 target 0, document overflow 0.
- 미검증: Firefox, WebKit, 실제 화면낭독기 발화, OS 글꼴 확대, 승인된 visual baseline, 운영 API 쓰기 동작.
- 최종 스크린샷: `../../../artifacts/ui-audit-all/screenshots/final/`.

## 3. 해결 이력
| ID | 초기 심각도 | 초기 문제 | 상태 |
|---|---|---|---|
| INV-AUD-001 | P1 | 200% 확대에서 page overflow 51px와 한 글자 열 붕괴가 발생합니다. | resolved |
| INV-AUD-002 | P1 | 취득가·양도가·필요경비 3개 핵심 input에 label이 연결되지 않았습니다. | resolved |
| INV-AUD-003 | P2 | 모든 검사 라우트에서 페이지 폭이 331px로 11px 넘칩니다. | resolved |
| INV-AUD-004 | P2 | 탭·배지·상태 텍스트 대비가 2.59:1~3.85:1입니다. | resolved |
| INV-AUD-005 | P2 | 12px 미만 텍스트 최대 25개, 24px 미만 조작 대상 최대 15개가 측정됩니다. | resolved |

## 4. 열린 문제
전체 machine-readable 필드는 [issues.json](./issues.json)에 있습니다.

현재 열린 제품 이슈가 없습니다.

## 5. 검증 한계
- Lighthouse는 대표 Critical 화면만 검사하며 수동 접근성 검사를 대체하지 않습니다.
- 운영 백엔드·외부 데이터 성공을 추정하지 않았고, 개발 기본값은 명시적 local/offline 상태로 검증했습니다.
- raw screenshots·Lighthouse JSON·임시 스크립트는 .gitignore로 제외하고 본 보고서와 issues.json만 추적합니다.
