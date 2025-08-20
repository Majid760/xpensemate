import React, { useState, useEffect } from 'react';
import { Camera, Calendar, User } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Select from 'react-select';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Toast from './Toast';
import Loader from './Loader';
import { useTranslation } from 'react-i18next';

const SettingsContent = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dob: '',
    phoneNumber: '',
    selectedCurrency: null,
    gender: '',
    bio: '',
    profilePhotoUrl: '',
    coverPhotoUrl: ''
  });
  const [dateError,] = useState('');
  const [, setProfileCompletion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedProfilePhoto, setSelectedProfilePhoto] = useState(null);
  const [selectedCoverPhoto, setSelectedCoverPhoto] = useState(null);
  const [previewProfileUrl, setPreviewProfileUrl] = useState('');
  const [previewCoverUrl, setPreviewCoverUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [showProfileUpload, setShowProfileUpload] = useState(false);
  const [showCoverUpload, setShowCoverUpload] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null);

  const currencyOptions = [
    { value: 'AED', label: 'UAE Dirham', flag: '🇦🇪' },
    { value: 'AFN', label: 'Afghan Afghani', flag: '🇦🇫' },
    { value: 'ALL', label: 'Albanian Lek', flag: '🇦🇱' },
    { value: 'AMD', label: 'Armenian Dram', flag: '🇦🇲' },
    { value: 'ANG', label: 'Netherlands Antillean Guilder', flag: '🇨🇼' },
    { value: 'AOA', label: 'Angolan Kwanza', flag: '🇦🇴' },
    { value: 'ARS', label: 'Argentine Peso', flag: '🇦🇷' },
    { value: 'AUD', label: 'Australian Dollar', flag: '🇦🇺' },
    { value: 'AWG', label: 'Aruban Florin', flag: '🇦🇼' },
    { value: 'AZN', label: 'Azerbaijani Manat', flag: '🇦🇿' },
    { value: 'BAM', label: 'Bosnia-Herzegovina Convertible Mark', flag: '🇧🇦' },
    { value: 'BBD', label: 'Barbadian Dollar', flag: '🇧🇧' },
    { value: 'BDT', label: 'Bangladeshi Taka', flag: '🇧🇩' },
    { value: 'BGN', label: 'Bulgarian Lev', flag: '🇧🇬' },
    { value: 'BHD', label: 'Bahraini Dinar', flag: '🇧🇭' },
    { value: 'BIF', label: 'Burundian Franc', flag: '🇧🇮' },
    { value: 'BMD', label: 'Bermudan Dollar', flag: '🇧🇲' },
    { value: 'BND', label: 'Brunei Dollar', flag: '🇧🇳' },
    { value: 'BOB', label: 'Bolivian Boliviano', flag: '🇧🇴' },
    { value: 'BRL', label: 'Brazilian Real', flag: '🇧🇷' },
    { value: 'BSD', label: 'Bahamian Dollar', flag: '🇧🇸' },
    { value: 'BTC', label: 'Bitcoin', flag: '₿' },
    { value: 'BTN', label: 'Bhutanese Ngultrum', flag: '🇧🇹' },
    { value: 'BWP', label: 'Botswanan Pula', flag: '🇧🇼' },
    { value: 'BYN', label: 'Belarusian Ruble', flag: '🇧🇾' },
    { value: 'BZD', label: 'Belize Dollar', flag: '🇧🇿' },
    { value: 'CAD', label: 'Canadian Dollar', flag: '🇨🇦' },
    { value: 'CDF', label: 'Congolese Franc', flag: '🇨🇩' },
    { value: 'CHF', label: 'Swiss Franc', flag: '🇨🇭' },
    { value: 'CLF', label: 'Chilean Unit of Account (UF)', flag: '🇨🇱' },
    { value: 'CLP', label: 'Chilean Peso', flag: '🇨🇱' },
    { value: 'CNH', label: 'Chinese Yuan (Offshore)', flag: '🇨🇳' },
    { value: 'CNY', label: 'Chinese Yuan', flag: '🇨🇳' },
    { value: 'COP', label: 'Colombian Peso', flag: '🇨🇴' },
    { value: 'CRC', label: 'Costa Rican Colón', flag: '🇨🇷' },
    { value: 'CUC', label: 'Cuban Convertible Peso', flag: '🇨🇺' },
    { value: 'CUP', label: 'Cuban Peso', flag: '🇨🇺' },
    { value: 'CVE', label: 'Cape Verdean Escudo', flag: '🇨🇻' },
    { value: 'CZK', label: 'Czech Republic Koruna', flag: '🇨🇿' },
    { value: 'DJF', label: 'Djiboutian Franc', flag: '🇩🇯' },
    { value: 'DKK', label: 'Danish Krone', flag: '🇩🇰' },
    { value: 'DOP', label: 'Dominican Peso', flag: '🇩🇴' },
    { value: 'DZD', label: 'Algerian Dinar', flag: '🇩🇿' },
    { value: 'EGP', label: 'Egyptian Pound', flag: '🇪🇬' },
    { value: 'ERN', label: 'Eritrean Nakfa', flag: '🇪🇷' },
    { value: 'ETB', label: 'Ethiopian Birr', flag: '🇪🇹' },
    { value: 'EUR', label: 'Euro', flag: '🇪🇺' },
    { value: 'FJD', label: 'Fijian Dollar', flag: '🇫🇯' },
    { value: 'FKP', label: 'Falkland Islands Pound', flag: '🇫🇰' },
    { value: 'GBP', label: 'British Pound Sterling', flag: '🇬🇧' },
    { value: 'GEL', label: 'Georgian Lari', flag: '🇬🇪' },
    { value: 'GGP', label: 'Guernsey Pound', flag: '🇬🇬' },
    { value: 'GHS', label: 'Ghanaian Cedi', flag: '🇬🇭' },
    { value: 'GIP', label: 'Gibraltar Pound', flag: '🇬🇮' },
    { value: 'GMD', label: 'Gambian Dalasi', flag: '🇬🇲' },
    { value: 'GNF', label: 'Guinean Franc', flag: '🇬🇳' },
    { value: 'GTQ', label: 'Guatemalan Quetzal', flag: '🇬🇹' },
    { value: 'GYD', label: 'Guyanaese Dollar', flag: '🇬🇾' },
    { value: 'HKD', label: 'Hong Kong Dollar', flag: '🇭🇰' },
    { value: 'HNL', label: 'Honduran Lempira', flag: '🇭🇳' },
    { value: 'HRK', label: 'Croatian Kuna', flag: '🇭🇷' },
    { value: 'HTG', label: 'Haitian Gourde', flag: '🇭🇹' },
    { value: 'HUF', label: 'Hungarian Forint', flag: '🇭🇺' },
    { value: 'IDR', label: 'Indonesian Rupiah', flag: '🇮🇩' },
    { value: 'ILS', label: 'Israeli New Sheqel', flag: '🇮🇱' },
    { value: 'IMP', label: 'Manx pound', flag: '🇮🇲' },
    { value: 'INR', label: 'Indian Rupee', flag: '🇮🇳' },
    { value: 'IQD', label: 'Iraqi Dinar', flag: '🇮🇶' },
    { value: 'IRR', label: 'Iranian Rial', flag: '🇮🇷' },
    { value: 'ISK', label: 'Icelandic Króna', flag: '🇮🇸' },
    { value: 'JEP', label: 'Jersey Pound', flag: '🇯🇪' },
    { value: 'JMD', label: 'Jamaican Dollar', flag: '🇯🇲' },
    { value: 'JOD', label: 'Jordanian Dinar', flag: '🇯🇴' },
    { value: 'JPY', label: 'Japanese Yen', flag: '🇯🇵' },
    { value: 'KES', label: 'Kenyan Shilling', flag: '🇰🇪' },
    { value: 'KGS', label: 'Kyrgystani Som', flag: '🇰🇬' },
    { value: 'KHR', label: 'Cambodian Riel', flag: '🇰🇭' },
    { value: 'KMF', label: 'Comorian Franc', flag: '🇰🇲' },
    { value: 'KPW', label: 'North Korean Won', flag: '🇰🇵' },
    { value: 'KRW', label: 'South Korean Won', flag: '🇰🇷' },
    { value: 'KWD', label: 'Kuwaiti Dinar', flag: '🇰🇼' },
    { value: 'KYD', label: 'Cayman Islands Dollar', flag: '🇰🇾' },
    { value: 'KZT', label: 'Kazakhstani Tenge', flag: '🇰🇿' },
    { value: 'LAK', label: 'Laotian Kip', flag: '🇱🇦' },
    { value: 'LBP', label: 'Lebanese Pound', flag: '🇱🇧' },
    { value: 'LKR', label: 'Sri Lankan Rupee', flag: '🇱🇰' },
    { value: 'LRD', label: 'Liberian Dollar', flag: '🇱🇷' },
    { value: 'LSL', label: 'Lesotho Loti', flag: '🇱🇸' },
    { value: 'LYD', label: 'Libyan Dinar', flag: '🇱🇾' },
    { value: 'MAD', label: 'Moroccan Dirham', flag: '🇲🇦' },
    { value: 'MDL', label: 'Moldovan Leu', flag: '🇲🇩' },
    { value: 'MGA', label: 'Malagasy Ariary', flag: '🇲🇬' },
    { value: 'MKD', label: 'Macedonian Denar', flag: '🇲🇰' },
    { value: 'MMK', label: 'Myanma Kyat', flag: '🇲🇲' },
    { value: 'MNT', label: 'Mongolian Tugrik', flag: '🇲🇳' },
    { value: 'MOP', label: 'Macanese Pataca', flag: '🇲🇴' },
    { value: 'MRU', label: 'Mauritanian Ouguiya', flag: '🇲🇷' },
    { value: 'MUR', label: 'Mauritian Rupee', flag: '🇲🇺' },
    { value: 'MVR', label: 'Maldivian Rufiyaa', flag: '🇲🇻' },
    { value: 'MWK', label: 'Malawian Kwacha', flag: '🇲🇼' },
    { value: 'MXN', label: 'Mexican Peso', flag: '🇲🇽' },
    { value: 'MYR', label: 'Malaysian Ringgit', flag: '🇲🇾' },
    { value: 'MZN', label: 'Mozambican Metical', flag: '🇲🇿' },
    { value: 'NAD', label: 'Namibian Dollar', flag: '🇳🇦' },
    { value: 'NGN', label: 'Nigerian Naira', flag: '🇳🇬' },
    { value: 'NIO', label: 'Nicaraguan Córdoba', flag: '🇳🇮' },
    { value: 'NOK', label: 'Norwegian Krone', flag: '🇳🇴' },
    { value: 'NPR', label: 'Nepalese Rupee', flag: '🇳🇵' },
    { value: 'NZD', label: 'New Zealand Dollar', flag: '🇳🇿' },
    { value: 'OMR', label: 'Omani Rial', flag: '🇴🇲' },
    { value: 'PAB', label: 'Panamanian Balboa', flag: '🇵🇦' },
    { value: 'PEN', label: 'Peruvian Nuevo Sol', flag: '🇵🇪' },
    { value: 'PGK', label: 'Papua New Guinean Kina', flag: '🇵🇬' },
    { value: 'PHP', label: 'Philippine Peso', flag: '🇵🇭' },
    { value: 'PKR', label: 'Pakistani Rupee', flag: '🇵🇰' },
    { value: 'PLN', label: 'Polish Zloty', flag: '🇵🇱' },
    { value: 'PYG', label: 'Paraguayan Guarani', flag: '🇵🇾' },
    { value: 'QAR', label: 'Qatari Rial', flag: '🇶🇦' },
    { value: 'RON', label: 'Romanian Leu', flag: '🇷🇴' },
    { value: 'RSD', label: 'Serbian Dinar', flag: '🇷🇸' },
    { value: 'RUB', label: 'Russian Ruble', flag: '🇷🇺' },
    { value: 'RWF', label: 'Rwandan Franc', flag: '🇷🇼' },
    { value: 'SAR', label: 'Saudi Riyal', flag: '🇸🇦' },
    { value: 'SBD', label: 'Solomon Islands Dollar', flag: '🇸🇧' },
    { value: 'SCR', label: 'Seychellois Rupee', flag: '🇸🇨' },
    { value: 'SDG', label: 'Sudanese Pound', flag: '🇸🇩' },
    { value: 'SEK', label: 'Swedish Krona', flag: '🇸🇪' },
    { value: 'SGD', label: 'Singapore Dollar', flag: '🇸🇬' },
    { value: 'SHP', label: 'Saint Helena Pound', flag: '🇸🇭' },
    { value: 'SLL', label: 'Sierra Leonean Leone', flag: '🇸🇱' },
    { value: 'SOS', label: 'Somali Shilling', flag: '🇸🇴' },
    { value: 'SRD', label: 'Surinamese Dollar', flag: '🇸🇷' },
    { value: 'SSP', label: 'South Sudanese Pound', flag: '🇸🇸' },
    { value: 'STD', label: 'São Tomé and Príncipe Dobra', flag: '🇸🇹' },
    { value: 'STN', label: 'São Tomé and Príncipe Dobra', flag: '🇸🇹' },
    { value: 'SVC', label: 'Salvadoran Colón', flag: '🇸🇻' },
    { value: 'SYP', label: 'Syrian Pound', flag: '🇸🇾' },
    { value: 'SZL', label: 'Swazi Lilangeni', flag: '🇸🇿' },
    { value: 'THB', label: 'Thai Baht', flag: '🇹🇭' },
    { value: 'TJS', label: 'Tajikistani Somoni', flag: '🇹🇯' },
    { value: 'TMT', label: 'Turkmenistani Manat', flag: '🇹🇲' },
    { value: 'TND', label: 'Tunisian Dinar', flag: '🇹🇳' },
    { value: 'TOP', label: 'Tongan Pa anga', flag: '🇹🇴' },
    { value: 'TRY', label: 'Turkish Lira', flag: '🇹🇷' },
    { value: 'TTD', label: 'Trinidad and Tobago Dollar', flag: '🇹🇹' },
    { value: 'TWD', label: 'New Taiwan Dollar', flag: '🇹🇼' },
    { value: 'TZS', label: 'Tanzanian Shilling', flag: '🇹🇿' },
    { value: 'UAH', label: 'Ukrainian Hryvnia', flag: '🇺🇦' },
    { value: 'UGX', label: 'Ugandan Shilling', flag: '🇺🇬' },
    { value: 'USD', label: 'United States Dollar', flag: '🇺🇸' },
    { value: 'UYU', label: 'Uruguayan Peso', flag: '🇺🇾' },
    { value: 'UZS', label: 'Uzbekistan Som', flag: '🇺🇿' },
    { value: 'VES', label: 'Venezuelan Bolívar', flag: '🇻🇪' },
    { value: 'VND', label: 'Vietnamese Dong', flag: '🇻🇳' },
    { value: 'VUV', label: 'Vanuatu Vatu', flag: '🇻🇺' },
    { value: 'WST', label: 'Samoan Tala', flag: '🇼🇸' },
    { value: 'XAF', label: 'CFA Franc BEAC', flag: '🇨🇲' },
    { value: 'XAG', label: 'Silver Ounce', flag: '⚪' },
    { value: 'XAU', label: 'Gold Ounce', flag: '🟡' },
    { value: 'XCD', label: 'East Caribbean Dollar', flag: '🇦🇮' },
    { value: 'XDR', label: 'Special Drawing Rights', flag: '🌐' },
    { value: 'XOF', label: 'CFA Franc BCEAO', flag: '🇧🇯' },
    { value: 'XPD', label: 'Palladium Ounce', flag: '⚪' },
    { value: 'XPF', label: 'CFP Franc', flag: '🇵🇫' },
    { value: 'XPT', label: 'Platinum Ounce', flag: '⚪' },
    { value: 'YER', label: 'Yemeni Rial', flag: '🇾🇪' },
    { value: 'ZAR', label: 'South African Rand', flag: '🇿🇦' },
    { value: 'ZMW', label: 'Zambian Kwacha', flag: '🇿🇲' },
    { value: 'ZWL', label: 'Zimbabwean Dollar', flag: '🇿🇼' }
  ];



  const formatOptionLabel = ({ flag, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span>{flag}</span>
      <span>{label}</span>
    </div>
  );

  const calculateProfileCompletion = (user) => {
    const requiredFields = ['firstName', 'email'];
    const optionalFields = [
      'lastName',
      'coverPhotoUrl',
      'profilePhotoUrl',
      'dob',
      'currency',
      'about',
      'gender',
      'contactNumber'
    ];
    const totalFields = requiredFields.length + optionalFields.length;
    let completedFields = 0;

    // Check required fields
    requiredFields.forEach(field => {
      if (user[field]) completedFields++;
    });

    // Check optional fields
    optionalFields.forEach(field => {
      if (user[field]) {
        if (field === 'currency' && user[field].value) {
          completedFields++;
        } else {
          completedFields++;
        }
      }
    });

    const completion = Math.round((completedFields / totalFields) * 100);
    return completion;
  };

  useEffect(() => {
    if (user) {      
      const newFormData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
        phoneNumber: user.contactNumber || '',
        selectedCurrency: user.currency || { value: 'USD', label: 'United States Dollar', flag: '🇺🇸' },
        gender: user.gender || '',
        bio: user.about || '',
        profilePhotoUrl: user.profilePhotoUrl || '',
        coverPhotoUrl: user.coverPhotoUrl || ''
      };
      
      setFormData(newFormData);
      setInitialFormData(newFormData);
      setPreviewProfileUrl(user.profilePhotoUrl || '');
      setPreviewCoverUrl(user.coverPhotoUrl || '');

      // Calculate profile completion
      const completion = calculateProfileCompletion({
        ...user,
        currency: user.currency || { value: 'USD', label: 'United States Dollar', flag: '🇺🇸' }
      });
      console.log('Profile completion calculated:', completion); // Debug log
      setProfileCompletion(completion);
    }
  }, [user]);

  const hasFormDataChanged = () => {
    if (!initialFormData) return false;

    // Check if any field has changed
    const fieldsToCheck = [
      'firstName',
      'lastName',
      'dob',
      'phoneNumber',
      'selectedCurrency',
      'gender',
      'bio'
    ];

    for (const field of fieldsToCheck) {
      if (field === 'selectedCurrency') {
        if (JSON.stringify(formData[field]) !== JSON.stringify(initialFormData[field])) {
          return true;
        }
      } else if (formData[field] !== initialFormData[field]) {
        return true;
      }
    }

    // Check if photos have changed
    if (selectedProfilePhoto || selectedCoverPhoto) {
      return true;
    }

    return false;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoSelect = (type, file) => {
    if (!file) return;

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, JPEG, and PNG files are allowed');
      return;
    }

    // Check file size (max 5MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setError('File size should be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'profile') {
        setSelectedProfilePhoto(file);
        setPreviewProfileUrl(reader.result);
      } else {
        setSelectedCoverPhoto(file);
        setPreviewCoverUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (type, file) => {
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await axios.post(`/settings/upload-${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data.url;
    } catch (error) {
      console.error(`Error uploading ${type} photo:`, error);
      throw new Error(`Failed to upload ${type} photo`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasFormDataChanged()) {
      setError('No changes detected. Please make changes before saving.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // First upload photos if they were changed
      let profilePhotoUrl = formData.profilePhotoUrl;
      let coverPhotoUrl = formData.coverPhotoUrl;

      if (selectedProfilePhoto) {
        profilePhotoUrl = await uploadPhoto('profile', selectedProfilePhoto);
      }

      if (selectedCoverPhoto) {
        coverPhotoUrl = await uploadPhoto('cover', selectedCoverPhoto);
      }

      // Then update user settings
      const response = await axios.put('/settings/update-user', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dob: formData.dob,
        contactNumber: formData.phoneNumber,
        currency: formData.selectedCurrency,
        gender: formData.gender,
        about: formData.bio,
        profilePhotoUrl,
        coverPhotoUrl
      });

      // Update user context with new data
      if (response.data.data) {
        updateUser(response.data.data);
        setSuccess('Settings updated successfully');
        setSelectedProfilePhoto(null);
        setSelectedCoverPhoto(null);
        // Update initial form data after successful update
        setInitialFormData(formData);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setError(error.response?.data?.error || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, JPEG, and PNG files are allowed');
      return;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setError('File size should be less than 10MB');
      return;
    }

    setFileInfo({
      name: file.name,
      type: file.type,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
    });

    handlePhotoSelect(type, file);
    // Close the upload window after successful file selection
    if (type === 'profile') {
      setShowProfileUpload(false);
    } else {
      setShowCoverUpload(false);
    }
    setFileInfo(null);
  };

  const FileUploadWindow = ({ type, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto transform transition-all">
          <div className="flex items-center justify-between p-4 sm:p-6 pb-4 bg-indigo-600 rounded-t-2xl">
            <h3 className="text-xl font-bold text-white">{t('settingContents.uploadPhotoTitle', { type: type === 'profile' ? 'Profile' : 'Cover' })}</h3>
            <button onClick={onClose} className="p-2 text-indigo-100 hover:text-white hover:bg-white/20 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6">
          <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
                isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, type)}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                  <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              
                <div className="text-slate-600">
                  <p className="font-semibold text-slate-700">{t('settingContents.dragDrop')}</p>
                <p className="text-sm mt-1">{t('settingContents.or')}</p>
                  <label className="mt-2 inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-xl cursor-pointer hover:bg-indigo-500 transition-colors duration-200 font-bold text-sm active:scale-95">
                  {t('settingContents.browseFiles')}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                        if (!allowedTypes.includes(file.type)) {
                          setError('Only JPG, JPEG, and PNG files are allowed');
                          return;
                        }
                          const maxSize = 10 * 1024 * 1024;
                        if (file.size > maxSize) {
                          setError('File size should be less than 10MB');
                          return;
                        }
                        setFileInfo({
                          name: file.name,
                          type: file.type,
                          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
                        });
                        handlePhotoSelect(type, file);
                        if (type === 'profile') {
                          setShowProfileUpload(false);
                        } else {
                          setShowCoverUpload(false);
                        }
                        setFileInfo(null);
                      }
                    }}
                  />
                </label>
              </div>

              {fileInfo && (
                  <div className="mt-4 p-4 bg-slate-100 rounded-lg text-left">
                    <h4 className="font-semibold text-slate-800 mb-2">{t('settingContents.fileInfo')}:</h4>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p><span className="font-semibold">{t('settingContents.name')}:</span> {fileInfo.name}</p>
                      <p><span className="font-semibold">{t('settingContents.type')}:</span> {fileInfo.type}</p>
                      <p><span className="font-semibold">{t('settingContents.size')}:</span> {fileInfo.size}</p>
                  </div>
                </div>
              )}

                <div className="text-xs text-slate-400 mt-4">
                <p>{t('settingContents.supportedFormats')}: JPG, JPEG, PNG</p>
                <p>{t('settingContents.maxFileSize')}: 10MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && !user) {
    // Initial load: show overlay loader
    return (
      <div className="w-full h-full lg:px-48 md:px-16 sm:px-8 overflow-y-auto relative">
        <div className="absolute inset-0 flex items-center justify-center bg-transparent z-10 pointer-events-none">
          <Loader />
        </div>
        <div className="w-full bg-transparent rounded-lg shadow-lg relative min-h-[500px] opacity-50">
          <form className="pointer-events-none">
            <div className="relative h-32 sm:h-40 md:h-48 bg-[#FFD86B]">
              {/* ... rest of the form content ... */}
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full font-sans p-4 sm:p-6 lg:p-0">
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
      {success && <Toast message={success} type="success" onClose={() => setSuccess(null)} />}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/20 overflow-hidden mx-auto max-w-5xl transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-3xl" />
        <form onSubmit={handleSubmit} className={`${loading && user ? 'opacity-100 pointer-events-none' : ''}`}> {/* Only block pointer events during update */}
        {/* Cover Photo Section */}
          <div className="relative h-48 sm:h-56 md:h-64 bg-slate-200">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          {previewCoverUrl ? (
            <img 
              src={previewCoverUrl} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200"></div>
          )}
            <button
              type="button"
            onClick={() => setShowCoverUpload(true)}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-700 font-bold px-4 py-2 text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Camera className="w-4 h-4" />
            {t('settingContents.updateCover')}
            </button>
          
          {/* Profile Picture */}
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="relative group">
              <img 
                src={previewProfileUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                alt="Profile" 
                  className="w-32 h-32 rounded-full border-4 border-white object-cover bg-white shadow-xl"
              />
                <button 
                  type="button"
                  onClick={() => setShowProfileUpload(true)}
                  className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                >
                  <Camera className="w-6 h-6" />
                </button>
            </div>
          </div>
        </div>

        {/* Profile Header */}
          <div className="pt-20 pb-6 px-4 sm:px-8 text-center border-b border-slate-100">
            <h1 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">
            {user?.firstName} {user?.lastName}
          </h1>
          
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-slate-500 font-medium mb-6">
              {/* <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{t('settingContents.earth')}</span>
            </div> */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{t('settingContents.joined', { date: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Recently' })}</span>
          </div>
            </div>

            {/* Profile Completion or Loader */}
            <div className="max-w-md mx-auto min-h-[36px] flex flex-col items-center justify-center">
              <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2">
              <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${user?.profileCompletion || 0}%` }}
              ></div>
            </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-sm text-slate-500 font-semibold">{t('settingContents.profileCompletion')}</span>
                <span className="text-sm text-slate-700 font-bold">{user?.profileCompletion || 0}%</span>
              </div>
          </div>
        </div>

        {/* Edit Form */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl shadow-lg shadow-indigo-200/30">
                    <User className="text-indigo-600" size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                        {t('settingContents.editInfo')}
                    </h2>
                    <p className="text-slate-500 font-medium">{t('settingContents.updateDetails')}</p>
                </div>
            </div>
          
          <div className="space-y-6">
            {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t('settingContents.firstName')}</label>
                <input
                  type="text"
                  placeholder={t('settingContents.firstName')}
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium transition-all duration-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t('settingContents.lastName')}</label>
                <input
                  type="text"
                  placeholder={t('settingContents.lastName')}
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium transition-all duration-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('settingContents.email')}</label>
              <input
                type="email"
                value={formData.email}
                readOnly
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed"
              />
            </div>

            {/* Date of Birth and Currency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t('settingContents.dob')}</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium transition-all duration-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                {dateError && (
                  <p className="text-red-500 text-sm mt-1">{dateError}</p>
                )}
              </div>
              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t('settingContents.currency')}</label>
                <Select
                  options={currencyOptions}
                  value={formData.selectedCurrency}
                  onChange={(option) => handleInputChange('selectedCurrency', option)}
                  formatOptionLabel={formatOptionLabel}
                    styles={{
                      control: (base, state) => ({ ...base, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.45rem 0.5rem', boxShadow: state.isFocused ? '0 0 0 2px #a5b4fc' : 'none', '&:hover': { borderColor: '#cbd5e1' }, }),
                      option: (base, state) => ({ ...base, backgroundColor: state.isSelected ? '#6366f1' : (state.isFocused ? '#eef2ff' : 'white'), color: state.isSelected ? 'white' : '#1e293b', '&:hover': { backgroundColor: '#eef2ff' }, }),
                      menu: (base) => ({ ...base, zIndex: 9999, borderRadius: '0.75rem', overflow: 'hidden'}),
                      singleValue: (base) => ({ ...base, display: 'flex', alignItems: 'center', gap: '8px' }),
                    }}
                  placeholder={t('settingContents.selectCurrency')}
                  isSearchable
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('settingContents.phoneNumber')}</label>
              <PhoneInput
                country={'us'}
                value={formData.phoneNumber}
                onChange={phone => handleInputChange('phoneNumber', phone)}
                preferredCountries={['us', 'gb']}
                enableSearch={true}
                searchPlaceholder={t('settingContents.searchCountry')}
                  inputStyle={{ width: '100%', height: 'auto', padding: '12px 48px', fontSize: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', outline: 'none', transition: 'all 0.2s' }}
                  buttonStyle={{ borderRadius: '0.75rem 0 0 0.75rem', border: '1px solid #e2e8f0', borderRight: 'none', backgroundColor: '#f1f5f9' }}
                  dropdownStyle={{ borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}
                inputProps={{
                    onFocus: (e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 2px #a5b4fc'; },
                    onBlur: (e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }
                }}
              />
            </div>

            {/* Gender Selection */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('settingContents.gender')}</label>
              <div className="grid grid-cols-3 gap-4">
                {['Male', 'Female', 'Other'].map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => handleInputChange('gender', gender)}
                      className={`w-full py-3 px-4 rounded-xl border-2 text-base font-bold transition-all duration-200 active:scale-95 ${
                      formData.gender === gender
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                          : 'bg-slate-100 border-slate-100 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {gender}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio Section */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('settingContents.bio')}</label>
              <textarea
                  placeholder={t('settingContents.bioPlaceholder')}
                rows={4}
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium transition-all duration-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-y"
              />
            </div>

            {/* Save Button */}
            <div className="pt-6 flex justify-end">
              <button 
                type="submit"
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all duration-200 font-bold active:scale-95 shadow-lg shadow-indigo-500/20 disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
                  disabled={!hasFormDataChanged()}
              >
                {t('settingContents.saveChanges')}
              </button>
            </div>
          </div>
        </div>
      </form>
      </div>

      {showProfileUpload && (
        <FileUploadWindow 
          type="profile" 
          onClose={() => {
            setShowProfileUpload(false);
            setFileInfo(null);
          }} 
        />
      )}

      {showCoverUpload && (
        <FileUploadWindow 
          type="cover" 
          onClose={() => {
            setShowCoverUpload(false);
            setFileInfo(null);
          }} 
        />
      )}
    </div>
  );
}

export default SettingsContent;