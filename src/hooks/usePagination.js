import { useState, useMemo } from "react";

/**
 * Custom Hook untuk Pagination
 * @param {Array} data - Array data yang akan di-paginate
 * @param {number} itemsPerPage - Jumlah item per halaman (default: 10)
 * @returns {Object} - Pagination state dan functions
 */
export const usePagination = (data = [], itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(itemsPerPage);

  // Hitung total halaman
  const totalPages = useMemo(() => {
    return Math.ceil(data.length / perPage);
  }, [data.length, perPage]);

  // Hitung index start dan end
  const startIndex = useMemo(() => {
    return (currentPage - 1) * perPage;
  }, [currentPage, perPage]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + perPage, data.length);
  }, [startIndex, perPage, data.length]);

  // Data yang ditampilkan di halaman saat ini
  const paginatedData = useMemo(() => {
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, endIndex]);

  // Reset ke halaman 1 jika data berubah
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Navigate ke halaman tertentu
  const goToPage = (pageNumber) => {
    const page = Math.max(1, Math.min(pageNumber, totalPages));
    setCurrentPage(page);
  };

  // Halaman selanjutnya
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Halaman sebelumnya
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Halaman pertama
  const firstPage = () => {
    setCurrentPage(1);
  };

  // Halaman terakhir
  const lastPage = () => {
    setCurrentPage(totalPages);
  };

  // Ubah items per page
  const changePerPage = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset ke halaman 1
  };

  return {
    // Data
    paginatedData,
    totalItems: data.length,

    // Page info
    currentPage,
    totalPages,
    perPage,
    startIndex: startIndex + 1, // +1 untuk display (1-based index)
    endIndex,

    // Actions
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    changePerPage,

    // Helpers
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};
