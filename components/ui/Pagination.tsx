// components/ui/Pagination.tsx
import React from "react";

interface PaginationProps {
  totalResults: number;
  resultsPerPage: number;
  currentPage: number;
  onPageChange?: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  totalResults,
  resultsPerPage,
  currentPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  const handlePageChange = (newPage: number) => {
    if (onPageChange && newPage !== currentPage) {
      onPageChange(newPage);
    }
  };

  return (
    <div className="flex justify-between items-center space-x-2">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-white">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};
