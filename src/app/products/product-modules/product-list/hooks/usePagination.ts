// usePagination.ts
import { useState } from 'react';

interface UsePaginationProps {
  initialPage?: number;
  initialLimit?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  limit: number;
  totalItems: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotalItems: (total: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  getOffset: () => number;
}

export const usePagination = ({
  initialPage = 1,
  initialLimit = 10
}: UsePaginationProps = {}): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit, setLimitState] = useState(initialLimit);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = Math.ceil(totalItems / limit);

  const setPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const setLimit = (newLimit: number) => {
    setLimitState(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const getOffset = () => (currentPage - 1) * limit;

  return {
    currentPage,
    totalPages,
    limit,
    totalItems,
    setPage,
    setLimit,
    setTotalItems,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
    getOffset
  };
};
