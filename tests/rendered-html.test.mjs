import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Russian learning platform", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Русский для жизни · По-русски<\/title>/i);
  assert.match(html, /Добрый день!/);
  assert.match(html, /Потренируемся\?/);
  assert.match(html, /Повторение/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("ships the requested modules, exercise types, and flashcards", async () => {
  const [data, app] = await Promise.all([
    readFile(new URL("../app/course-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/learning-app.tsx", import.meta.url), "utf8"),
  ]);

  for (const id of [
    "acc-inanimate-singular",
    "acc-inanimate-plural",
    "acc-animate-singular",
    "acc-animate-plural",
    "acc-adjectives-pronouns-singular",
    "acc-adjectives-pronouns-plural",
    "verbs-present-imperfective",
    "verbs-past-imperfective",
    "verbs-aspect-pairs",
    "verbs-future-aspects",
  ]) assert.match(data, new RegExp(id));

  assert.match(data, /\["учил", "выучил"\]/);
  assert.match(data, /export const flashcards/);
  assert.match(app, /isCorrect/);
  assert.match(app, /setCardFlipped/);
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});
