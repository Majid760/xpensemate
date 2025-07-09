import React, { useState } from 'react';
import { MdEmail } from 'react-icons/md';
import { RiLockPasswordLine } from 'react-icons/ri';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';

const InputField = ({ label, type, name, value, onChange, required, hint, activeBorderColor = '#F3C96B' }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { t } = useTranslation();

  const getIcon = () => {
    switch (type) {
      case 'email':
        return <MdEmail size={20} color={isFocused ? activeBorderColor : "#666"} />;
      case 'password':
        return <RiLockPasswordLine size={20} color={isFocused ? activeBorderColor : "#666"} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ 
        background: '#fff', 
        borderRadius: 6, 
        padding: '0 12px', 
        border: `1px solid ${isFocused ? activeBorderColor : '#ccc'}`,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s ease',
        boxShadow: isFocused ? `0 0 0 2px ${activeBorderColor}33` : 'none'
      }}>
        {getIcon()}
        <input
          style={{ 
            border: 'none', 
            outline: 'none', 
            width: '100%', 
            height: 40, 
            background: 'transparent',
            fontSize: '16px',
            color: '#1A2233',
            padding: '0 4px'
          }}
          placeholder={label}
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {type === 'password' && (
          <div
            onClick={() => setShowPassword(!showPassword)}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              margin: '-4px',
              borderRadius: '50%',
              transition: 'all 0.2s ease',
              backgroundColor: 'transparent',
              ':hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)'
              }
            }}
            title={showPassword ? t('inputField.hidePassword') : t('inputField.showPassword')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowPassword(!showPassword);
              }
            }}
          >
            {showPassword ? 
              <IoEyeOffOutline size={20} color={isFocused ? activeBorderColor : "#666"} /> : 
              <IoEyeOutline size={20} color={isFocused ? activeBorderColor : "#666"} />
            }
          </div>
        )}
      </div>
      {hint && isFocused && (
        <div style={{
          marginTop: 4,
          fontSize: 12,
          color: '#666',
          fontStyle: 'italic'
        }}>
          {hint}
        </div>
      )}
    </div>
  );
};

export default InputField; 