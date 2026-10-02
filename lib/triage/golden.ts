import type { GitHubIssueDraft } from "@/lib/sanity-issue";
import type { Priority } from "@/lib/triage/precedent";

export interface GoldenCase {
  title: string;
  labels: string[];
  expected: Priority;
}

export const GOLDEN: GoldenCase[] = [
  { title: "App crashes on login for all users", labels: ["bug"], expected: "P0" },
  { title: "Typo in the login page heading", labels: ["docs"], expected: "P4" },
  { title: "Data loss when saving large project files", labels: ["bug"], expected: "P0" },
  { title: "Add dark mode toggle to the settings panel", labels: ["enhancement"], expected: "P3" },
  { title: "Memory leak crashes the server under load", labels: ["bug"], expected: "P1" },
  { title: "Improve wording of the memory usage tooltip", labels: ["docs"], expected: "P4" },
];

export const ADVERSARIAL_PAIRS: [string, string][] = [
  ["App crashes on login for all users", "Typo in the login page heading"],
  ["Memory leak crashes the server under load", "Improve wording of the memory usage tooltip"],
];

export function goldenIssue(title: string, labels: string[] = []): GitHubIssueDraft {
  return {
    githubId: 1,
    repoOwner: "acme",
    repoName: "app",
    title,
    body: null,
    labels,
    commentsCount: 0,
  };
}
