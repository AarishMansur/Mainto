import Link from "next/link";

export function PricingSection() {
  return (
    <section id="pricing" className="bg-zinc-100 px-6 py-24 text-black sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-black/50">Simple by design</p>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Free for open source.</h2>
          <p className="mt-4 max-w-md text-black/60">No subscriptions. Use your own API key and keep control of your data.</p>
        </div>
        <Link href="/app" className="rounded-full bg-black px-6 py-3 font-medium text-white transition-transform hover:scale-105">Open the app &rarr;</Link>
      </div>
    </section>
  );
}
