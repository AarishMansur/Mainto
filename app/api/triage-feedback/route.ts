import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { client } from "@/sanity/lib/client";

const feedbackSchema = z.object({
  decisionId: z.string().min(1),
  humanPriority: z.enum(["P0", "P1", "P2", "P3", "P4"]),
});

export async function POST(request: NextRequest) {
  try {
    const token = process.env.NEXT_PUBLIC_SANITY_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Sanity write token is not configured" },
        { status: 500 }
      );
    }

    const parsed = feedbackSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "decisionId and a valid humanPriority are required" },
        { status: 400 }
      );
    }

    const { decisionId, humanPriority } = parsed.data;
    const writer = client.withConfig({ useCdn: false, token, stega: false });

    const decision = (await writer.getDocument(decisionId)) as
      | { assignedPriority?: string }
      | undefined;
    if (!decision) {
      return NextResponse.json({ error: "Decision not found" }, { status: 404 });
    }

    const agentAccuracy = decision.assignedPriority === humanPriority ? 100 : 0;

    await writer.patch(decisionId).set({ humanPriority, agentAccuracy }).commit();

    return NextResponse.json({ decisionId, humanPriority, agentAccuracy });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to record feedback";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
