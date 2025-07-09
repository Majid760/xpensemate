import React from 'react';

const Button = ({ children, ...props }) => (
  <button
    style={{
      width: '100%',
      background: '#F3C96B',
      color: '#1A2233',
      border: 'none',
      borderRadius: 8,
      padding: '12px 0',
      fontWeight: 700,
      fontSize: 18,
      cursor: 'pointer',
      margin: '16px 0',
      transition: 'background 0.2s',
    }}
    {...props}
  >
    {children}
  </button>
);

export default Button; 