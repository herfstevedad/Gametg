import React from 'react';
import styles from './ErrorMessage.module.css';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorIcon}>⚠️</div>
      <p className={styles.errorText}>{message}</p>
      {onRetry && (
        <button 
          className={styles.retryButton}
          onClick={onRetry}
        >
          Повторить
        </button>
      )}
    </div>
  );
};

export default ErrorMessage; 