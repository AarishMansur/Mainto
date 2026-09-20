const features = [
  ["01", "See what matters", "Turn a noisy issue queue into a clear list ranked by urgency."],
  ["02", "Understand faster", "Get concise AI summaries that surface context, impact, and next steps."],
  ["03", "Choose your model", "Bring your own key and work with the AI provider that fits your workflow."],
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-white px-6 py-24 text-black sm:px-10">
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-black/50">Built for maintainers</p>
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <h2 className="max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">A calmer way to triage.</h2>
          <p className="max-w-sm text-black/60">Spend less time sorting notifications and more time making the changes your community needs.</p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-2xl bg-black/10 md:grid-cols-3">
          {features.map(([number, title, description]) => (
            <article key={number} className="bg-white p-7 transition-colors hover:bg-zinc-100">
              <span className="text-sm font-bold text-black/40">{number}</span>
              <h3 className="mt-16 text-xl font-bold">{title}</h3>
              <p className="mt-3 leading-relaxed text-black/60">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
