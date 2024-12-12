// File: AnimatedLoader.jsx

import React from 'react';
// import PropTypes from 'prop-types';
import './AnimatedLoader.css'; // Import the CSS file for styling

const AnimatedLoader = ({ size = '50px', color = '#3498db' }) => {
  const loaderStyle = {
    width: size,
    height: size,
    borderColor: `${color} transparent ${color} transparent`
  };

  return (
    <div className="loader-container">
      <div className="loader" style={loaderStyle}></div>
    </div>
  );
};

// AnimatedLoader.propTypes = {
//   size: PropTypes.string,
//   color: PropTypes.string,
// };

AnimatedLoader.defaultProps = {
  size: '50px',
  color: '#3498db'
};

export default AnimatedLoader;
