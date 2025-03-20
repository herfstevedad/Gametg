import React, { useState, useEffect } from "react";
import { retrieveLaunchParams } from "@telegram-apps/sdk";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import styles from './registration.module.css'; // Импортируем стили

const Registration: React.FC = () => {
    const [group, setGroup] = useState<string>("");
    const [course, setCourse] = useState<string>("");
    const [isRegistered, setIsRegistered] = useState<boolean>(false);
    const userId = retrieveLaunchParams().tgWebAppData?.user?.id;
    // Получение launchParams из Telegram SDK
    useEffect(() => {
      const fetchLaunchParams = async () => {
        try {

          if (!userId) {
            console.error("Не удалось получить userId из Telegram.");
            return;
          }
        } catch (error) {
          console.error("Ошибка при получении launchParams:", error);
          alert("Произошла ошибка при загрузке данных.");
        }
      };
  
      fetchLaunchParams();
    }, []);
  
    // Проверка наличия пользователя в базе
    useEffect(() => {
      const checkUser = async () => {
        if (!userId) return;
  
        const userRef = doc(db, "users", userId.toString());
        const userDoc = await getDoc(userRef);
  
        if (userDoc.exists()) {
          setIsRegistered(true); // Пользователь уже зарегистрирован
        }
      };
  
      checkUser();
    }, [userId]);
  
    // Обработчик выбора курса
    const handleCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      setCourse(event.target.value);
    };

    // Обработчик выбора группы
    const handleGroupChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      setGroup(event.target.value);
    };
  
    // Сохранение данных в Firestore
    const handleSubmit = async () => {
      if (!userId || !group) {
        alert("Выберите группу!");
        return;
      }
  
      try {
        const userRef = doc(db, "users", userId.toString());
        await setDoc(userRef, { group });
        setIsRegistered(true); // Пользователь успешно зарегистрирован
      } catch (error) {
        console.error("Ошибка при регистрации:", error);
        alert("Произошла ошибка при регистрации.");
      }
    };
  
    if (!userId) {
      return <p>Загрузка...</p>;
    }
  
    if (isRegistered) {
      return <p>Вы уже зарегистрированы!</p>;
    }
  
    return (
      <div className={styles.container}>
        <div className={styles.registrationContainer}>
          {/* Заголовок */}
          <h2 className={styles.header}>Регистрация</h2>
  
          {/* Подзаголовок */}
          <p className={styles.subtitle}>Выберите свой курс и группу:</p>
  
          {/* Поле выбора курса */}
          <div className={styles.formField}>
            <label htmlFor="course">Курс:</label>
            <select
              id="course"
              value={course}
              onChange={handleCourseChange}
              className={styles.courseSelect}
            >
              <option value="">-- Выберите курс --</option>
              <option value="1">1-ый курс</option>
              <option value="2">2-ой курс</option>
              <option value="3">3-ий курс</option>
              <option value="4">4-ый курс</option>
            </select>
          </div>
  
          {/* Поле выбора группы */}
          <div className={styles.formField}>
            <label htmlFor="group">Группа:</label>
            <select
              id="group"
              value={group}
              onChange={handleGroupChange}
              className={styles.groupSelect}
            >
              <option value="">-- Выберите группу --</option>
              {course === "1" && (
                <>
                  <option value="ЭС-1-1">ЭС-1-1</option>
                  <option value="ЭС-1-2">ЭС-1-2</option>
                  <option value="ЭС-1-3">ЭС-1-3</option>
                </>
              )}
              {course === "2" && (
                <>
                  <option value="ЭС-2-1">ЭС-2-1</option>
                  <option value="ЭС-2-2">ЭС-2-2</option>
                  <option value="ЭС-2-3">ЭС-2-3</option>
                </>
              )}
              {course === "3" && (
                <>
                  <option value="ЭС-3-1">ЭС-3-1</option>
                  <option value="ЭС-3-2">ЭС-3-2</option>
                  <option value="ЭС-3-3">ЭС-3-3</option>
                </>
              )}
              {course === "4" && (
                <>
                  <option value="ЭС-4-1">ЭС-4-1</option>
                  <option value="ЭС-4-2">ЭС-4-2</option>
                  <option value="ЭС-4-3">ЭС-4-3</option>
                </>
              )}
            </select>
          </div>
  
          {/* Кнопка регистрации */}
          <button onClick={handleSubmit} className={styles.submitButton}>
            Готово
          </button>
        </div>
      </div>
    );
  };

  
  export default Registration;
