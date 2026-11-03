/** HTML that is already escaped; passes through `html` untouched. */
export class SafeHtml {
  constructor(private readonly value: string) {}
  toString() {
    return this.value;
  }
}

const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

type HtmlValue = string | number | boolean | null | undefined | SafeHtml | HtmlValue[];

const render = (value: HtmlValue): string => {
  if (value instanceof SafeHtml) return value.toString();
  if (Array.isArray(value)) return value.map(render).join('');
  if (value === undefined || value === null || value === false) return '';
  return String(value).replace(/[&<>"']/g, (char) => ENTITIES[char]);
};

/**
 * Template tag that escapes every interpolated value. Nested `html` fragments
 * and arrays of them are inserted as-is; `undefined`, `null` and `false` render nothing.
 */
export const html = (strings: TemplateStringsArray, ...values: HtmlValue[]) =>
  new SafeHtml(strings.reduce((out, part, i) => out + part + render(values[i]), ''));
