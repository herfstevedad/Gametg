import React from "react";
import styles from "./ScheduleCards.module.css";

interface ScheduleCardProps {
  time: string;
  subject: string;
  location: string;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ time, subject, location }) => {
  return (
    <div className={styles.card}>
      <div className={styles.time}>{time}</div>
      <div className={styles.subject}>{subject}</div>
      <div className={styles.location}>{location}</div>
    </div>
  );
};

const ScheduleCards: React.FC = () => {
  const schedule = [
    { time: "09:00", subject: "Математика", location: "Аудитория 101" },
    { time: "11:00", subject: "История", location: "Аудитория 202" },
    { time: "13:00", subject: "Физика", location: "Аудитория 303" },
    { time: "15:00", subject: "Программирование", location: "Аудитория 404" },
  ];

  return (
    <div className={styles.cardsContainer}>
      {schedule.map((item, index) => (
        <ScheduleCard key={index} {...item} />
      ))}
    </div>
  );
};

export default ScheduleCards;