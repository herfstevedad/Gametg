import React, { useState } from "react";
import styles from "./registration.module.css"; // Импортируем стили
import CustomSelect from "./customSelect/customSelect";

const Registration: React.FC = () => {
  const [course, setCourse] = useState<string>(""); // Новое поле для выбора курса
  const [groupCode, setGroupCode] = useState<string>("");

  

 const getGroupsByCourse = (course: string) => {
    switch (course) {
      case "1":
        return [
          { label: "ЭС-1-1", value: "ES11" },
          { label: "КС-1-1", value: "KS11" },
          { label: "ИС-1-1", value: "IS11" },
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

  return (
    <div className={styles.container}>
      <div className={styles.registrationContainer}>

        {/* Поле выбора курса */}
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
            setGroupCode(""); // Сбрасываем группу при изменении курса
          }}
        />

        {/* Поле выбора группы */}
        {course && (
          <CustomSelect
            options={getGroupsByCourse(course)}
            label="Группа"
            value={groupCode}
            onChange={(value) => setGroupCode(value)}
          />
        )}

        {/* Кнопка регистрации */}
        <button
          onClick={() => {
            if (!groupCode) {
              alert("Выберите группу!");
              return;
            }
            alert(`Вы выбрали группу: ${groupCode}`);
          }}
          className={styles.submitButton}
        >
          Готово
        </button>
      </div>
    </div>
  );
};

export default Registration;