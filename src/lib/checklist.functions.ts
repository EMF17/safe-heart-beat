import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface ChecklistSection {
  title: string;
  items: { task: string; why: string }[];
}

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "sections"],
  properties: {
    summary: { type: "string" },
    sections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "items"],
        properties: {
          title: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["task", "why"],
              properties: { task: { type: "string" }, why: { type: "string" } },
            },
          },
        },
      },
    },
  },
};

export const generateSafetyChecklist = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        situation: z.string().trim().min(10).max(1500),
        region: z.string().trim().min(2).max(120),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured yet.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        instructions:
          "You are a calm, practical home-safety advisor for people who live alone. Create a personalized safety-preparedness checklist based on the person's living situation and region. Consider region-specific hazards (climate, natural disasters, local emergency numbers), health and mobility, home security, a daily check-in routine, emergency contacts, go-bag and supplies. 4-6 sections, 3-6 concrete actionable items each, each with a one-sentence why. Keep a reassuring tone; never give medical diagnoses. Summary: 1-2 sentences.",
        input: `Region: ${data.region}\n\nLiving situation: ${data.situation}`,
        text: { format: { type: "json_schema", name: "checklist", strict: true, schema } },
      }),
    });

    if (!res.ok || !res.body) {
      if (res.status === 429) throw new Error("Too many requests right now — please try again in a minute.");
      if (res.status === 402) throw new Error("AI credits have run out. Please try again later.");
      throw new Error(`Couldn't create your checklist (error ${res.status}).`);
    }

    // Consume the SSE stream server-side and accumulate the output text.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let text = "";
    let refused = false;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buf.indexOf("\n\n")) !== -1) {
        const frame = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        for (const line of frame.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const evt = JSON.parse(payload);
            if (evt.type === "response.output_text.delta") text += evt.delta ?? "";
            if (evt.type === "response.refusal.delta") refused = true;
            if (evt.type === "error" || evt.type === "response.failed") {
              throw new Error("The AI couldn't finish your checklist. Please try again.");
            }
          } catch (e) {
            if (e instanceof Error && e.message.startsWith("The AI")) throw e;
          }
        }
      }
    }
    if (refused || !text) throw new Error("The AI couldn't create a checklist for that description.");
    const parsed = JSON.parse(text) as { summary: string; sections: ChecklistSection[] };
    return parsed;
  });
