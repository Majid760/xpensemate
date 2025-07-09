import React from 'react';

const Checkbox = ({ label, ...props }) => (
  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: 15 }}>
    <input type="checkbox" style={{ marginRight: 8 }} {...props} />
    {label}
  </label>
);

export default Checkbox; 