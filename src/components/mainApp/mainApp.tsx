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
      // Дата начала учебного года
      const startDate = new Date(2025, 0, 1); // 1 января 2025
      const currentDate = new Date(); // Фиксированная дата для тестирования

      console.log("[MainApp] Текущая дата:", currentDate);

      // Определяем текущую неделю
      const weekNumber = getCurrentWeekNumber(startDate, currentDate);
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
function getCurrentWeekNumber(startDate: Date, currentDate: Date): number {
  const start = new Date(startDate);
  const current = new Date(currentDate);

  // Выравниваем начальную дату до ближайшего понедельника
  const startDayOfWeek = start.getDay() || 7; // 1 (понедельник) - 7 (воскресенье)
  const daysToFirstMonday = startDayOfWeek === 1 ? 0 : 8 - startDayOfWeek;
  start.setDate(start.getDate() + daysToFirstMonday);

  // Вычисляем разницу в миллисекундах между датами
  const diffInMilliseconds = current.getTime() - start.getTime();
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

  // Вычисляем номер недели
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