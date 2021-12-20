import { assertStrictEquals, assertRejects } from "./dev_deps.ts";
import { codic } from "../denops/codic/codic.ts";

const MOCK_404 = async (): Promise<Response> => {
  return await new Response(
    null,
    { status: 404, statusText: "test", headers: { "title": "test" } },
  );
};

const MOCK_200 = async (): Promise<Response> => {
  return await new Response(
    '{"this_is": "test"}',
    {
      status: 200,
      statusText: "test",
      headers: { "content-type": "application/json" },
    },
  );
};

const token = "token for test";

Deno.test({
  name: "if length of texts is larger than 3, throw error.",
  fn: () => {
    assertRejects(
      () => codic(["one", "two", "three", "four"], token),
      Error,
    );
  },
});

Deno.test({
  name: "if status is not 200, throw error",
  fn: () => {
    window.fetch = MOCK_404;
    assertRejects(
      () => codic(["test"], token),
      Error,
    );
  },
});

Deno.test({
  name: "if get status 200, return object",
  fn: () => {
    window.fetch = MOCK_200;
    assertStrictEquals(typeof codic(["test"], token), "object");
  },
});
