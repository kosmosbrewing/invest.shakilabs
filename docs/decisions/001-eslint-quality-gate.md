# ADR-001: ESLint 품질 gate 복구

- 상태: Accepted
- 기준일: 2026-07-11

## 배경

`package.json`에 lint 명령은 있지만 ESLint 실행 파일과 Vue·TypeScript parser가 없어 명령이 즉시 실패한다. 따라서 CI와 로컬 점검에서 정적 품질 문제를 발견할 수 없다.

## 결정

다른 ShakiLabs Vue 앱에서 검증 중인 ESLint 9 flat config 조합을 사용한다. ESLint core, Vue plugin, TypeScript plugin/parser, Vue parser, globals를 개발 의존성으로 추가하고 현재 앱의 `src`만 검사한다.

## 결과

- 기존 lint 명령이 실제 품질 gate로 동작한다.
- debugger와 사용하지 않는 변수, Vue template의 미사용 변수를 차단한다.
- 런타임 번들에는 개발 의존성이 포함되지 않는다.

## 롤백

문제가 생기면 이 커밋을 되돌려 설정과 개발 의존성을 함께 제거한다.
