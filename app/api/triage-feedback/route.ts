import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { applyHumanFeedback, PRIORITIES } from "@/lib/triage/precedent";
import { sanityWriteToken } from "@/lib/sanity-token";
import { client } from "@/sanity/lib/client";

const feedbackSchema = z.object({
  decisionId: z.string().min(1),
  humanPriority: z.enum(PRIORITIES),
});

export async function POST(request: NextRequest) {
  try {
    const token = sanityWriteToken();
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

    const feedback = applyHumanFeedback(decision.assignedPriority, humanPriority);

    await writer.patch(decisionId).set(feedback).commit();

    return NextResponse.json({ decisionId, ...feedback });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to record feedback";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
