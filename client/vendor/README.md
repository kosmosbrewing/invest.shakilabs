# ShakiLabs UI artifact

`shakilabs-ui-0.3.11.tgz` is the active exact artifact for `@shakilabs/ui` 0.3.11.

- Source repository: `00.root-shakilabs` (`kosmosbrewing/00.root-shakilabs`)
- Source commit: `657cf80b72ef4a977b7b34e765b8ddb4ce9fbef7`
- SHA-256: `2c9587d9fd74af697f0a95bc50e39bccf169fb48dcebf37afe5991926b713b54`
- Consumed by: `client/package.json` → `"@shakilabs/ui": "file:vendor/shakilabs-ui-0.3.11.tgz"`
- Rollback artifacts: available from Git history when needed

Only the active exact artifact is committed so an isolated Vercel checkout can run `npm ci` without a private registry token.

## Verify

```sh
shasum -a 256 client/vendor/shakilabs-ui-0.3.11.tgz
node client/scripts/verify-vendor-readme.mjs   # 파일명·이 문서·package.json 3자 대조
```

`verify-vendor-readme.mjs`는 CI의 `Verify vendored artifacts` 스텝에서도 실행되므로,
아래 갱신 절차를 빠뜨리면 CI가 먼저 잡아낸다.

## Update procedure

1. `00.root-shakilabs`에서 새 tgz를 만들고(`npm pack -w packages/ui`) `client/vendor/`에 복사한다. **이전 tgz는 삭제한다**(활성 산출물 1개 유지).
2. `client/package.json`의 `file:vendor/...` 참조를 새 파일명으로 바꾸고 `npm install`로 lockfile을 갱신한다.
3. 이 문서의 **버전·소스 커밋·SHA-256** 세 값을 함께 갱신한다. 해시는 `shasum -a 256`의 실제 출력을 그대로 적는다.
4. `node client/scripts/verify-vendor-readme.mjs`가 통과하는지 확인한 뒤 커밋한다.
