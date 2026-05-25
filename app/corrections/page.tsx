import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Corrections Policy | OzoneNews",
  description: "How OzoneNews handles factual errors, updates, and corrections to published articles.",
  alternates: { canonical: `${SITE_CONFIG.url}/corrections` },
};

export default function CorrectionsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-serif font-bold text-3xl sm:text-4xl text-gray-900 mb-6">Corrections Policy</h1>
      <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
        <p>
          OzoneNews is committed to accuracy. When we make factual errors, we correct them promptly, transparently, and without removing the original record.
        </p>
        <h2 className="font-serif font-bold text-xl text-gray-900 mt-10 mb-3">How We Handle Corrections</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Minor errors</strong> (spelling, formatting, broken links) are corrected silently with the article updated timestamp.</li>
          <li><strong>Factual errors</strong> are corrected with a visible correction note appended to the affected article, stating the original error and the corrected information.</li>
          <li><strong>Significant errors</strong> that change the meaning of a story receive a top-of-article correction notice and are flagged in our editorial log.</li>
        </ul>
        <h2 className="font-serif font-bold text-xl text-gray-900 mt-10 mb-3">Report an Error</h2>
        <p>
          To report a factual error, contact us at{" "}
          <a href={`mailto:${SITE_CONFIG.email}`} className="text-blue-600 hover:text-blue-800 underline">{SITE_CONFIG.email}</a>{" "}
          with the subject line <strong>Correction Request</strong> and a link to the article.
        </p>
        <div className="flex flex-wrap gap-4 mt-10 pt-8 border-t border-gray-200 text-sm">
          <Link href="/editorial-standards" className="text-blue-600 hover:text-blue-800 underline">Editorial Standards</Link>
          <Link href="/about" className="text-blue-600 hover:text-blue-800 underline">About OzoneNews</Link>
          <Link href="/contact" className="text-blue-600 hover:text-blue-800 underline">Contact</Link>
        </div>
      </div>
    </main>
  );
}
