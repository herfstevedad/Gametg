import React, {useState, useEffect, useRef} from 'react';
import styles from './modal.module.css';

interface ModalProps {
  onClose: () => void; // Функция для закрытия модального окна
}

const Modal: React.FC<ModalProps> = ({ onClose }) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false); // Флаг для отслеживания монтирования
  const [isClosing, setIsClosing] = useState<boolean>(false); // Флаг для отслеживания закрытия

  // Измеряем высоту содержимого при монтировании
  useEffect(() => {
    if (modalRef.current) {
      const contentHeight = modalRef.current.scrollHeight; // Высота содержимого
      console.log('Высота содержимого:', contentHeight);

      // Устанавливаем флаг после монтирования
      setIsMounted(true);
    }
  }, []);

  // Закрываем модальное окно при клике вне его
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeWithAnimation();
    }
  };

  const closeWithAnimation = () => {
    setIsClosing(true); // Запускаем анимацию закрытия
    setTimeout(() => {
      onClose(); // Удаляем модальное окно из DOM после завершения анимации
    }, 300); // Время анимации (300ms)
  };

  return (
    <div
      className={`${styles.modalOverlay} ${isClosing ? styles.fadeOut : ''}`}
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className={`${styles.modalContent} ${
          isMounted ? styles.slideUp : ''
        } ${isClosing ? styles.slideDown : ''}`}
      >
        {/* Шапка */}
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>Меню</span>
          {/* Кнопка закрытия */}
          <button className={styles.closeButton} onClick={closeWithAnimation}>
            ×
          </button>
        </div>

        {/* Основное содержимое */}
        <div className={styles.modalBody}>
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