import React, { useState } from "react";
import styles from "./scheduleCards.module.css";
import { WeekSchedule } from "../../pdfParser";

interface ScheduleCardProps {
  subject: string; // Название предмета
  teacher: string; // Преподаватель
  room: string; // Аудитория
}

interface Subgroup {
  subgroup: string;
  teacher: string;
  room: string;
}

interface SubgroupListProps {
  subjectName: string; // Название предмета
  subgroups: Subgroup[]; // Список подгрупп
}

const SubgroupList: React.FC<SubgroupListProps> = ({ subjectName, subgroups }) => {
  return (
    <div className={styles.card}>
      <div className={styles.subject}>{subjectName}</div>
      {subgroups.map((subgroup, index) => (
        <div key={index} className={styles.subgroup}>
          <span>{`${subgroup.subgroup}: `}</span>
          <span>{subgroup.teacher}, </span>
          <span className={styles.room}>Ауд. {subgroup.room}</span>
        </div>
      ))}
    </div>
  );
};

const ScheduleCard: React.FC<ScheduleCardProps> = ({ subject, teacher, room }) => {
  return (
    <div className={styles.card}>
      <div className={styles.subject}>{subject}</div>
      <div className={styles.teacherAndRoom}>
        {teacher}
      </div>
      <span className={styles.room}>Ауд. {room}</span>
    </div>
  );
};

interface ScheduleCardsProps {
  schedule: WeekSchedule[];
  currentWeekIndex: number;
  currentDayIndex: number;
  setCurrentDayIndex: React.Dispatch<React.SetStateAction<number>>; // Функция для обновления текущего дня
}

const ScheduleCards: React.FC<ScheduleCardsProps> = ({
  schedule,
  currentWeekIndex,
  currentDayIndex,
  setCurrentDayIndex,
}) => {
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const currentWeek = schedule[currentWeekIndex];
  if (!currentWeek) {
    return <div>Неделя не найдена</div>;
  }

  const days = currentWeek.schedule || [];
  if (days.length === 0) {
    return <div>Дни недели не найдены</div>;
  }

  const currentDay = days[currentDayIndex];
  if (!currentDay) {
    return <div>День не найден</div>;
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStartX(e.touches[0].clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartX === null) return;
    const deltaX = e.touches[0].clientX - dragStartX;
    setDragOffset(deltaX);
  };

  const handleTouchEnd = () => {
    if (dragStartX === null) return;
  
    const threshold = 50;
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        // Переключаемся на предыдущий день
        setCurrentDayIndex((prevIndex: number) =>
          prevIndex === 0 ? days.length - 1 : prevIndex - 1
        );
      } else {
        // Переключаемся на следующий день
        setCurrentDayIndex((prevIndex: number) =>
          (prevIndex + 1) % days.length
        );
      }
    }
    setDragStartX(null);
    setDragOffset(0);
  };

  return (
    <div
      className={styles.cardsContainer}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <h2>{currentDay?.day || "Нет данных"}</h2>
      {currentDay && (
        <div className={styles.dayContent}>
          {currentDay.pairs.map((pair, pairIndex) => {
            if ("subgroups" in pair) {
              return (
                <SubgroupList
                  key={pairIndex}
                  subjectName={pair.subjectName}
                  subgroups={pair.subgroups}
                />
              );
            } else {
              return (
                <ScheduleCard
                  key={pairIndex}
                  subject={pair.subjectName}
                  teacher={pair.teacher}
                  room={pair.room}
                />
              );
            }
          })}
        </div>
      )}
    </div>
  );
};

export default ScheduleCards;