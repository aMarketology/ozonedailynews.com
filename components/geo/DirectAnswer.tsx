// components/geo/DirectAnswer.tsx
// G1 GEO signal: Direct answer in first 200 words.
// Place as the FIRST element in every article body, before KeyTakeaways.
// Renders with itemProp="description" for schema.org extraction.

interface DirectAnswerProps {
  answer: string;
  question?: string;
}

export function DirectAnswer({ answer, question }: DirectAnswerProps) {
  return (
    <div
      role="region"
      aria-label="Quick Answer"
      itemProp="description"
      className="my-6 border-l-4 border-green-500 bg-green-50 rounded-r-lg p-5"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-500 text-white uppercase tracking-wide">
          Quick Answer
        </span>
      </div>
      {question && (
        <p className="text-sm font-medium text-gray-600 mb-1">{question}</p>
      )}
      <p className="text-gray-900 leading-relaxed">{answer}</p>
    </div>
  );
}
