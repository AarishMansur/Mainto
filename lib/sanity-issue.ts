import { client } from "@/sanity/lib/client"
import { issueDocumentId } from "@/lib/issue-document-id"

const WORKFLOW_RANK: Record<string, number> = {
  new: 0,
  summarized: 1,
  prioritized: 2,
  in_review: 3,
  resolved: 4,
}

export interface GitHubIssueDraft {
  githubId: number
  repoOwner: string
  repoName: string
  title: string
  body: string | null
  labels: string[]
  commentsCount: number
  state?: string
  url?: string
}

export interface IssueWorkflowUpdate {
  workflowStatus: "summarized" | "prioritized"
  agentPriority?: string
  agentReasoning?: string
  matchedPatternIds?: { _key: string; _type: "reference"; _ref: string }[]
}

function mergeWorkflowStatus(current: string | undefined, next: string) {
  const currentRank = WORKFLOW_RANK[current ?? "new"] ?? 0
  const nextRank = WORKFLOW_RANK[next] ?? 0
  return nextRank >= currentRank ? next : (current ?? "new")
}

export async function saveGitHubIssue(
  issue: GitHubIssueDraft,
  token: string,
  workflow: IssueWorkflowUpdate,
) {
  const _id = issueDocumentId(issue.repoOwner, issue.repoName, issue.githubId)
  const writer = client.withConfig({ useCdn: false, token, stega: false })
  const fields = {
    githubId: issue.githubId,
    repoOwner: issue.repoOwner,
    repoName: issue.repoName,
    title: issue.title,
    body: issue.body,
    state: issue.state || "open",
    labels: issue.labels ?? [],
    commentsCount: issue.commentsCount,
    ...(issue.url ? { githubUrl: issue.url } : {}),
    fetchedAt: new Date().toISOString(),
  }

  await writer.createIfNotExists({
    _id,
    _type: "issue",
    ...fields,
    workflowStatus: "new",
  })

  const existing = (await writer.getDocument(_id)) as { workflowStatus?: string } | undefined

  await writer
    .patch(_id)
    .set({
      ...fields,
      workflowStatus: mergeWorkflowStatus(existing?.workflowStatus, workflow.workflowStatus),
      ...(workflow.agentPriority !== undefined ? { agentPriority: workflow.agentPriority } : {}),
      ...(workflow.agentReasoning !== undefined ? { agentReasoning: workflow.agentReasoning } : {}),
      ...(workflow.matchedPatternIds !== undefined
        ? { matchedPatternIds: workflow.matchedPatternIds }
        : {}),
    })
    .commit()

  return _id
}
