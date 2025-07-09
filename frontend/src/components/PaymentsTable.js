import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MoreVertical, Plus, Trash2, ChevronLeft, ChevronRight, Edit, DollarSign } from 'lucide-react';
import PaymentDialog from './PaymentPopUp';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';
import { useTranslation } from 'react-i18next';
import apiService from '../services/apiService';

const PaymentsTable = () => {
  const { t } = useTranslation();
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [toast, setToast] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [pageCache, setPageCache] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
  const [paymentToEdit, setPaymentToEdit] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState(null); // 'single' or 'multiple'
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm ] = useState('');
  const [dateFilter ] = useState({ startDate: null, endDate: null });
  const [amountFilter] = useState({ min: null, max: null });

  // Calculate pagination
  const totalPages = Math.ceil(totalRows / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchPayments = useCallback(async (page, limit) => {
    if (pageCache[page]) {
      setPayments(pageCache[page].payments);
      setTotalRows(pageCache[page].total);
      setCurrentPage(pageCache[page].page);
      setPerPage(limit);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.get(`/payments?page=${page}&limit=${limit}`, {
        withCredentials: true
      });
      const fetchedPayments = response.data.payments;
      const fetchedTotal = response.data.total;
      const fetchedPage = response.data.page;

      setPageCache(prevCache => ({
        ...prevCache,
        [fetchedPage]: { payments: fetchedPayments, total: fetchedTotal, page: fetchedPage }
      }));

      setPayments(fetchedPayments);
      setTotalRows(fetchedTotal);
      setCurrentPage(fetchedPage);
      setPerPage(limit);
    } catch (error) {
      console.error("Error fetching payments:", error.response?.data || error.message);
      setToast({
        type: 'error',
        message: error.response?.data?.error || 'Failed to fetch payments.'
      });
    } finally {
      setLoading(false);
    }
  }, [pageCache]);

  // Initial load
  useEffect(() => {
    if (isInitialLoad) {
      fetchPayments(currentPage, perPage);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, currentPage, perPage, fetchPayments]);

  // Handle page changes
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchPayments(newPage, perPage);
  };


  const handleRowSelect = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === payments.length && payments.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(payments.map(payment => payment._id || payment.id)));
    }
  };

  // delete the chunks of records
  const handleDelete = async () => {
    if (selectedRows.size > 0) {
      // Store original state for potential rollback
      const originalPayments = [...payments];
      const originalTotal = totalRows;

      // Optimistically remove selected items from local state
      setPayments(prev => prev.filter(payment => !selectedRows.has(payment._id || payment.id)));
      setTotalRows(prev => Math.max(0, prev - selectedRows.size));
      setSelectedRows(new Set());

      try {
        // Attempt to delete on backend
        await Promise.all(Array.from(selectedRows).map(id => 
          apiService.delete(`/payment/${id}`, { withCredentials: true })
        ));
        setToast({
          type: 'success',
          message: 'Selected payments deleted successfully!'
        });
      } catch (error) {
        // Revert local state on error
        setPayments(originalPayments);
        setTotalRows(originalTotal);
        console.error("Error deleting selected payments:", error.response?.data || error.message);
        setToast({
          type: 'error',
          message: error.response?.data?.error || 'Failed to delete selected payments.'
        });
      }
    }
  };

  // delete the single record 
  const handleRowDelete = async (id) => {
    setOpenMenuId(null); // Close menu
    // Store original state for potential rollback
    const originalPayments = [...payments];
    const originalTotal = totalRows;
    // Optimistically remove the item from local state
    setPayments(prev => prev.filter(payment => (payment._id || payment.id) !== id));
    setTotalRows(prev => Math.max(0, prev - 1));
    try {
      // Attempt to delete on backend
      await apiService.delete(`/payment/${id}`, { withCredentials: true });
      
      setToast({
        type: 'success',
        message: 'Payment deleted successfully!'
      });
    } catch (error) {
      // Revert local state on error
      setPayments(originalPayments);
      setTotalRows(originalTotal);
      console.error("Error deleting payment:", error.response?.data || error.message);
      setToast({
        type: 'error',
        message: error.response?.data?.error || 'Failed to delete payment.'
      });
    }
  };

  // handle the edit of single record
  const handleEdit = (id) => {
    setOpenMenuId(null);
    const payment = payments.find(pay => (pay._id || pay.id) === id);
    if (payment) {
      setPaymentToEdit(payment);
      setShowPaymentDialog(true);
    }
  };

  const handleAddNew = () => {
    setPaymentToEdit(null);
    setShowPaymentDialog(true);
  };

  const handlePaymentAction = async (paymentData) => {
    setShowPaymentDialog(false);
    setPaymentToEdit(null);

    const isEditMode = !!paymentData._id;

    if (isEditMode) {
      const originalPayments = [...payments];
      const updatedPayment = { ...originalPayments.find(p => p._id === paymentData._id), ...paymentData };

      setPayments(prev => prev.map(p => p._id === paymentData._id ? updatedPayment : p));

      try {
        await apiService.put(`/payment/${paymentData._id}`, paymentData, { withCredentials: true });
        setToast({ type: 'success', message: 'Payment updated successfully!' });
        setPageCache(prev => {
          const newCache = { ...prev };
          delete newCache[currentPage];
          return newCache;
        });
      } catch (error) {
        setPayments(originalPayments);
        console.error(`Error updating payment:`, error.response?.data || error.message);
        setToast({ type: 'error', message: error.response?.data?.error || 'Failed to update payment.' });
      }
      } else {
      const tempId = `temp_${Date.now()}`;
      const newPayment = { ...paymentData, _id: tempId, id: tempId };

      setPayments(prev => [newPayment, ...prev]);
      setTotalRows(prev => prev + 1);

      try {
        const response = await apiService.post('/create-payment', paymentData, { withCredentials: true });
        setPayments(prev => prev.map(p => p._id === tempId ? { ...response.data, id: response.data._id } : p));
        setToast({ type: 'success', message: 'Payment added successfully!' });
        setPageCache({});
    } catch (error) {
        setPayments(prev => prev.filter(p => p._id !== tempId));
        setTotalRows(prev => prev - 1);
        console.error(`Error adding payment:`, error.response?.data || error.message);
        setToast({ type: 'error', message: error.response?.data?.error || 'Failed to add payment.' });
      }
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    try {
        const date = new Date(dateString);
        return isNaN(date) ? 'Invalid Date' : date.toLocaleDateString('en-US', options);
    } catch (error) {
        return 'Invalid Date';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return 'Invalid Amount';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericAmount);
  };

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest('.action-menu-container')) {
        setOpenMenuId(null);
      }
    };

    // Add event listener to window
    window.addEventListener('click', handleClickOutside);

    // Cleanup
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [openMenuId]);

  const handleDeleteClick = (id = null) => {
    if (id) {
      setDeleteType('single');
      setDeleteId(id);
    } else {
      setDeleteType('multiple');
    }
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteType === 'single') {
        await handleRowDelete(deleteId);
      } else {
        await handleDelete();
      }
      setToast({
        type: 'success',
        message: `Payment${deleteType === 'multiple' ? 's' : ''} deleted successfully`
      });
    } catch (error) {
      setToast({
        type: 'error',
        message: `Failed to delete payment${deleteType === 'multiple' ? 's' : ''}`
      });
    } finally {
      setShowDeleteConfirm(false);
      setDeleteType(null);
      setDeleteId(null);
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch = payment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.payer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.payment_type === 'custom' ? payment.custom_payment_type : payment.payment_type)
          .toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDate = !dateFilter.startDate || !dateFilter.endDate || 
        (new Date(payment.date) >= dateFilter.startDate && 
         new Date(payment.date) <= dateFilter.endDate);
      
      const matchesAmount = !amountFilter.min || !amountFilter.max || 
        (payment.amount >= amountFilter.min && 
         payment.amount <= amountFilter.max);

      return matchesSearch && matchesDate && matchesAmount;
    });
  }, [payments, searchTerm, dateFilter, amountFilter]);

  return (
    <div className="w-full font-sans px-4 sm:px-6 lg:px-8">
      {/* Card Container */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/20 overflow-hidden mx-auto max-w-full transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-3xl" />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 sm:px-8 pt-6 pb-4">
          <h2 className="flex items-center gap-3 text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
            <DollarSign className="text-indigo-500" size={28} />
            {t('paymentsTable.title')}
          </h2>
          <div className="flex items-center gap-2">
          {selectedRows.size > 0 && (
            <button
              onClick={() => handleDeleteClick()}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2 rounded-xl shadow transition-all duration-200 active:scale-95 text-sm"
            >
              <Trash2 size={16} />
                {t('paymentsTable.delete')} ({selectedRows.size})
            </button>
          )}
          <button 
            onClick={handleAddNew}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl shadow transition-all duration-200 active:scale-95 text-sm"
          >
            <Plus size={16} />
            {t('paymentsTable.addPayment')}
            </button>
        </div>
      </div>

      {/* Table Container */}
        <div className="overflow-x-auto px-2 sm:px-6 pb-6">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/80">
            <tr>
                <th className="px-3 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={payments.length > 0 && selectedRows.size === payments.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
              </th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">{t('paymentsTable.paymentName')}</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">{t('paymentsTable.date')}</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">{t('paymentsTable.amount')}</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">{t('paymentsTable.payer')}</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">{t('paymentsTable.paymentType')}</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">{t('paymentsTable.actions')}</th>
            </tr>
          </thead>
            <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400 animate-pulse">{t('paymentsTable.loading')}</td>
              </tr>
            ) : payments.length === 0 ? (
                <tr>
                <td colSpan="7">
                  <div className="text-center py-12">
                      <div className="text-slate-300 mb-4"><Plus size={48} className="mx-auto" /></div>
                      <h3 className="text-lg font-bold text-slate-700 mb-2">{t('paymentsTable.noPayments')}</h3>
                      <p className="text-slate-500 mb-4">{t('paymentsTable.addFirst')}</p>
                      <button onClick={handleAddNew} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold transition-all">{t('paymentsTable.addNewPayment')}</button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment) => (
                <tr
                  key={payment._id || payment.id}
                    className={`group cursor-pointer transition-all duration-200 ${selectedRows.has(payment._id || payment.id) ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-slate-50'} animate-[fadeIn_0.4s]`}
                  onClick={() => handleRowSelect(payment._id || payment.id)}
                >
                    <td className="px-3 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(payment._id || payment.id)}
                        onChange={() => handleRowSelect(payment._id || payment.id)}
                        onClick={e => e.stopPropagation()}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                      />
                  </td>
                    <td className="px-3 py-4 text-sm font-semibold text-slate-800 text-center truncate"><div title={payment.name}>{payment.name}</div></td>
                    <td className="px-3 py-4 text-sm text-slate-600 text-center font-mono">{formatDate(payment.date)}</td>
                    <td className="px-3 py-4 text-sm text-slate-600 text-center font-mono">{formatCurrency(payment.amount)}</td>
                    <td className="px-3 py-4 text-sm font-semibold text-slate-800 text-center truncate"><div title={payment.payer}>{payment.payer}</div></td>
                    <td className="px-3 py-4 text-center">
                      <span className="px-3 py-1 rounded-full text-xs font-bold capitalize bg-slate-100 text-slate-700">
                    {payment.payment_type === 'custom' 
                      ? payment.custom_payment_type 
                      : payment.payment_type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                  </td>
                    <td className="px-3 py-4 text-center relative action-menu-container">
                      <button onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === payment._id ? null : payment._id); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200" aria-label={t('paymentsTable.actions')}>
                        <MoreVertical size={18} />
                    </button>
                    {openMenuId === payment._id && (
                        <div className="absolute right-full -mr-12 top-0 w-32 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-10 animate-fadeIn">
                        <div className="py-1">
                            <button onClick={e => { e.stopPropagation(); handleEdit(payment._id || payment.id); }} className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full text-left transition-all duration-200">
                              <Edit size={16} className="mr-2" />{t('paymentsTable.edit')}
                          </button>
                            <button onClick={e => { e.stopPropagation(); handleDeleteClick(payment._id || payment.id); }} className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-all duration-200">
                              <Trash2 size={16} className="mr-2" />{t('paymentsTable.delete')}
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalRows > perPage && (
            <div className="px-2 sm:px-6 pt-4 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100 mt-2">
              <div className="text-xs text-slate-500">
                {t('paymentsTable.showing')} <span className="font-bold text-slate-700">{startIndex + 1}</span> {t('paymentsTable.to')} <span className="font-bold text-slate-700">{Math.min(endIndex, totalRows)}</span> {t('paymentsTable.of')} <span className="font-bold text-slate-700">{totalRows}</span> {t('paymentsTable.entries')}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200">
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, index) => (
                    <button key={index + 1} onClick={() => handlePageChange(index + 1)} className={`px-3 py-1 rounded-xl text-xs font-bold transition-all duration-200 ${currentPage === index + 1 ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-indigo-100'}`}>
                      {index + 1}
                    </button>
                  ))}
                </div>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
          </div>
      </div>

      {/* Mobile Selection Actions */}
      {selectedRows.size > 0 && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 bg-white border border-slate-200 rounded-xl shadow-lg p-4 animate-fadeIn z-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">{selectedRows.size} {selectedRows.size > 1 ? t('paymentsTable.items') : t('paymentsTable.item')} {t('paymentsTable.selected')}</span>
            <button
              onClick={() => {
                handleDeleteClick();
              }}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 px-3 py-2 hover:bg-red-50 rounded-xl transition-all duration-200"
            >
              <Trash2 size={16} />
              {t('paymentsTable.delete')}
            </button>
          </div>
        </div>
      )}

      {/* Add Payment Dialog */}
      {showPaymentDialog && (
        <PaymentDialog
          onClose={() => setShowPaymentDialog(false)}
          onSuccess={handlePaymentAction}
          paymentToEdit={paymentToEdit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteType(null);
          setDeleteId(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={`${t('paymentsTable.delete')} ${deleteType === 'multiple' ? t('paymentsTable.payments') : t('paymentsTable.payment')}`}
        message={`${t('paymentsTable.confirmDelete')} ${deleteType === 'multiple' ? t('paymentsTable.thesePayments') : t('paymentsTable.thisPayment')}`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default PaymentsTable;