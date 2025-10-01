import { CheckmarkIcon } from '@navikt/aksel-icons';
import React from 'react';
import { DsLink, DsParagraph } from '@altinn/altinn-components';
import DOMPurify from 'dompurify';
import type { DOMNode, HTMLReactParserOptions } from 'html-react-parser';
import parseHtmlToReact, { domToReact } from 'html-react-parser';

import type { ConsentLanguage, ConsentRight } from '../../types';

import classes from './ConsentRights.module.css';

interface ConsentRightsProps {
  rights: ConsentRight[];
  language: keyof ConsentLanguage;
}

export const ConsentRights = ({ rights, language }: ConsentRightsProps) => {
  return (
    <div className={classes.consentRights}>
      {rights.map((right) => (
        <div
          key={right.identifier}
          className={classes.consentRight}
        >
          <CheckmarkIcon
            className={classes.consentRightIcon}
            aria-hidden
          />
          <div className={classes.consentRightContent}>
            <DsParagraph className={classes.consentRightTitle}>{right.title[language]}</DsParagraph>
            <div>{transformText(right.consentTextHtml[language])}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const parserOptions: HTMLReactParserOptions = {
  replace: (domNode) => {
    if (domNode.type === 'tag' && domNode.name === 'a') {
      const href = domNode.attribs?.href;
      if (!href) {
        return null;
      }
      return React.createElement(
        Link,
        { href },
        domToReact(domNode.children as DOMNode[], parserOptions),
      );
    }
  },
};
const Link = (props: { href: string; children?: React.ReactNode }) => {
  return <DsLink {...props}>{props.children}</DsLink>;
};

export const transformText = (text: string): string | React.JSX.Element | React.JSX.Element[] => {
  const allowedTags = ['p', 'span', 'ul', 'ol', 'li', 'a', 'b', 'strong', 'em', 'i'];
  const dirty = text;
  const clean = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: allowedTags,
  });

  // Parse the sanitized HTML to React elements
  const returnVal = parseHtmlToReact(clean.toString().trim(), parserOptions);
  return returnVal;
};
