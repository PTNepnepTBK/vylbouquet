import toast from "react-hot-toast";

/**
 * useToast Hook - Custom hook untuk menampilkan notifikasi toast
 *
 * Penggunaan:
 * const showToast = useToast();
 *
 * showToast.success('Berhasil!');
 * showToast.error('Gagal!');
 * showToast.loading('Memproses...');
 * showToast.promise(promise, { loading: '...', success: '...', error: '...' });
 */
export const useToast = () => {
  return {
    /**
     * Tampilkan toast sukses
     * @param {string} message - Pesan yang ditampilkan
     */
    success: (message) => {
      toast.success(message, {
        duration: 3000,
      });
    },

    /**
     * Tampilkan toast error
     * @param {string} message - Pesan error yang ditampilkan
     */
    error: (message) => {
      toast.error(message, {
        duration: 4000,
      });
    },

    /**
     * Tampilkan toast loading
     * @param {string} message - Pesan loading
     * @returns {string} toastId - ID untuk dismiss toast
     */
    loading: (message) => {
      return toast.loading(message);
    },

    /**
     * Tampilkan toast info/default
     * @param {string} message - Pesan info
     */
    info: (message) => {
      toast(message, {
        icon: "ℹ️",
        duration: 3000,
      });
    },

    /**
     * Dismiss toast berdasarkan ID
     * @param {string} toastId - ID toast yang akan di-dismiss
     */
    dismiss: (toastId) => {
      if (toastId) {
        toast.dismiss(toastId);
      } else {
        toast.dismiss();
      }
    },

    /**
     * Promise toast - otomatis update status berdasarkan promise
     * @param {Promise} promise - Promise yang akan ditrack
     * @param {Object} messages - Object berisi pesan loading, success, error
     */
    promise: (promise, messages) => {
      return toast.promise(promise, messages);
    },

    /**
     * Toast custom dengan options lengkap
     * @param {string} message - Pesan
     * @param {Object} options - Custom options
     */
    custom: (message, options = {}) => {
      toast(message, options);
    },
  };
};

// Export langsung fungsi toast untuk penggunaan advanced
export { toast };

// Helper functions untuk validasi
export const toastValidation = {
  /**
   * Validasi dan tampilkan error jika ada
   * @param {Object} errors - Object errors dari validasi
   * @returns {boolean} - True jika ada error
   */
  showValidationErrors: (errors) => {
    if (errors && Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return true;
    }
    return false;
  },

  /**
   * Validasi required fields
   * @param {Object} data - Data yang akan divalidasi
   * @param {Array} requiredFields - Array nama field yang required
   * @returns {boolean} - True jika valid
   */
  validateRequired: (data, requiredFields) => {
    for (const field of requiredFields) {
      if (!data[field] || data[field].toString().trim() === "") {
        toast.error(`${field} harus diisi`);
        return false;
      }
    }
    return true;
  },
};
