"use client";

import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";
import { FeaturesSection } from "./components/features-section";
import { HowItWorksSection } from "./components/how-it-works-section";
import { PricingSection } from "./components/pricing-section";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <div id="top" className="w-full bg-black text-white">
      <section className="relative flex min-h-screen flex-col overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-image.png')" }}
        />

        <nav className={`fixed left-1/2 top-4 z-50 flex -translate-x-1/2 items-center justify-center rounded-full bg-white/90 backdrop-blur-md transition-[width,gap,padding] duration-500 ease-out ${scrolled ? "w-[calc(100%-3rem)] gap-2 px-3 py-1.5 md:w-[52%]" : "w-[calc(100%-2rem)] gap-5 px-4 py-2.5 md:w-[60%]"}`}>
        <Link href="#top" onClick={(event) => scrollToSection(event, "top")} className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Maintainer Copilot home" className="h-12 w-12 rounded-lg object-contain" />
          <span className="text-lg font-bold tracking-tight text-black">Maintainer Copilot</span>
        </Link>

        <div className={`hidden items-center text-sm font-medium text-black transition-[gap] duration-500 md:flex ${scrolled ? "gap-3" : "gap-6"}`}>
          <a href="#features" onClick={(event) => scrollToSection(event, "features")} className="hover:opacity-70 transition-opacity">Features</a>
          <a href="#how-it-works" onClick={(event) => scrollToSection(event, "how-it-works")} className="hover:opacity-70 transition-opacity">How It Works</a>
          <a href="#pricing" onClick={(event) => scrollToSection(event, "pricing")} className="hover:opacity-70 transition-opacity">Pricing</a>
        </div>

        <Link
          href="/app"
          className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-zinc-800"
        >
          Open App
        </Link>
        </nav>

        <main className="relative z-10 flex flex-1 flex-col items-center justify-start px-6 pt-32 text-center md:pt-36">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white backdrop-blur-sm border border-black/20 text-sm text-black font-medium mb-5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Open Source &mdash; Free forever
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] max-w-4xl mb-4 text-black">
          Issues<span className="text-white">.</span>Priority<span className="text-white">.</span>OSS
          
        </h1>

        <p className="  md:text-lg font-sans text-slate-950 max-w-xl mb-8 leading-relaxed">
          AI-powered triage for maintainers. Cut through the noise and ship what matters.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/app"
            className="group px-7 py-3 text-base font-medium rounded-full bg-white text-black  transition-all w-full sm:w-auto text-center"
          >
            <span className="inline-flex items-center gap-1">
              Get Started
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
            </span>
          </Link>
          <a
            href="#how-it-works"
            onClick={(event) => scrollToSection(event, "how-it-works")}
            className="group flex items-center gap-2 px-7 py-3  font-medium rounded-full border border-black/30 text-black hover:bg-white transition-all w-full sm:w-auto text-center"
          >
            <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            See How It Works
          </a>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-bold text-white">
          <span>No signup required</span>
          <span>·</span>
          <span>Bring your own API key</span>
          <span>·</span>
          <span>10 AI providers supported</span>
        </div>
        </main>
      </section>
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
    </div>
  );
}
