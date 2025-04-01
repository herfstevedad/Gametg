import React, { useState } from "react";
import styles from "./registration.module.css"; // Импортируем стили
import CustomSelect from "./customSelect/customSelect";

interface RegistrationModalProps {
  onClose: () => void; // Функция для закрытия окна
  onGroupSelect: (group: string) => void; // Добавляем колбэк
}

const Registration: React.FC<RegistrationModalProps> = ({ 
  onClose, 
  onGroupSelect // Теперь TypeScript знает об этом пропсе
}) => {
  const [course, setCourse] = useState<string>(""); // Новое поле для выбора курса
  const [groupCode, setGroupCode] = useState<string>("");
  

 const getGroupsByCourse = (course: string) => {
    switch (course) {
      case "1":
        return [
          { label: "А-1-1", value: "A11" },
          { label: "В-1-1", value: "V11" },
          { label: "Д-1-1", value: "D11" },
          { label: "Д-1-2", value: "D12" },
          { label: "Д-1-3", value: "D13" },
          { label: "КС-1-1", value: "KS11" },
          { label: "КС-1-2", value: "KS12" },
          { label: "КС-1-3", value: "KS13" },
          { label: "Л-1-1", value: "L11" },
          { label: "Л-1-2", value: "L12" },
          { label: "Л-1-3", value: "L13" },
          { label: "Л-1-4", value: "L14" },
          { label: "Л-1-5", value: "L15" },
          { label: "П-1-1", value: "P11" },
          { label: "ПМ-1-1", value: "PM11" },
          { label: "Р-1-1", value: "R11" },
          { label: "С-1-1", value: "S11" },
          { label: "СП-1-1", value: "SP11" },
          { label: "Э-1-1", value: "E11" },
          { label: "ЭС-1-1", value: "ES11" },
        ];
      case "2":
        return [
          { label: "ЭС-2-1", value: "ES21" },
          { label: "КС-2-1", value: "KS21" },
          { label: "ИС-2-1", value: "IS21" },
        ];
      case "3":
        return [
          { label: "ЭС-3-1", value: "ES31" },
          { label: "КС-3-1", value: "KS31" },
          { label: "ИС-3-1", value: "IS31" },
        ];
      case "4":
        return [
          { label: "ЭС-4-1", value: "ES41" },
          { label: "КС-4-1", value: "KS41" },
          { label: "ИС-4-1", value: "IS41" },
        ];
      default:
        return [];
    }
  };

  const handleSubmit = () => {
    if (!groupCode) {
      alert("Выберите группу!");
      return;
    }
    
    // Сохраняем группу в localStorage
    localStorage.setItem("selectedGroup", groupCode);
    
    // Передаем группу родительскому компоненту
    onGroupSelect(groupCode);
    
    // Закрываем модальное окно
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContent} ${styles.registrationContainer}`}>
        <CustomSelect
          options={[
            { label: "1 курс", value: "1" },
            { label: "2 курс", value: "2" },
            { label: "3 курс", value: "3" },
            { label: "4 курс", value: "4" },
          ]}
          label="Курс"
          value={course}
          onChange={(value) => {
            setCourse(value);
            setGroupCode("");
          }}
        />

        {course && (
          <CustomSelect
            options={getGroupsByCourse(course)}
            label="Группа"
            value={groupCode}
            onChange={(value) => setGroupCode(value)}
          />
        )}

        <button
          onClick={handleSubmit}
          className={styles.submitButton}
        >
          Готово
        </button>
      </div>
    </div>
  );
};

export default Registration;