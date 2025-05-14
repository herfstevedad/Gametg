import React from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  color = 'var(--primary-color)'
}) => {
  return (
    <div className={`${styles.spinnerContainer} ${styles[size]}`}>
      <div 
        className={styles.spinner}
        style={{ borderColor: color }}
      />
      <p className={styles.text}>Загрузка...</p>
    </div>
  );
};

export default LoadingSpinner; 