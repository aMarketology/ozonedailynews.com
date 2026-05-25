import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Editorial Standards | OzoneNews",
  description: "OzoneNews editorial standards, sourcing policies, AI attribution, and verification procedures for all published content.",
  alternates: { canonical: `${SITE_CONFIG.url}/editorial-standards` },
};

export default function EditorialStandardsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-serif font-bold text-3xl sm:text-4xl text-gray-900 mb-6">Editorial Standards</h1>
      <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
        <p>
          OzoneNews publishes only accurate, sourced, and independently verified information.
          These standards apply to every article, update, and analysis published on this platform.
        </p>

        <h2 className="font-serif font-bold text-xl text-gray-900 mt-10 mb-3">Sourcing Requirements</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Every published claim must be traceable to a primary source (official release, data provider, on-record statement, or verified public record).</li>
          <li>At least one external source link is required per article.</li>
          <li>Anonymous sourcing is disclosed and used only when the source would face credible risk of harm by going on record.</li>
        </ul>

        <h2 className="font-serif font-bold text-xl text-gray-900 mt-10 mb-3">AI Attribution Policy</h2>
        <p>
          <strong>AI-Assisted, Human-Verified.</strong> OzoneNews uses large language models for initial research,
          structural drafting, and formatting. All factual claims, figures, prices, and analysis are manually
          cross-checked by a named editor or author before publication.
        </p>
        <p>
          Articles are not published unless a human author or editor has reviewed and approved the final text.
          The author named on a byline is personally accountable for accuracy.
        </p>

        <h2 className="font-serif font-bold text-xl text-gray-900 mt-10 mb-3">Corrections</h2>
        <p>
          Factual errors are corrected promptly. See our{" "}
          <Link href="/corrections" className="text-blue-600 hover:text-blue-800 underline">Corrections Policy</Link> for the full procedure.
        </p>

        <h2 className="font-serif font-bold text-xl text-gray-900 mt-10 mb-3">Ownership</h2>
        <p>
          OzoneNews is operated by {SITE_CONFIG.legalName}. We accept no paid editorial content,
          sponsored stories, or advertiser-influenced news coverage.
        </p>

        <div className="flex flex-wrap gap-4 mt-10 pt-8 border-t border-gray-200 text-sm">
          <Link href="/about" className="text-blue-600 hover:text-blue-800 underline">About OzoneNews</Link>
          <Link href="/corrections" className="text-blue-600 hover:text-blue-800 underline">Corrections</Link>
          <Link href="/contact" className="text-blue-600 hover:text-blue-800 underline">Contact</Link>
        </div>
      </div>
    </main>
  );
}
