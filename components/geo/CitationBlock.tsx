// components/geo/CitationBlock.tsx
// G3 + G4 GEO signals: Structured answer units with FAQPage JSON-LD.
// Each CitationBlock answers one specific question with a direct answer, optional stat,
// key facts, and source attribution. AI systems can extract each independently.

interface CitationBlockProps {
  question: string;
  answer: string;
  type?: 'definition' | 'stat' | 'comparison' | 'timeline' | 'verdict';
  stat?: string;
  statLabel?: string;
  facts?: string[];
  source?: string;
  sourceUrl?: string;
}

const TYPE_LABELS: Record<NonNullable<CitationBlockProps['type']>, string> = {
  definition: 'DEFINITION',
  stat:       'KEY STAT',
  comparison: 'COMPARISON',
  timeline:   'TIMELINE',
  verdict:    'VERDICT',
};

const TYPE_COLORS: Record<NonNullable<CitationBlockProps['type']>, string> = {
  definition: 'bg-purple-600',
  stat:       'bg-orange-500',
  comparison: 'bg-sky-600',
  timeline:   'bg-indigo-600',
  verdict:    'bg-red-600',
};

export function CitationBlock({
  question,
  answer,
  type = 'definition',
  stat,
  statLabel,
  facts,
  source,
  sourceUrl,
}: CitationBlockProps) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="my-6 border border-gray-200 rounded-lg overflow-hidden">
        <div className={`px-4 py-2 flex items-center gap-2 ${TYPE_COLORS[type]}`}>
          <span className="text-xs font-bold text-white uppercase tracking-widest">
            {TYPE_LABELS[type]}
          </span>
        </div>
        <div className="p-5 bg-white">
          <p className="text-sm font-semibold text-gray-500 mb-2">{question}</p>
          <p className="text-gray-900 leading-relaxed mb-3">{answer}</p>

          {stat && (
            <div className="my-3 text-center py-3 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-900">{stat}</p>
              {statLabel && <p className="text-xs text-gray-500 mt-1">{statLabel}</p>}
            </div>
          )}

          {facts && facts.length > 0 && (
            <ul className="mt-3 space-y-1">
              {facts.map((fact, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-gray-400 mt-0.5">&#x2022;</span>
                  {fact}
                </li>
              ))}
            </ul>
          )}

          {source && (
            <p className="mt-3 text-xs text-gray-400">
              Source:{' '}
              {sourceUrl ? (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {source}
                </a>
              ) : (
                source
              )}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
