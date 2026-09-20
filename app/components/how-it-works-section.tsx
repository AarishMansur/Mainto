const steps = [
  ["01", "Paste your repository", "Start with any public GitHub repository. No account or setup required."],
  ["02", "Scan the queue", "Maintainer Copilot fetches open issues and organizes them by urgency."],
  ["03", "Take the next step", "Read the summary, open the issue, and get back to shipping."],
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-black px-6 py-24 text-white sm:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 max-w-xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-white/45">How it works</p>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">From backlog to next action.</h2>
        </div>
        <div className="grid gap-10 md:grid-cols-3">
          {steps.map(([number, title, description]) => (
            <article key={number} className="border-t border-white/20 pt-5">
              <span className="text-sm font-bold text-white/45">{number}</span>
              <h3 className="mt-12 text-xl font-bold">{title}</h3>
              <p className="mt-3 leading-relaxed text-white/55">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
