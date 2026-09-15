// 실제 렌더 텍스트에서 GmarketSans 문자셋을 모은다 (소스 grep 금지 —
// docs/BRAND_FONT_SUBSET.md §3). dist가 이미 빌드돼 있고, baseUrl에서
// 서빙 중이어야 한다 (subset-font-brand.mjs가 vite preview로 띄워서 호출한다).
//
// 판정 기준: 직접 텍스트 자식 노드를 가진 "리프" 요소만 대상으로 computed
// font-family의 1순위가 "GmarketSans"인 경우만 수집한다. 조상 요소를 세면
// 자손 텍스트까지 중복 수집되므로 h1/h2 같은 컨테이너 자체가 아니라
// "텍스트가 실제로 매달린 노드"만 판정 대상이다 (아이콘 자식이 섞인 h2도
// 직접 텍스트 노드가 있으면 그 h2가 판정 대상이 된다).
import { chromium } from "playwright-core";

/**
 * @param {object} opts
 * @param {string} opts.baseUrl - e.g. http://localhost:4321/invest
 * @param {string[]} opts.routes - SEO_ROUTES 등, "/"로 시작하는 경로 목록
 * @returns {Promise<{ entries: {text:string, locs:string[]}[], charSet: string[] }>}
 */
export async function collectGmarketRenderedTexts({ baseUrl, routes }) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const found = new Map(); // text -> Set(locs)

    for (const route of routes) {
      const url = baseUrl + route;
      await page.goto(url, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      // eslint-disable-next-line no-undef -- 브라우저 컨텍스트에서 실행됨
      const results = await page.evaluate(() => {
        const out = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
        let node = walker.currentNode;
        while (node) {
          let directText = "";
          for (const child of node.childNodes) {
            if (child.nodeType === Node.TEXT_NODE) directText += child.textContent;
          }
          directText = directText.replace(/\s+/g, " ").trim();
          if (directText) {
            const style = window.getComputedStyle(node);
            const firstFamily = style.fontFamily
              .split(",")[0]
              .trim()
              .replace(/^["']|["']$/g, "");
            if (firstFamily === "GmarketSans") {
              out.push({
                text: directText,
                tag: node.tagName.toLowerCase(),
                cls: typeof node.className === "string" ? node.className : "",
              });
            }
          }
          node = walker.nextNode();
        }
        return out;
      });
      for (const r of results) {
        if (!found.has(r.text)) found.set(r.text, new Set());
        found.get(r.text).add(`${r.tag}.${r.cls}@${route}`);
      }
    }

    const entries = [...found.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], "ko"))
      .map(([text, locs]) => ({ text, locs: [...locs] }));

    const chars = new Set();
    for (const { text } of entries) for (const ch of text) chars.add(ch);
    const charSet = [...chars].sort((a, b) => a.codePointAt(0) - b.codePointAt(0));

    return { entries, charSet };
  } finally {
    await browser.close();
  }
}
