import { construct } from "../denops/codic/construction.ts";
import { CodicResponse } from "../denops/codic/codic.ts";
import { assertEquals, assertStringIncludes } from "./dev_deps.ts";

const sampleResponse: CodicResponse = {
  successful: true,
  text: "テスト",
  "translated_text": "test",
  words: [
    {
      successful: true,
      text: "テスト",
      "translated_text": "test",
      candidates: [
        { text: "test" },
        { text: "exam" },
      ],
    },
  ],
};

Deno.test({
  name: "if exists multiple candidates, include all of those",
  fn: () => {
    const constructed = construct([sampleResponse]);
    for (const word of sampleResponse.words) {
      for (const candidate of word.candidates) {
        assertStringIncludes(constructed[1], candidate.text);
      }
    }
  },
});

Deno.test({
  name: "if gave multiple inputs, return all",
  fn: () => {
    const responses = [sampleResponse, sampleResponse];
    const constructed = construct(responses);
    let length = responses.length * 2;
    for (const response of responses) {
      length += response.words.length;
    }
    assertEquals(constructed.length, length);
  },
});
