import React, { useState, useEffect, useCallback, useMemo } from 'react';
import StatCard from "./StatCard";
import PaymentInsight from './PaymentInsight';
import PaymentPopUp from './PaymentPopUp';
import Toast from './Toast';
import { 
  MoreVertical, Plus, Trash2, ChevronLeft, ChevronRight, Edit, DollarSign,
  TrendingUp, TrendingDown, Calendar, User, CreditCard, Receipt,
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Clock, Target,
  Wallet, AlertCircle, CheckCircle, Award, Zap
} from 'lucide-react';
import apiService from '../services/apiService';
import ConfirmDialog from './ConfirmDialog';


const ShimmerRow = () => (
  <tr className="group transition-all duration-300">
    {/* Checkbox */}
    <td className="px-3 py-4 text-center">
      <div className="w-4 h-4 bg-slate-200 rounded animate-pulse mx-auto" />
    </td>
    {/* Payment Details */}
    <td className="px-3 py-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-slate-200 rounded-xl animate-pulse" />
        <div className="flex-grow min-w-0 space-y-2">
          <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
          <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
    </td>
    {/* Amount */}
    <td className="px-3 py-4 text-center">
      <div className="flex flex-col items-center space-y-2">
        <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-12 bg-slate-200 rounded animate-pulse" />
      </div>
    </td>
    {/* Payment Type */}
    <td className="px-3 py-4 text-center">
      <div className="flex justify-center">
        <div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse" />
      </div>
    </td>
    {/* Actions */}
    <td className="px-3 py-4 text-center">
      <div className="h-8 w-8 bg-slate-200 rounded-xl mx-auto animate-pulse" />
    </td>
  </tr>
);

