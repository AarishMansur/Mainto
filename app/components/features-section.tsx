import { motion } from "framer-motion"

const issues = [
  { id: "#482", title: "Auth redirect loop", status: "High", type: "danger" },
  { id: "#441", title: "Deploy config mismatch", status: "Medium", type: "warning" },
  { id: "#399", title: "Search results stale", status: "Low", type: "neutral" },
  { id: "#376", title: "Webhook retry burst", status: "High", type: "danger" },
  { id: "#338", title: "Release notes missing", status: "Medium", type: "warning" },
  { id: "#310", title: "CI cache restore bug", status: "Low", type: "neutral" },
  { id: "#292", title: "Token refresh race", status: "High", type: "danger" },
  { id: "#281", title: "Docs link breakage", status: "Medium", type: "warning" },
  { id: "#264", title: "CSV export timeout", status: "Low", type: "neutral" },
  { id: "#240", title: "Latency spike on API", status: "High", type: "danger" },
]

const featureCards = [
  {
    title: "AI issue summaries",
    text: "Turn long threads into clear action plans in seconds.",
  },
  {
    title: "Priority scoring",
    text: "Spot the issues that are blocking users or releases first.",
  },
  {
    title: "Open-source ready",
    text: "Use your own API key and keep full control of your workflow.",
  },
]

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    High: "bg-red-500/10 text-red-700",
    Medium: "bg-amber-500/10 text-amber-700",
    Low: "bg-emerald-500/10 text-emerald-700",
  }

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${styles[status] ?? "bg-zinc-200 text-zinc-700"}`}>
      {status}
    </span>
  )
}

export function FeaturesSection() {
  return (
    <section id="features" className="bg-white px-6 py-24 text-black sm:px-10">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 max-w-2xl"
        >
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-black/50">Features</p>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Effortless maintainer workflows, built around the work that matters.
          </h2>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr] lg:items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-[26px] border border-black/10 bg-zinc-50 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.05)]"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
            </div>

            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs text-black/55">Active issue queue</p>
                <h3 className="mt-0.5 text-2xl font-semibold tracking-tight">24 items</h3>
              </div>
              <div className="rounded-lg bg-black px-2 py-1 text-right text-white shadow-sm">
                <p className="text-[8px] uppercase tracking-[0.2em] text-white/70">Today</p>
                <p className="text-sm font-semibold">+18%</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-zinc-50 text-black/55">
                  <tr>
                    <th className="px-2.5 py-1.5 font-medium">Issue</th>
                    <th className="px-2.5 py-1.5 font-medium">Priority</th>
                    <th className="px-2.5 py-1.5 text-right font-medium">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue) => (
                    <tr key={issue.id} className="border-t border-black/5">
                      <td className="px-2.5 py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-[9px] font-semibold text-zinc-700">
                            {issue.id.replace('#', '')}
                          </div>
                          <span className="font-medium text-black text-[13px]">{issue.title}</span>
                        </div>
                      </td>
                      <td className="px-2.5 py-2">
                        <StatusBadge status={issue.status} />
                      </td>
                      <td className="px-2.5 py-2 text-right text-black/60 text-[12px]">2h ago</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <div className="grid gap-4">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="rounded-[22px] border border-black/10 bg-zinc-100 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.04)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/60">
                  AI summary
                </span>
                <span className="text-xs text-black/50">2 min</span>
              </div>

              <h3 className="text-2xl font-semibold tracking-tight">Issue #482</h3>
              <p className="mt-2 text-sm leading-6 text-black/70">
                User reports a redirect loop after login. This is affecting the onboarding flow and appears to be triggered by a stale session redirect.
              </p>

              <div className="mt-4 space-y-2.5">
                <div className="rounded-2xl border border-black/10 bg-white p-2.5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-black/50">Likely cause</p>
                  <p className="mt-1 text-sm font-medium text-black">Session validation mismatch</p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white p-2.5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-black/50">Recommended action</p>
                  <p className="mt-1 text-sm font-medium text-black">Patch auth redirect + review release notes</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.16 }}
              className="rounded-[22px] border border-black/10 bg-black p-4 text-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">Priority score</span>
                <span className="text-sm font-medium text-white/80">92/100</span>
              </div>

              <div className="mt-4 grid grid-cols-5 items-end gap-2">
                {[34, 53, 67, 74, 92].map((height, index) => (
                  <div key={height} className="flex h-16 items-end justify-center rounded-t-xl bg-white/10">
                    <div
                      className={`w-full rounded-t-xl ${index === 4 ? "bg-white" : "bg-white/70"}`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ))}
              </div>

              <p className="mt-3 text-sm leading-6 text-white/75">
                Urgency spikes when multiple users report the same issue, helping you focus on the work that changes release health.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {featureCards.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 * index }}
              className="rounded-[28px] border border-black/10 bg-zinc-50 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.03)]"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xs font-bold text-black shadow-sm ring-1 ring-black/5">
                  0{index + 1}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/50">feature</span>
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-black">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-black/65">{card.text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
