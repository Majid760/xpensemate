import React, { useState, useEffect, useCallback, useMemo } from 'react';
import StatCard from "./StatCard";
import PaymentInsight from './PaymentInsight';
import PaymentPopUp from './PaymentPopUp';
import { 
  MoreVertical, Plus, Trash2, ChevronLeft, ChevronRight, Edit, DollarSign,
  TrendingUp, TrendingDown, Calendar, User, CreditCard, Receipt,
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Clock, Target,
  Wallet, AlertCircle, CheckCircle, Award, Zap
} from 'lucide-react';


const PaymentsTable = () => {
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
  const [deleteType, setDeleteType] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm] = useState('');
  const [dateFilter] = useState({ startDate: null, endDate: null });
  const [amountFilter] = useState({ min: null, max: null });
  const [showInsights, setShowInsights] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockPayments = [
      { _id: '1', name: 'Salary Payment', amount: 5000, date: '2024-01-15', payer: 'Tech Corp', payment_type: 'salary', notes: 'Monthly salary payment' },
      { _id: '2', name: 'Freelance Project', amount: 1200, date: '2024-01-10', payer: 'Creative Agency', payment_type: 'one_time', notes: 'Website design project' },
      { _id: '3', name: 'Commission', amount: 800, date: '2024-01-08', payer: 'Sales Team', payment_type: 'commission', notes: 'Q4 sales commission' },
      { _id: '4', name: 'Subscription Revenue', amount: 99, date: '2024-01-05', payer: 'Client A', payment_type: 'subscription', notes: 'Monthly subscription' },
      { _id: '5', name: 'Bonus Payment', amount: 2000, date: '2024-01-03', payer: 'Tech Corp', payment_type: 'bonus', notes: 'Year-end bonus' },
      { _id: '6', name: 'Refund', amount: 150, date: '2024-01-02', payer: 'Service Provider', payment_type: 'refund', notes: 'Service refund' },
      { _id: '7', name: 'Consulting Fee', amount: 1500, date: '2024-01-01', payer: 'Startup Inc', payment_type: 'one_time', notes: 'Strategy consultation' },
    ];
    
    setPayments(mockPayments);
    setTotalRows(mockPayments.length);
    setLoading(false);
    setIsInitialLoad(false);
  }, []);

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

  // Mock functions for demo
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

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleAddNew = () => {
    console.log('yeeeees etenrerelrkj eljf');
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
      setDeleteType('single');
      setDeleteId(id);
    } else {
      setDeleteType('multiple');
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
    <div className="w-full font-sans px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Main Card Container */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/20 overflow-hidden mx-auto max-w-full transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-3xl" />

        <PaymentInsight
          insights={insights}
          loading={loading}
          onAddPayment={() => setShowPaymentDialog(true)}
        />
       

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 sm:px-8 pt-6 pb-4">
          <div className="flex items-center gap-4">
            <h2 className="flex items-center gap-3 text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
              <DollarSign className="text-indigo-500" size={28} />
              Payment Records
            </h2>
            <button
              onClick={() => setShowInsights(!showInsights)}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <PieChart size={16} />
              {showInsights ? 'Hide' : 'Show'} Insights
            </button>
          </div>
          <div className="flex items-center gap-2">
            {selectedRows.size > 0 && (
              <button
                onClick={() => handleDeleteClick()}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2 rounded-xl shadow transition-all duration-200 active:scale-95 text-sm"
              >
                <Trash2 size={16} />
                Delete ({selectedRows.size})
              </button>
            )}
            
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto px-2 sm:px-6 pb-6">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-3 py-4 text-center w-12">
                  <input
                    type="checkbox"
                    checked={payments.length > 0 && selectedRows.size === payments.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                </th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">Payment Details</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Amount</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Type</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-400 animate-pulse">Loading payments...</td>
                </tr>
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
                      selectedRows.has(payment._id || payment.id) 
                        ? 'bg-indigo-50 border-l-4 border-indigo-500 shadow-sm' 
                        : 'hover:bg-slate-50'
                    } ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
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
                    
                    {/* Payment Details - Enhanced with more info */}
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
                          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                            <User className="w-3 h-3" />
                            <span className="truncate" title={payment.payer}>{payment.payer}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(payment.date)}</span>
                          </div>
                          {payment.notes && (
                            <div className="mt-1 text-xs text-slate-400 italic truncate" title={payment.notes}>
                              "{payment.notes}"
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Amount - Enhanced with visual impact */}
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

                    {/* Payment Type - Enhanced with icons and colors */}
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
                              Edit Payment
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

      {/* Mobile Selection Actions */}
      {selectedRows.size > 0 && (
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
      )}


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
            onSuccess={handlePaymentSuccess}
          />
        )}
    </div>
  );
};

export default PaymentsTable;