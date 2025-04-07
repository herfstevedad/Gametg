import React, { useState, useEffect } from "react";
import Header from "./header/header";
import styles from "./mainApp.module.css";
import PdfParser from "../pdfParser";
import ScheduleCards from "./scheduleCards/scheduleCards";
import { WeekSchedule } from "../pdfParser";

interface MainAppProps {
  group: string | null; // Пропс с выбранной группой
}

const MainApp: React.FC<MainAppProps> = ({ group }) => {
  const [schedule, setSchedule] = useState<WeekSchedule[]>([]); // Состояние для хранения расписания
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0); // Индекс текущей недели
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(0); // Индекс текущего дня

  useEffect(() => {
    if (group && schedule.length > 0) {
      const currentDate = new Date(); // Текущая дата
  
      console.log("[MainApp] Текущая дата:", currentDate);
  
      // Определяем текущую неделю
      const weekNumber = getCurrentWeekNumber(currentDate);
      const weekParity = getWeekParity(weekNumber);
  
      console.log("[MainApp] Номер недели:", weekNumber);
      console.log("[MainApp] Четность недели:", weekParity);
  
      // Находим индекс текущей недели
      const weekIndex = schedule.findIndex((week) => week.week === weekParity);
      console.log("[MainApp] Индекс текущей недели:", weekIndex);
  
      if (weekIndex !== -1) {
        setCurrentWeekIndex(weekIndex);
      }
  
      // Определяем текущий день недели
      const currentDay = getCurrentDay(currentDate);
      console.log("[MainApp] Текущий день недели:", currentDay);
  
      const dayIndex = schedule[weekIndex]?.schedule.findIndex(
        (day) => day.day === currentDay
      );
      console.log("[MainApp] Индекс текущего дня:", dayIndex);
  
      if (dayIndex !== -1) {
        setCurrentDayIndex(dayIndex);
      }
    }
  }, [group, schedule]);

  const handleWeekChange = () => {
    if (schedule.length === 0) return;
    setCurrentWeekIndex((prevIndex) => (prevIndex + 1) % schedule.length);
  };

  const currentWeek = `${schedule[currentWeekIndex]?.week || "Неделя не загружена"} неделя`;

  return (
    <div className={styles.appContainer}>
      <Header currentWeek={currentWeek} onWeekChange={handleWeekChange} />
      <div className={styles.mainContent}>
        {group ? (
          <>
            <PdfParser
              group={group}
              onScheduleLoaded={(loadedSchedule) => setSchedule(loadedSchedule)}
            />
            {schedule.length > 0 && (
              <ScheduleCards
                schedule={schedule}
                currentWeekIndex={currentWeekIndex}
                currentDayIndex={currentDayIndex}
                setCurrentDayIndex={setCurrentDayIndex} // Передаем функцию для обновления дня
              />
            )}
          </>
        ) : (
          <div>Выберите группу</div>
        )}
      </div>
    </div>
  );
};

// Функция для вычисления номера недели
function getCurrentWeekNumber(currentDate: Date): number {
  // Клонируем дату, чтобы не менять исходную
  const date = new Date(currentDate);
  date.setHours(0, 0, 0, 0);

  // Находим ближайший четверг (ISO неделя зависит от четверга)
  const thursday = new Date(date);
  thursday.setDate(date.getDate() + (3 - date.getDay() + 7) % 7);

  // Находим первый четверг года
  const firstDayOfYear = new Date(thursday.getFullYear(), 0, 1);
  const firstThursday = new Date(firstDayOfYear);
  firstThursday.setDate(firstDayOfYear.getDate() + (3 - firstDayOfYear.getDay() + 7) % 7);

  // Если первый четверг года — в прошлом году, берем следующий
  if (firstThursday.getFullYear() < thursday.getFullYear()) {
    firstThursday.setDate(firstThursday.getDate() + 7);
  }

  // Разница в неделях
  const diffInTime = thursday.getTime() - firstThursday.getTime();
  const diffInDays = Math.floor(diffInTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffInDays / 7) + 1;
}
// Функция для определения четности недели
function getWeekParity(weekNumber: number): string {
  return weekNumber % 2 === 1 ? "1-я" : "2-я";
}

// Функция для получения текущего дня недели
function getCurrentDay(currentDate: Date): string {
  const daysOfWeek = [
    "Воскресенье",
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
  ];
  return daysOfWeek[currentDate.getDay()];
}

export default MainApp;