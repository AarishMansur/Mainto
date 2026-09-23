const MAX_ID_LENGTH = 128

function encodePart(value: string) {
  return Array.from(value)
    .map((char) => {
      if (/^[a-zA-Z0-9]$/.test(char)) return char
      if (char === "-") return "-h-"
      if (char === "_") return "-u-"
      if (char === ".") return "-d-"
      return `-x${(char.codePointAt(0) ?? 0).toString(16)}-`
    })
    .join("")
}

function hashId(owner: string, repo: string, githubId: number) {
  const key = `${owner}/${repo}#${githubId}`
  let hash = BigInt("0xcbf29ce484222325")
  const prime = BigInt("0x100000001b3")
  const mask = BigInt("0xffffffffffffffff")

  for (const char of key) {
    hash ^= BigInt(char.codePointAt(0) ?? 0)
    hash = (hash * prime) & mask
  }

  return `issue_${hash.toString(16).padStart(16, "0")}_${githubId}`
}

// Dots are valid ID characters, but a dot makes the document a private Sanity path.
// Underscores keep the issue on the public root path while staying unique per repo.
export function issueDocumentId(owner: string, repo: string, githubId: number) {
  const id = `issue_${encodePart(owner)}_${encodePart(repo)}_${githubId}`
  if (id.length <= MAX_ID_LENGTH) return id
  return hashId(owner, repo, githubId)
}
