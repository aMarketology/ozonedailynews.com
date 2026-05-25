// components/geo/FAQAccordion.tsx
// G4 GEO signal: FAQPage JSON-LD + interactive accordion UI.
// Place at the end of every article as the "Related Questions" section.

'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  heading?: string;
}

export function FAQAccordion({ items, heading = 'Frequently Asked Questions' }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="my-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{heading}</h2>
        <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          {items.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 bg-white hover:bg-gray-50 transition-colors"
                aria-expanded={openIndex === i}
              >
                <span className="font-medium text-gray-900 text-sm">{item.question}</span>
                <span className="flex-shrink-0 text-gray-400 text-lg leading-none">
                  {openIndex === i ? '−' : '+'}
                </span>
              </button>
              {openIndex === i && (
                <div className="px-5 pb-4 pt-1 bg-gray-50 text-sm text-gray-700 leading-relaxed">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
