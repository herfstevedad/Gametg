import React, { useState } from "react";
import styles from "./customSelect.module.css";

interface Option {
  label: string; // Текст, который видит пользователь
  value: string; // Значение, которое передается при выборе
}

interface CustomSelectProps {
  options: Option[]; // Список опций (текст + значение)
  label: string; // Подпись
  value: string; // Текущее выбранное значение
  onChange: (value: string) => void; // Обработчик изменения
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false); // Состояние открыт/закрыт

  // Переключение состояния открыт/закрыт
  const handleToggle = () => setIsOpen(!isOpen);

  // Выбор опции
  const handleSelect = (optionValue: string) => {
    onChange(optionValue); // Передаем значение родительскому компоненту
    setIsOpen(false); // Закрываем список
  };

  // Находим текущий выбранный текст
  const selectedLabel = options.find((option) => option.value === value)?.label || "Выберите";

  return (
    <div className={styles.customSelect}>
      <label className={styles.label}>{label}</label>
      <div className={styles.selectWrapper} onClick={handleToggle}>
        <div className={styles.selectedOption}>
          {selectedLabel}
        </div>
        <span className={styles.arrow}>▼</span>
      </div>
      {isOpen && (
        <ul className={styles.optionsList}>
          {options.map((option, index) => (
            <li key={index} onClick={() => handleSelect(option.value)}>
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;