import DOMPurify from 'dompurify';
import parseHtmlToReact from 'html-react-parser';

import type { ConsentLanguage } from './types';

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (!(node instanceof Element)) {
    return;
  }
});

export const transformText = (text: string): string | React.JSX.Element | React.JSX.Element[] => {
  const dirty = text;
  const clean = DOMPurify.sanitize(dirty);

  // Parse the sanitized HTML to React elements
  const returnVal = parseHtmlToReact(clean.toString().trim());
  return returnVal;
};

export const getLanguage = (language: string | null): keyof ConsentLanguage => {
  switch (language) {
    case 'no_nb':
      return 'nb';
    case 'no_nn':
      return 'nn';
    case 'en':
      return 'en';
  }
  return 'nb'; // Default to Norwegian if no cookie is set
};
