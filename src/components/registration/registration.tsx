import { useState } from "react";
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
          { label: "А-2-1", value: "A21" },
          { label: "В-2-1", value: "V21" },
          { label: "Д-2-1", value: "D21" },
          { label: "Д-2-2", value: "D22" },
          { label: "Д-2-3", value: "D23" },
          { label: "КС-2-1", value: "KS21" },
          { label: "КС-2-2", value: "KS22" },
          { label: "Л-2-1", value: "L21" },
          { label: "Л-2-2", value: "L22" },
          { label: "Л-2-3", value: "L23" },
          { label: "Л-2-4", value: "L24" },
          { label: "Л-2-5", value: "L25" },
          { label: "Л-2-6", value: "L26" },
          { label: "П-2-1", value: "P21" },
          { label: "ПМ-2-1", value: "PM21" },
          { label: "ПМ-2-2", value: "PM22" },
          { label: "Р-2-1", value: "R21" },
          { label: "С-2-1", value: "S21" },
          { label: "СП-2-1", value: "SP21" },
          { label: "ЭС-2-1", value: "ES21" },
        ];
      case "3":
        return [
          { label: "А-3-1", value: "A31" },
          { label: "В-3-1", value: "V31" },
          { label: "Д-3-1", value: "D31" },
          { label: "Д-3-2", value: "D32" },
          { label: "Д-3-3", value: "D33" },
          { label: "КС-3-1", value: "KS31" },
          { label: "КС-3-2", value: "KS32" },
          { label: "Л-3-1", value: "L31" },
          { label: "Л-3-2", value: "L32" },
          { label: "Л-3-3", value: "L33" },
          { label: "Л-3-4", value: "L34" },
          { label: "Л-3-5", value: "L35" },
          { label: "ПМ-3-1", value: "PM31" },
          { label: "Р-3-1", value: "R31" },
          { label: "С-3-1", value: "S31" },
          { label: "СП-3-1", value: "SP31" },
          { label: "Э-3-1", value: "E31" },
          { label: "ЭС-3-1", value: "ES31" },
        ];
      case "4":
        return [
          { label: "А-4-1", value: "A41" },
          { label: "В-4-1", value: "V41" },
          { label: "Д-4-1", value: "D41" },
          { label: "Д-4-2", value: "D42" },
          { label: "КС-4-1", value: "KS41" },
          { label: "КС-4-2", value: "KS42" },
          { label: "Л-4-1", value: "L41" },
          { label: "Л-4-2", value: "L42" },
          { label: "Л-4-3", value: "L43" },
          { label: "Л-4-4", value: "L44" },
          { label: "П-4-1", value: "P41" },
          { label: "ПМ-4-1", value: "PM41" },
          { label: "Р-4-1", value: "R41" },
          { label: "С-4-1", value: "S41" },
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