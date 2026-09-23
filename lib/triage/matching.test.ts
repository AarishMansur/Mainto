import { describe, expect, it } from "vitest";
import type { GitHubIssueDraft } from "@/lib/sanity-issue";
import {
  findMatchingPatterns,
  findSimilarDecisions,
  significantWords,
  type HistoricalDecision,
  type HistoricalPattern,
} from "@/lib/triage/matching";

type Priority = "P0" | "P1" | "P2" | "P3" | "P4";

interface GoldenCase {
  title: string;
  labels: string[];
  expected: Priority;
}

function issue(title: string, labels: string[] = []): GitHubIssueDraft {
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

function decision(title: string, priority: Priority): HistoricalDecision {
  return {
    assignedPriority: priority,
    resolution: "",
    agentAccuracy: null,
    issueRef: { title, labels: [] },
  };
}

const GOLDEN: GoldenCase[] = [
  { title: "App crashes on login for all users", labels: ["bug"], expected: "P0" },
  { title: "Typo in the login page heading", labels: ["docs"], expected: "P4" },
  { title: "Data loss when saving large project files", labels: ["bug"], expected: "P0" },
  { title: "Add dark mode toggle to the settings panel", labels: ["enhancement"], expected: "P3" },
  { title: "Memory leak crashes the server under load", labels: ["bug"], expected: "P1" },
  { title: "Improve wording of the memory usage tooltip", labels: ["docs"], expected: "P4" },
];

const ADVERSARIAL_PAIRS: [string, string][] = [
  ["App crashes on login for all users", "Typo in the login page heading"],
  ["Memory leak crashes the server under load", "Improve wording of the memory usage tooltip"],
];

describe("golden fixture integrity", () => {
  it("keeps adversarial pairs on opposite ends of the scale", () => {
    for (const [a, b] of ADVERSARIAL_PAIRS) {
      const left = GOLDEN.find((c) => c.title === a);
      const right = GOLDEN.find((c) => c.title === b);
      expect(left, `missing golden case: ${a}`).toBeDefined();
      expect(right, `missing golden case: ${b}`).toBeDefined();
      expect(left!.expected).not.toBe(right!.expected);
    }
  });
});

describe("findSimilarDecisions", () => {
  it("does not treat adversarial near-duplicates as similar", () => {
    for (const [a, b] of ADVERSARIAL_PAIRS) {
      const matches = findSimilarDecisions(issue(a), [decision(b, "P4")]);
      expect(matches, `false match: "${a}" vs "${b}"`).toHaveLength(0);
    }
  });

  it("matches issues that share multiple significant words", () => {
    const matches = findSimilarDecisions(issue("Login crashes for every signed in user"), [
      decision("Login crashes when a user opens dashboard", "P0"),
    ]);
    expect(matches).toHaveLength(1);
  });

  it("ignores empty titles", () => {
    const matches = findSimilarDecisions(issue(""), [decision("anything at all here", "P2")]);
    expect(matches).toHaveLength(0);
  });
});

describe("findMatchingPatterns", () => {
  const pattern: HistoricalPattern = {
    _id: "p1",
    patternName: "security",
    keywords: ["security", "vulnerability", "token"],
    labelPatterns: ["security"],
    avgUrgency: 9,
    typicalResolution: "patch",
    avgResolutionDays: 2,
    learnedFrom: 10,
  };

  it("matches on whole-word keywords", () => {
    const matches = findMatchingPatterns(
      issue("Security vulnerability leaks a token in the auth flow"),
      [pattern]
    );
    expect(matches).toHaveLength(1);
  });

  it("does not match a keyword hiding inside a larger word", () => {
    const boundary: HistoricalPattern = { ...pattern, keywords: ["art"], labelPatterns: [] };
    const matches = findMatchingPatterns(issue("Improve the startup time"), [boundary]);
    expect(matches).toHaveLength(0);
  });

  it("matches on labels", () => {
    const matches = findMatchingPatterns(issue("Unrelated title", ["security"]), [pattern]);
    expect(matches).toHaveLength(1);
  });
});

describe("significantWords", () => {
  it("drops stop words and short tokens", () => {
    expect(significantWords("The app has an issue with login")).toEqual(["login"]);
  });
});
