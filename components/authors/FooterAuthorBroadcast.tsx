'use client';

/**
 * FooterAuthorBroadcast
 *
 * Tiny side-effect component. Mount it inside ArticleFooter with the current
 * article's author data. It calls useSetFooterAuthor on mount to push the
 * author into FooterAuthorContext, and clears it on unmount (navigation away).
 */

import { useEffect } from 'react';
import { useFooterAuthor, FooterAuthor } from '@/lib/footer-author-context';

export default function FooterAuthorBroadcast({ author }: { author: FooterAuthor | null }) {
  const { setAuthor } = useFooterAuthor();

  useEffect(() => {
    if (author) setAuthor(author);
    return () => setAuthor(null);
  }, [author, setAuthor]);

  return null;
}
