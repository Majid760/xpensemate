import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, ChevronDown } from 'lucide-react';
import Toast from './Toast';
import { useTranslation } from 'react-i18next';

const PaymentDialog = ({ onClose, onSuccess, paymentToEdit }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    payer: '',
    payment_type: 'one_time',
    custom_payment_type: '',
    detail: ''
  });
  const { t } = useTranslation();

  const [showCustomTypeInput, setShowCustomTypeInput] = useState(false);
  const [isPaymentTypeOpen, setPaymentTypeOpen] = useState(false);
  const paymentTypeRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (paymentTypeRef.current && !paymentTypeRef.current.contains(event.target)) {
        setPaymentTypeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Effect to pre-fill form when in edit mode
  useEffect(() => {
    if (paymentToEdit) {
      setFormData({
        _id: paymentToEdit._id,
        name: paymentToEdit.name || '',
        amount: paymentToEdit.amount || '',
        date: paymentToEdit.date ? new Date(paymentToEdit.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        payer: paymentToEdit.payer || '',
        payment_type: paymentToEdit.payment_type || 'one_time',
        custom_payment_type: paymentToEdit.custom_payment_type || '',
        detail: paymentToEdit.notes || ''
      });
      // Show custom input if payment type is custom
      if (paymentToEdit.payment_type === 'custom') {
        setShowCustomTypeInput(true);
      }
    }
  }, [paymentToEdit]);


  const paymentTypes = [
    { value: 'salary', label: 'Salary' },
    { value: 'subscription', label: 'Subscription' },
    { value: 'one_time', label: 'One-time Payment' },
    { value: 'installment', label: 'Installment' },
    { value: 'advance', label: 'Advance Payment' },
    { value: 'bonus', label: 'Bonus' },
    { value: 'commission', label: 'Commission' },
    { value: 'donation', label: 'Donation' },
    { value: 'refund', label: 'Refund' },
    { value: 'reimbursement', label: 'Reimbursement' },
    { value: 'penalty', label: 'Penalty/Fine' },
    { value: 'tax', label: 'Tax Payment' },
    { value: 'royalty', label: 'Royalty Payment' },
    { value: 'loan_repayment', label: 'Loan Repayment' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handlePaymentTypeChange = (value) => {
    if (value === 'custom') {
      setShowCustomTypeInput(true);
      handleInputChange('payment_type', 'custom');
    } else {
      setShowCustomTypeInput(false);
      handleInputChange('payment_type', value);
      handleInputChange('custom_payment_type', '');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('paymentPopUp.validation.nameRequired');
    } else if (formData.name.length < 2) {
      newErrors.name = t('paymentPopUp.validation.nameLength');
    } else if (formData.name.length > 150) {
      newErrors.name = t('paymentPopUp.validation.nameMaxLength');
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0 || parseFloat(formData.amount) > 1000000000) {
      newErrors.amount = t('paymentPopUp.validation.amountRequired');
    }

    if (!formData.date) {
      newErrors.date = t('paymentPopUp.validation.dateRequired');
    }

    if (!formData.payer.trim()) {
      newErrors.payer = t('paymentPopUp.validation.payerRequired');
    } else if (formData.payer.length < 2) {
      newErrors.payer = t('paymentPopUp.validation.payerLength');
    } else if (formData.payer.length > 100) {
      newErrors.payer = t('paymentPopUp.validation.payerMaxLength');
    }

    if (formData.payment_type === 'custom' && !formData.custom_payment_type.trim()) {
      newErrors.custom_payment_type = t('paymentPopUp.validation.customPaymentTypeRequired');
    }

    if (formData.detail && formData.detail.length > 500) {
      newErrors.detail = t('paymentPopUp.validation.detailMaxLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const paymentData = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        date: formData.date,
        payer: formData.payer,
        payment_type: formData.payment_type,
        notes: formData.detail || ''
      };

      // Add custom_payment_type only if payment_type is 'custom'
      if (formData.payment_type === 'custom') {
        paymentData.custom_payment_type = formData.custom_payment_type;
      }

      // If editing, include the ID
      if (paymentToEdit) {
        paymentData._id = paymentToEdit._id;
      }

      // Pass the data to parent component
      onSuccess(paymentData);
      onClose();
    } catch (error) {
      console.error('Error preparing payment data:', error);
      setToast({
        type: 'error',
        message: error.message || t('paymentPopUp.error.preparingData')
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-2xl mx-auto transform transition-all max-h-[90vh] overflow-y-auto font-['Poppins']">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 pb-4 bg-indigo-600 sticky top-0 z-10 rounded-t-2xl">
          <h2 className="text-xl sm:text-2xl font-bold text-white">{paymentToEdit ? t('paymentPopUp.editTitle') : t('paymentPopUp.newTitle')}</h2>
          <button 
            onClick={() => {
              setIsOpen(false);
              if (onClose) onClose();
            }}
            className="p-2 text-indigo-100 hover:text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="px-4 sm:px-6 mt-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="block text-base sm:text-lg font-semibold text-gray-700">
              {t('paymentPopUp.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium text-sm sm:text-base transition-all duration-200 outline-none
                ${ errors.name ? 'border-red-500 ring-2 ring-red-500/20' : 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' }`}
              placeholder={t('paymentPopUp.namePlaceholder')}
              disabled={loading}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          {/* Amount and Date Fields */}
          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
            {/* Amount Field */}
            <div className="space-y-2">
              <label className="block text-base sm:text-lg font-semibold text-gray-700">
                {t('paymentPopUp.amount')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium text-sm sm:text-base transition-all duration-200 outline-none
                  ${ errors.amount ? 'border-red-500 ring-2 ring-red-500/20' : 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' }`}
                placeholder={t('paymentPopUp.amountPlaceholder')}
                disabled={loading}
              />
              {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
            </div>

            {/* Date Field */}
            <div className="space-y-2">
              <label className="block text-base sm:text-lg font-semibold text-gray-700">
                {t('paymentPopUp.date')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium text-sm sm:text-base transition-all duration-200 outline-none
                    ${ errors.date ? 'border-red-500 ring-2 ring-red-500/20' : 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' }`}
                  disabled={loading}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-600 pointer-events-none" />
              </div>
              {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
            </div>
          </div>

          {/* Payer and Payment Type Fields */}
          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
            {/* Payer Field */}
            <div className="space-y-2">
              <label className="block text-base sm:text-lg font-semibold text-gray-700">
                {t('paymentPopUp.payer')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.payer}
                onChange={(e) => handleInputChange('payer', e.target.value)}
                className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium text-sm sm:text-base transition-all duration-200 outline-none
                  ${ errors.payer ? 'border-red-500 ring-2 ring-red-500/20' : 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' }`}
                placeholder={t('paymentPopUp.payerPlaceholder')}
                disabled={loading}
              />
              {errors.payer && <p className="text-red-500 text-sm">{errors.payer}</p>}
            </div>

            {/* Payment Type Field */}
            <div className="space-y-2">
              <label className="block text-base sm:text-lg font-semibold text-gray-700">
                {t('paymentPopUp.paymentType')} <span className="text-red-500">*</span>
              </label>
              <div className="relative" ref={paymentTypeRef}>
                <button
                  type="button"
                  className={`w-full flex items-center justify-between gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  onClick={() => setPaymentTypeOpen((o) => !o)}
                  disabled={loading}
                >
                  <span className="truncate capitalize">
                    {formData.payment_type === 'custom' 
                      ? 'Custom Type' 
                      : paymentTypes.find(m => m.value === formData.payment_type)?.label || t('paymentPopUp.selectType')}
                  </span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isPaymentTypeOpen ? 'rotate-180' : ''}`} />
                </button>
                {isPaymentTypeOpen && (
                  <div className="absolute mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden animate-fadeIn max-h-60 overflow-y-auto">
                    {paymentTypes.map(method => (
                      <button
                        key={method.value}
                        type="button"
                        className={`w-full text-left px-4 py-3 text-sm font-semibold capitalize transition-colors duration-150 ${formData.payment_type === method.value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'}`}
                        onClick={() => {
                          handlePaymentTypeChange(method.value);
                          setPaymentTypeOpen(false);
                        }}
                      >
                        {method.label}
                      </button>
                    ))}
                     <button
                        type="button"
                        className={`w-full text-left px-4 py-3 text-sm font-semibold capitalize transition-colors duration-150 ${formData.payment_type === 'custom' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'}`}
                        onClick={() => {
                          handlePaymentTypeChange('custom');
                          setPaymentTypeOpen(false);
                        }}
                      >
                        + {t('paymentPopUp.addCustomType')}
                      </button>
                  </div>
                )}
              </div>
              {showCustomTypeInput && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={formData.custom_payment_type}
                    onChange={(e) => handleInputChange('custom_payment_type', e.target.value)}
                    placeholder={t('paymentPopUp.customPaymentTypePlaceholder')}
                    className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium text-sm sm:text-base transition-all duration-200 outline-none
                      ${ errors.custom_payment_type ? 'border-red-500 ring-2 ring-red-500/20' : 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' }`}
                    disabled={loading}
                  />
                  {errors.custom_payment_type && (
                    <p className="text-red-500 text-sm mt-1">{errors.custom_payment_type}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Notes Field */}
          <div className="space-y-2">
            <label className="block text-base sm:text-lg font-semibold text-gray-700">
              {t('paymentPopUp.note')}
            </label>
            <textarea
              value={formData.detail}
              onChange={(e) => handleInputChange('detail', e.target.value)}
              className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium text-sm sm:text-base resize-y min-h-[80px] transition-all duration-200 outline-none
                ${ errors.detail ? 'border-red-500 ring-2 ring-red-500/20' : 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' }`}
              placeholder={t('paymentPopUp.notePlaceholder')}
              disabled={loading}
            ></textarea>
            {errors.detail && <p className="text-red-500 text-sm">{errors.detail}</p>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end p-4 sm:p-6 pt-4">
          <button
              type="button"
            onClick={handleSubmit}
            disabled={loading}
              className={`px-6 py-3 rounded-xl font-bold text-white transition-all duration-200 active:scale-95 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'}`}
          >
              {loading ? t('paymentPopUp.saving') : (paymentToEdit ? t('paymentPopUp.updatePayment') : t('paymentPopUp.addPaymentBtn'))}
          </button>
        </div>
      </div>
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

export default PaymentDialog; 