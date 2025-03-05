import type { PaginationProps } from '@digdir/designsystemet-react';
import { Pagination, usePagination } from '@digdir/designsystemet-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

export interface AmPaginationProps extends PaginationProps {
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
  hideLabels = false,
  className,
  size,
}: AmPaginationProps) => {
  const { t } = useTranslation();
  const { pages, prevButtonProps, nextButtonProps } = usePagination({
    currentPage,
    setCurrentPage,
    onChange: () => {},
    totalPages,
    showPages: showPages > totalPages ? totalPages : showPages,
  });

  return (
    <Pagination
      data-size={size || 'md'}
      className={className}
    >
      <Pagination.List>
        <Pagination.Item>
          <Pagination.Button {...prevButtonProps}>
            {!hideLabels && t('common.previous')}
          </Pagination.Button>
        </Pagination.Item>
        {pages.map(({ page, itemKey, buttonProps }) => (
          <Pagination.Item key={itemKey}>
            <Pagination.Button
              {...buttonProps}
              aria-label={`${t('common.page')} ${page}`}
            >
              {page}
            </Pagination.Button>
          </Pagination.Item>
        ))}
        <Pagination.Item>
          <Pagination.Button {...nextButtonProps}>
            {!hideLabels && t('common.next')}
          </Pagination.Button>
        </Pagination.Item>
      </Pagination.List>
    </Pagination>
  );
};
