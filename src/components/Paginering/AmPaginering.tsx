import type { DsPaginationProps } from '@altinn/altinn-components';
import { DsPagination, useDsPagination } from '@altinn/altinn-components';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

export interface AmPaginationProps extends DsPaginationProps {
  totalPages: number;
  showPages?: number;
  setCurrentPage?: (page: number) => void;
  currentPage: number;
  hideLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const AmPagination = ({
  totalPages,
  showPages = 5,
  currentPage,
  setCurrentPage,
  onChange,
  hideLabels = false,
  className,
  size,
}: AmPaginationProps) => {
  const { t } = useTranslation();
  const { pages, prevButtonProps, nextButtonProps } = useDsPagination({
    currentPage,
    setCurrentPage,
    onChange,
    totalPages,
    showPages: showPages > totalPages ? totalPages : showPages,
  });

  return (
    <DsPagination
      data-size={size || 'md'}
      className={className}
    >
      <DsPagination.List>
        <DsPagination.Item>
          <DsPagination.Button {...prevButtonProps}>
            {!hideLabels && t('common.previous')}
          </DsPagination.Button>
        </DsPagination.Item>
        {pages.map(({ page, itemKey, buttonProps }) => (
          <DsPagination.Item key={itemKey}>
            {typeof page === 'number' && (
              <DsPagination.Button
                {...buttonProps}
                aria-label={`${t('common.page')} ${page}`}
              >
                {page}
              </DsPagination.Button>
            )}
          </DsPagination.Item>
        ))}
        <DsPagination.Item>
          <DsPagination.Button {...nextButtonProps}>
            {!hideLabels && t('common.next')}
          </DsPagination.Button>
        </DsPagination.Item>
      </DsPagination.List>
    </DsPagination>
  );
};
