import React from 'react';
import styles from './ReplacementsStatus.module.css';

interface ReplacementsStatusProps {
  status: 'loading' | 'no_replacements' | 'has_replacements' | 'error' | 'not_available';
  lastChecked?: Date | null;
  replacementsDate?: string;
}

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('ru-RU', { 
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDate = (date: Date): string => {
  return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`;
};

const ReplacementsStatus: React.FC<ReplacementsStatusProps> = ({ 
  status, 
  lastChecked,
  replacementsDate 
}) => {
  const getStatusMessage = (): { text: string; className: string } => {
    switch (status) {
      case 'loading':
        return { 
          text: 'Проверка замен...', 
          className: styles.loading 
        };
      case 'no_replacements':
        return { 
          text: 'Замен нет', 
          className: styles.noReplacements 
        };
      case 'has_replacements':
        try {
          const date = replacementsDate ? new Date(replacementsDate) : new Date();
          if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
          }
          return { 
            text: `Есть замены на ${formatDate(date)}`, 
            className: styles.hasReplacements 
          };
        } catch (e) {
          return { 
            text: 'Есть замены', 
            className: styles.hasReplacements 
          };
        }
      case 'error':
        return { 
          text: 'Ошибка загрузки', 
          className: styles.error 
        };
      case 'not_available':
        return { 
          text: 'Нет данных', 
          className: styles.notAvailable 
        };
      default:
        return { 
          text: '', 
          className: styles.noReplacements 
        };
    }
  };

  const { text, className } = getStatusMessage();

  return (
    <div className={styles.container}>
      <div className={`${styles.status} ${className}`}>
        {text}
      </div>
      {lastChecked && (
        <div className={styles.lastChecked}>
          {formatTime(lastChecked)}
        </div>
      )}
    </div>
  );
};

export default ReplacementsStatus; 