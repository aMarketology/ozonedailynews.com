// components/geo/KeyTakeaways.tsx
// G2 GEO signal: Bullet-point summary block.
// Place after opening paragraph, before first H2.
// ItemList schema marks each point as a core article claim.

interface KeyTakeawaysProps {
  items: string[];
  heading?: string;
}

export function KeyTakeaways({ items, heading = 'Key Takeaways' }: KeyTakeawaysProps) {
  return (
    <div
      className="my-6 border border-blue-200 bg-blue-50 rounded-lg p-5"
      itemScope
      itemType="https://schema.org/ItemList"
    >
      <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-3">
        {heading}
      </h3>
      <ul className="space-y-2" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-gray-800 text-sm leading-relaxed">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold mt-0.5">
              {i + 1}
            </span>
            <span itemProp="name">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
