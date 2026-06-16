import { describe, expect, it } from "vitest";
import { parseSseStream } from "../src/parseSseStream";

describe("parseSseStream", () => {
  it("parses message and done events", async () => {
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode('event: message\ndata: {"content":"hi"}\n\n'),
        );
        controller.enqueue(new TextEncoder().encode("event: done\ndata: {}\n\n"));
        controller.close();
      },
    });

    const events = [];
    for await (const e of parseSseStream(body)) {
      events.push(e);
    }
    expect(events).toEqual([
      { type: "message", chunk: { content: "hi" } },
      { type: "done" },
    ]);
  });
});
