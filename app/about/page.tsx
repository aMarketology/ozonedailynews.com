import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About OzoneNews | Ozone Network News",
  description: "OzoneNews is an independent digital news network delivering objective, sourced, and verified reporting across finance, technology, politics, and world affairs.",
  alternates: { canonical: `${SITE_CONFIG.url}/about` },
};

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-serif font-bold text-3xl sm:text-4xl text-gray-900 mb-6">About OzoneNews</h1>
      <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
        <p>
          OzoneNews is the flagship publication of Ozone Network News LLC, an independent digital media company dedicated
          to objective, sourced, and verified journalism across finance, technology, politics, and world affairs.
        </p>
        <p>
          Every story published on OzoneNews is produced under our{" "}
          <Link href="/editorial-standards" className="text-blue-600 hover:text-blue-800 underline">Editorial Standards</Link>,
          which require named sourcing, data verification, and author accountability for every published claim.
        </p>
        <h2 className="font-serif font-bold text-xl text-gray-900 mt-10 mb-3">Our Mission</h2>
        <p>
          To provide fast, accurate, and deeply reported news for professionals, investors, and readers who demand
          more than surface-level coverage. We cover markets when they move, technology when it shifts, and policy when it matters.
        </p>
        <h2 className="font-serif font-bold text-xl text-gray-900 mt-10 mb-3">AI Transparency</h2>
        <p>
          <strong>AI-Assisted, Human-Verified.</strong> This publication uses advanced language models for initial
          research and structural drafting. 100% of factual claims, data points, and analysis are manually
          cross-checked and verified by our editorial team before publication.
        </p>
        <h2 className="font-serif font-bold text-xl text-gray-900 mt-10 mb-3">Leadership</h2>
        <p>
          OzoneNews is owned and operated by{" "}
          <Link href="/authors/max-deleonardis" className="text-blue-600 hover:text-blue-800 underline">Max DeLeonardis</Link>.
          Day-to-day editorial operations are directed by{" "}
          <Link href="/authors/simon-minter" className="text-blue-600 hover:text-blue-800 underline">Simon Alfred Minter</Link>,
          Chief of Staff, who oversees reporting teams across all coverage verticals.
        </p>
        <h2 className="font-serif font-bold text-xl text-gray-900 mt-10 mb-3">Contact</h2>
        <p>
          Editorial inquiries: <a href={`mailto:${SITE_CONFIG.email}`} className="text-blue-600 hover:text-blue-800 underline">{SITE_CONFIG.email}</a>
        </p>
        <div className="flex flex-wrap gap-4 mt-10 pt-8 border-t border-gray-200 text-sm">
          <Link href="/editorial-standards" className="text-blue-600 hover:text-blue-800 underline">Editorial Standards</Link>
          <Link href="/corrections" className="text-blue-600 hover:text-blue-800 underline">Corrections Policy</Link>
          <Link href="/contact" className="text-blue-600 hover:text-blue-800 underline">Contact</Link>
        </div>
      </div>
    </main>
  );
}