const PaymentsTable = () => {
  // Remove selectedRows and related state
  // const [selectedRows, setSelectedRows] = useState(new Set());
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
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm] = useState('');
  const [dateFilter] = useState({ startDate: null, endDate: null });
  const [amountFilter] = useState({ min: null, max: null });
  const [showInsights, setShowInsights] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('weekly'); // Default to weekly
  const [error, setError] = useState(null);
  const [subtractFromWallet, setSubtractFromWallet] = useState(false);

  // Fetch payments from API with pagination and cache
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Check cache first
    if (pageCache[currentPage]) {
      setPayments(pageCache[currentPage]);
      setLoading(false);
      setIsInitialLoad(false);
      return;
    }

    const params = new URLSearchParams();
    params.append('page', currentPage);
    params.append('limit', perPage);

    apiService.get(`/payments?${params.toString()}`)
      .then(res => {
        if (!isMounted) return;
        setPayments(res.data.payments);
        setTotalRows(res.data.total);
        setPageCache(prev => ({ ...prev, [currentPage]: res.data.payments }));
        setLoading(false);
        setIsInitialLoad(false);
      })
      .catch(err => {
        if (!isMounted) return;
        setError(
          err.response?.data?.error ||
          err.message ||
          'Failed to load payments'
        );
        setLoading(false);
      });

    return () => { isMounted = false; };
  }, [currentPage, perPage]);

  // Create payment (optimistic update)
  const handleAddPayment = (paymentData) => {
    // Create a temporary payment object (with a temp id)
    const tempId = `temp-${Date.now()}`;
    const tempPayment = { ...paymentData, _id: tempId };
    setPayments(prev => [tempPayment, ...prev]);
    setTotalRows(prev => prev + 1);
    setPageCache({}); // Invalidate cache
    setShowPaymentDialog(false);
    setToast({ type: 'success', message: 'Payment added successfully!' });
    apiService.post('/create-payment', paymentData)
      .then(res => {
        // Replace temp payment with real one
        setPayments(prev => prev.map(p => p._id === tempId ? res.data : p));
        setPageCache(prev => ({ ...prev, [currentPage]: prev[currentPage]?.map(p => p._id === tempId ? res.data : p) }));
      })
      .catch(err => {
        // Remove temp payment
        setPayments(prev => prev.filter(p => p._id !== tempId));
        setTotalRows(prev => prev - 1);
        setToast({ type: 'error', message: err.response?.data?.error || 'Failed to add payment' });
      });
  };

  // Update payment
  const handleUpdatePayment = (paymentId, updatedData) => {
    // Optimistically update local state
    setPayments(prev => prev.map(p => (p._id === paymentId ? { ...p, ...updatedData } : p)));
    setPageCache(prev => ({
      ...prev,
      [currentPage]: prev[currentPage]?.map(p => (p._id === paymentId ? { ...p, ...updatedData } : p))
    }));
    setToast({ type: 'success', message: 'Payment updated successfully!' });

    // Send update to backend
    apiService.put(`/payment/${paymentId}`, updatedData)
      .then(res => {
        // Use backend response to update local state (in case backend modifies data)
        setPayments(prev => prev.map(p => (p._id === paymentId ? res.data : p)));
        setPageCache(prev => ({
          ...prev,
          [currentPage]: prev[currentPage]?.map(p => (p._id === paymentId ? res.data : p))
        }));
      })
      .catch(err => {
        setToast({ type: 'error', message: err.response?.data?.error || 'Failed to update payment' });
        // Optionally: revert local state if you want
      });
  };

  // Delete payment
  const handleDeletePayment = (paymentId, subtractFromWallet = false) => {
    setLoading(true);
    setError(null);
    console.log('Deleting payment with ID:', paymentId);
    apiService.delete(`/payment/${paymentId}?subtractFromWallet=${subtractFromWallet}`)
      .then(() => {
        // Remove from local state only
        setPayments(prev => prev.filter(p => p._id !== paymentId && p.id !== paymentId));
        setTotalRows(prev => prev - 1);
        // Update cache for current page
        setPageCache(prev => ({
          ...prev,
          [currentPage]: prev[currentPage]?.filter(p => p._id !== paymentId && p.id !== paymentId)
        }));
        setToast({ type: 'success', message: 'Payment deleted successfully!' });
      })
      .catch(err => {
        console.error('Delete error:', err);
        setError(err.response?.data?.error || 'Failed to delete payment');
        setToast({ type: 'error', message: err.response?.data?.error || 'Failed to delete payment' });
      })
      .finally(() => setLoading(false));
  };

  // Calculate insights
  const insights = useMemo(() => {
    if (!payments.length) return null;

    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const averageAmount = totalAmount / payments.length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthPayments = payments.filter(p => {
      const paymentDate = new Date(p.date);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });
    
    const lastMonthPayments = payments.filter(p => {
      const paymentDate = new Date(p.date);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return paymentDate.getMonth() === lastMonth && paymentDate.getFullYear() === lastMonthYear;
    });

    const thisMonthTotal = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    const lastMonthTotal = lastMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    const monthlyGrowth = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    // Payment type distribution
    const paymentTypes = payments.reduce((acc, payment) => {
      const type = payment.payment_type === 'custom' ? payment.custom_payment_type : payment.payment_type;
      acc[type] = (acc[type] || 0) + payment.amount;
      return acc;
    }, {});

    const topPaymentType = Object.entries(paymentTypes).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0]);
    const topPayer = payments.reduce((acc, payment) => {
      acc[payment.payer] = (acc[payment.payer] || 0) + payment.amount;
      return acc;
    }, {});
    const topPayerEntry = Object.entries(topPayer).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0]);

    return {
      totalAmount,
      averageAmount,
      paymentCount: payments.length,
      monthlyGrowth,
      thisMonthTotal,
      topPaymentType: topPaymentType[0],
      topPaymentTypeAmount: topPaymentType[1],
      topPayer: topPayerEntry[0],
      topPayerAmount: topPayerEntry[1],
      recentPayments: payments.slice(0, 3)
    };
  }, [payments]);

  // Calculate pagination
  const totalPages = Math.ceil(totalRows / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;

  // Remove handleRowSelect and handleSelectAll
  // const handleRowSelect = (id) => { ... }
  // const handleSelectAll = (i) => { ... }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleAddNew = () => {
    setPaymentToEdit(null); // Reset edit state for new payment
    setShowPaymentDialog(true);
  };

  const handleEdit = (id) => {
    setOpenMenuId(null);
    const payment = payments.find(pay => (pay._id || pay.id) === id);
    setPaymentToEdit(payment);
    setShowPaymentDialog(true);
  };

  const handleDeleteClick = (id = null) => {
    if (id) {
      setDeleteId(id);
    } else {
      setDeleteId(null); // For multiple delete
    }
    setShowDeleteConfirm(true);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    try {
      const date = new Date(dateString);
      return isNaN(date) ? 'Invalid Date' : date.toLocaleDateString('en-US', options);
    } catch (error) {
      return 'Invalid Date';
    }
  };

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

  const getPaymentTypeColor = (type) => {
    const colors = {
      salary: 'bg-blue-100 text-blue-800 border-blue-200',
      subscription: 'bg-green-100 text-green-800 border-green-200',
      one_time: 'bg-purple-100 text-purple-800 border-purple-200',
      commission: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      bonus: 'bg-orange-100 text-orange-800 border-orange-200',
      refund: 'bg-red-100 text-red-800 border-red-200',
      installment: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      advance: 'bg-teal-100 text-teal-800 border-teal-200',
      default: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type] || colors.default;
  };

  const getPaymentTypeIcon = (type) => {
    const icons = {
      salary: <Wallet className="w-3 h-3" />,
      subscription: <Calendar className="w-3 h-3" />,
      one_time: <Zap className="w-3 h-3" />,
      commission: <TrendingUp className="w-3 h-3" />,
      bonus: <Award className="w-3 h-3" />,
      refund: <ArrowDownRight className="w-3 h-3" />,
      installment: <BarChart3 className="w-3 h-3" />,
      advance: <ArrowUpRight className="w-3 h-3" />,
      default: <Receipt className="w-3 h-3" />
    };
    return icons[type] || icons.default;
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

  // Handler to add new payment to the list
  const handlePaymentSuccess = (newPayment) => {
    setPayments(prev => [newPayment, ...prev]);
    setShowPaymentDialog(false);
  };

  return (
    <div className="w-full font-sans px-4 sm:px-6 lg:px-8 space-y-2">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* Main Card Container */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/20 overflow-hidden mx-auto max-w-full transition-all duration-300 ">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-3xl" />

        <PaymentInsight
          onAddPayment={() => setShowPaymentDialog(true)}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
        />
       

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 sm:px-8  pb-4">
          <div className="flex items-center gap-4">
            <h2 className="flex items-center gap-3 text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
              <DollarSign className="text-indigo-500" size={28} />
              Payment Records
            </h2>
          </div>
         
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto px-2 sm:px-6 pb-6">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-200">
                {/* Remove selection checkbox header */}
                {/* <th className="px-3 py-4 text-center w-12">
                  <input ... />
                </th> */}
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">Payment Details</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Payer</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Amount</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Type</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => <ShimmerRow key={idx} />)
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="text-center py-12">
                      <div className="text-slate-300 mb-4"><Plus size={48} className="mx-auto" /></div>
                      <h3 className="text-lg font-bold text-slate-700 mb-2">No payments yet</h3>
                      <p className="text-slate-500 mb-4">Start by adding your first payment record</p>
                      <button onClick={handleAddNew} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold transition-all">
                        Add New Payment
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment, index) => (
                  <tr
                    key={payment._id || payment.id}
                    className={`group cursor-pointer transition-all duration-300 hover:shadow-md ${
                      // Remove selection highlight
                      // selectedRows.has(payment._id || payment.id) 
                      //   ? 'bg-indigo-50 border-l-4 border-indigo-500 shadow-sm' 
                      //   : 'hover:bg-slate-50'
                      'hover:bg-slate-50'
                    } ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                    // Remove onClick for row selection
                  >
                    {/* Remove selection checkbox cell */}
                    {/* <td className="px-3 py-4 text-center">
                      <input ... />
                    </td> */}
                    {/* Payment Details */}
                    <td className="px-3 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                          {payment.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-800 truncate" title={payment.name}>
                              {payment.name}
                            </h4>
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(payment.date)}</span>
                          </div>
                          {payment.notes && (
                            <div className="mt-1 text-xs text-slate-400 italic truncate" title={payment.notes}>
                              {payment.notes.length > 20 ? `${payment.notes.slice(0, 20)}...` : payment.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Payer */}
                    <td className="px-3 py-4 text-center">
                      <span className="text-slate-700 font-medium">{payment.payer}</span>
                    </td>
                    {/* Amount */}
                    <td className="px-3 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <div className="text-lg font-bold text-slate-800 mb-1">
                          {formatCurrency(payment.amount)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {payment.amount > insights?.averageAmount ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <TrendingUp className="w-3 h-3" />
                              Above avg
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-slate-400">
                              <TrendingDown className="w-3 h-3" />
                              Below avg
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Payment Type */}
                    <td className="px-3 py-4 text-center">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getPaymentTypeColor(payment.payment_type)}`}>
                          {getPaymentTypeIcon(payment.payment_type)}
                          {payment.payment_type === 'custom' 
                            ? payment.custom_payment_type 
                            : payment.payment_type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="px-3 py-4 text-center relative">
                      <button 
                        onClick={e => { 
                          e.stopPropagation(); 
                          setOpenMenuId(openMenuId === payment._id ? null : payment._id); 
                        }} 
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 group-hover:opacity-100"
                      >
                        <MoreVertical size={18} />
                      </button>
                      {openMenuId === payment._id && (
                        <div className="absolute right-full -mr-12 top-0 w-36 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-10 border border-slate-200">
                          <div className="py-2">
                            <button 
                              onClick={e => { 
                                e.stopPropagation(); 
                                handleEdit(payment._id || payment.id); 
                              }} 
                              className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full text-left transition-all duration-200"
                            >
                              <Edit size={16} className="mr-3" />
                              Edit
                            </button>
                            <button 
                              onClick={e => { 
                                e.stopPropagation(); 
                                handleDeleteClick(payment._id || payment.id); 
                              }} 
                              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-all duration-200"
                            >
                              <Trash2 size={16} className="mr-3" />
                              Delete
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
            <div className="px-2 sm:px-6 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100 mt-4">
              <div className="text-sm text-slate-500">
                Showing <span className="font-bold text-slate-700">{startIndex + 1}</span> to <span className="font-bold text-slate-700">{Math.min(endIndex, totalRows)}</span> of <span className="font-bold text-slate-700">{totalRows}</span> payments
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1} 
                  className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, index) => (
                    <button 
                      key={index + 1} 
                      onClick={() => handlePageChange(index + 1)} 
                      className={`px-3 py-1 rounded-xl text-sm font-medium transition-all duration-200 ${
                        currentPage === index + 1 
                          ? 'bg-indigo-600 text-white shadow-lg' 
                          : 'text-slate-600 hover:bg-indigo-100'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages} 
                  className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Remove Mobile Selection Actions */}
      {/* {selectedRows.size > 0 && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-lg p-4 z-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">
              {selectedRows.size} {selectedRows.size > 1 ? 'payments' : 'payment'} selected
            </span>
            <button
              onClick={() => handleDeleteClick()}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 px-3 py-2 hover:bg-red-50 rounded-xl transition-all duration-200"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      )} */}


        {/* Add Payment Dialog */}
        {/* {showPaymentDialog && (
        <PaymentDialog
          onClose={() => setShowPaymentDialog(false)}
          onSuccess={handlePaymentAction}
          paymentToEdit={paymentToEdit}
        />
      )} */}
       {showPaymentDialog && (
          <PaymentPopUp
            onClose={() => setShowPaymentDialog(false)}
            onSuccess={(data) => {
              if (paymentToEdit && paymentToEdit._id) {
                handleUpdatePayment(paymentToEdit._id, data);
              } else {
                handleAddPayment(data);
              }
              setShowPaymentDialog(false);
            }}
            paymentToEdit={paymentToEdit}
          />
        )}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            setShowDeleteConfirm(false);
            if (deleteId) {
              handleDeletePayment(deleteId, subtractFromWallet);
            }
            setSubtractFromWallet(false);
          }}
          title="Delete Payment"
          message={deleteId ? "Are you sure you want to delete this payment? This action cannot be undone." : "Are you sure you want to delete the selected payments? This action cannot be undone."}
          confirmText="Delete"
          cancelText="Cancel"
        >
          {deleteId && (
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={subtractFromWallet}
                onChange={e => setSubtractFromWallet(e.target.checked)}
                id="subtractFromWallet"
              />
              <label htmlFor="subtractFromWallet" className="text-sm text-slate-700">
                Do you want to subtract the deleting payment from wallet balance?
              </label>
            </div>
          )}
        </ConfirmDialog>
    </div>
  );
};

export default PaymentsTable;