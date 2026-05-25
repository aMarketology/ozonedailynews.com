'use client';

import React, { useState } from 'react';

// =============================================================================
// FAQ ACCORDION COMPONENT + FAQPage JSON-LD Schema
// Works with: NewsArticle, ObjectDesign (Wikipedia-style), or standalone
// =============================================================================

// =============================================================================
// TYPES
// =============================================================================

export interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

export interface FAQAccordionProps {
  /** Array of question/answer pairs */
  items: FAQItem[];
  /** Section heading (default: "Frequently Asked Questions") */
  heading?: string;
  /** Accent color theme */
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'gray';
  /** Whether all items start expanded */
  defaultOpen?: boolean;
  /** Show the heading or not */
  showHeading?: boolean;
}

// =============================================================================
// FAQ SCHEMA — Injects FAQPage JSON-LD structured data for Google rich results
// =============================================================================

export function FAQSchema({ items }: { items: FAQItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: typeof item.question === 'string' ? item.question : '',
      acceptedAnswer: {
        '@type': 'Answer',
        text: typeof item.answer === 'string' ? item.answer : '',
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// =============================================================================
// SINGLE ACCORDION ITEM
// =============================================================================

function AccordionItem({
  item,
  isOpen,
  onToggle,
  color,
  index,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  color: string;
  index: number;
}) {
  const accentBorder: Record<string, string> = {
    blue: 'border-blue-500',
    purple: 'border-purple-500',
    green: 'border-green-500',
    orange: 'border-orange-500',
    red: 'border-red-500',
    gray: 'border-gray-400',
  };

  const accentBg: Record<string, string> = {
    blue: 'bg-blue-50',
    purple: 'bg-purple-50',
    green: 'bg-green-50',
    orange: 'bg-orange-50',
    red: 'bg-red-50',
    gray: 'bg-gray-50',
  };

  const accentText: Record<string, string> = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    gray: 'text-gray-600',
  };

  return (
    <div
      className={`border border-gray-200 rounded-xl overflow-hidden transition-shadow ${
        isOpen ? 'shadow-sm' : ''
      }`}
    >
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors ${
          isOpen ? accentBg[color] : 'bg-white hover:bg-gray-50'
        }`}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
      >
        {/* Number badge */}
        <span
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
            isOpen
              ? `${accentBg[color]} ${accentText[color]} border ${accentBorder[color]}`
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {index + 1}
        </span>

        {/* Question text */}
        <span className="flex-1 text-sm font-bold text-gray-900 leading-snug">
          {item.question}
        </span>

        {/* Chevron */}
        <svg
          className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          } ${isOpen ? accentText[color] : 'text-gray-400'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Answer panel */}
      <div
        id={`faq-answer-${index}`}
        role="region"
        className={`transition-all duration-200 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className={`px-5 pb-5 pt-2 border-t ${accentBorder[color]} border-opacity-30`}>
          <div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none">
            {item.answer}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// FAQ ACCORDION — Main exported component
// =============================================================================

export default function FAQAccordion({
  items,
  heading = 'Frequently Asked Questions',
  color = 'blue',
  defaultOpen = false,
  showHeading = true,
}: FAQAccordionProps) {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(
    defaultOpen ? new Set(items.map((_, i) => i)) : new Set()
  );

  const toggle = (index: number) => {
    setOpenIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const allOpen = openIndexes.size === items.length;

  const toggleAll = () => {
    if (allOpen) {
      setOpenIndexes(new Set());
    } else {
      setOpenIndexes(new Set(items.map((_, i) => i)));
    }
  };

  return (
    <div className="my-8">
      {/* Schema injection */}
      <FAQSchema items={items} />

      {/* Heading row */}
      {showHeading && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-gray-900">{heading}</h2>
          <button
            onClick={toggleAll}
            className="text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors px-3 py-1 rounded-full border border-gray-200 hover:border-gray-300"
          >
            {allOpen ? 'Collapse all' : 'Expand all'}
          </button>
        </div>
      )}

      {/* Accordion stack */}
      <div className="space-y-3">
        {items.map((item, i) => (
          <AccordionItem
            key={i}
            item={item}
            isOpen={openIndexes.has(i)}
            onToggle={() => toggle(i)}
            color={color}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
