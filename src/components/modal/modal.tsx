import React, {useState, useEffect, useRef} from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  onClose: () => void; // Функция для закрытия модального окна
}

const Modal: React.FC<ModalProps> = ({ onClose }) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false); // Флаг для отслеживания монтирования

  // Измеряем высоту содержимого при монтировании
  useEffect(() => {
    if (modalRef.current) {
      const contentHeight = modalRef.current.scrollHeight; // Высота содержимого
      console.log('Высота содержимого:', contentHeight);

      // Устанавливаем флаг после монтирования
      setIsMounted(true);
    }
  }, []);

  return (
    <div className={styles.modalOverlay}>
      <div
        ref={modalRef}
        className={`${styles.modalContent} ${isMounted ? styles.slideUp : ''}`}
      >
        {/* Шапка */}
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>Меню</span>
          {/* Кнопка закрытия */}
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {/* Основное содержимое */}
        <div className={styles.modalBody}>
          <p>Это модальное окно.</p>
          <p>Это модальное окно.</p>
          <p>Это модальное окно.</p>
          <p>Это модальное окно.</p>

          <p>Это модальное окно.</p>
          <p>Это модальное окно.</p>
          <p>Здесь может быть много текста или других элементов.</p>
          <p>Добавим еще текста, чтобы проверить прокрутку.</p>
          <p>Еще немного текста...</p>
          <p>И еще немного текста...</p>
          <p>И еще...</p>
          <p>И еще...</p>
        </div>
      </div>
    </div>
  );
};

export default Modal;