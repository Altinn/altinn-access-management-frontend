import { CheckmarkIcon } from '@navikt/aksel-icons';
import React from 'react';
import { DsHeading, DsLink } from '@altinn/altinn-components';
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
          <CheckmarkIcon className={classes.consentRightIcon} />
          <div className={classes.consentRightContent}>
            <DsHeading
              level={3}
              data-size='2xs'
            >
              {right.title[language]}
            </DsHeading>
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
      return React.createElement(
        Link,
        { href: domNode.attribs.href },
        domToReact(domNode.children as DOMNode[], parserOptions),
      );
    }
  },
};
const Link = (props: { href: string; children?: React.ReactNode }) => {
  return <DsLink {...props}>{props.children}</DsLink>;
};

export const transformText = (text: string): string | React.JSX.Element | React.JSX.Element[] => {
  const dirty = text;
  const clean = DOMPurify.sanitize(dirty);

  // Parse the sanitized HTML to React elements
  const returnVal = parseHtmlToReact(clean.toString().trim(), parserOptions);
  return returnVal;
};
