import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact | OzoneNews",
  description: "Contact the OzoneNews editorial team for tips, corrections, press inquiries, and partnerships.",
  alternates: { canonical: `${SITE_CONFIG.url}/contact` },
};

export default function ContactPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-serif font-bold text-3xl sm:text-4xl text-gray-900 mb-6">Contact</h1>
      <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
        <p>We welcome tips, corrections, press inquiries, and feedback.</p>

        <div className="grid sm:grid-cols-2 gap-6 not-prose">
          <div className="border border-gray-200 p-6 rounded">
            <h3 className="font-bold text-gray-900 mb-2">Editorial</h3>
            <p className="text-sm text-gray-600 mb-3">Tips, corrections, story requests</p>
            <a href={`mailto:${SITE_CONFIG.email}`} className="text-blue-600 hover:text-blue-800 underline text-sm">{SITE_CONFIG.email}</a>
          </div>
          <div className="border border-gray-200 p-6 rounded">
            <h3 className="font-bold text-gray-900 mb-2">Social</h3>
            <p className="text-sm text-gray-600 mb-3">Follow for breaking news</p>
            <a href={SITE_CONFIG.sameAs?.[0] ?? '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline text-sm">{SITE_CONFIG.twitter}</a>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-10 pt-8 border-t border-gray-200 text-sm">
          <Link href="/about" className="text-blue-600 hover:text-blue-800 underline">About OzoneNews</Link>
          <Link href="/editorial-standards" className="text-blue-600 hover:text-blue-800 underline">Editorial Standards</Link>
          <Link href="/corrections" className="text-blue-600 hover:text-blue-800 underline">Corrections</Link>
        </div>
      </div>
    </main>
  );
}
