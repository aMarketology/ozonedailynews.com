'use client';

/**
 * FooterAuthorContext
 *
 * Allows any article component (ArticleFooter, deep in the tree) to broadcast
 * the current article's author data up to the global site footer in layout.tsx.
 *
 * How it works:
 *  1. FooterAuthorProvider wraps the entire app in layout.tsx (client boundary).
 *  2. ArticleFooter calls useSetFooterAuthor(author) when it mounts, which
 *     pushes the author into shared state.
 *  3. FooterAuthorSlot (in layout.tsx footer) reads that state and renders it.
 *  4. On non-article pages the slot renders nothing (author is null).
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface FooterAuthor {
  name: string;
  role?: string;
  avatar?: string;
  authorSlug?: string;
}

interface FooterAuthorContextValue {
  author: FooterAuthor | null;
  setAuthor: (author: FooterAuthor | null) => void;
}

const FooterAuthorContext = createContext<FooterAuthorContextValue>({
  author: null,
  setAuthor: () => {},
});

export function FooterAuthorProvider({ children }: { children: ReactNode }) {
  const [author, setAuthorState] = useState<FooterAuthor | null>(null);

  const setAuthor = useCallback((a: FooterAuthor | null) => {
    setAuthorState(a);
  }, []);

  return (
    <FooterAuthorContext.Provider value={{ author, setAuthor }}>
      {children}
    </FooterAuthorContext.Provider>
  );
}

export function useFooterAuthor() {
  return useContext(FooterAuthorContext);
}
