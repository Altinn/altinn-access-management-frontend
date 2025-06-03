import DOMPurify from 'dompurify';
import parseHtmlToReact from 'html-react-parser';

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
