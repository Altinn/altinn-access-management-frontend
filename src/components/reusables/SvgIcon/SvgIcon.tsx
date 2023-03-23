import type { SVGAttributes } from 'react';
import { isValidElement, cloneElement } from 'react';

export interface IconComponentProps {
  svgIconComponent: React.ReactNode;
}

export type SvgIconProps = IconComponentProps & SVGAttributes<SVGElement>;

export const SvgIcon = ({ svgIconComponent, ...rest }: SvgIconProps) => {
  if (isValidElement(svgIconComponent)) {
    return cloneElement(svgIconComponent, { ...rest });
  }
  return null;
};
