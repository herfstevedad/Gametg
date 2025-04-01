import React from "react";
import styles from "./Header.module.css";

const Header: React.FC = () => {
  const currentDate = new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Мое Расписание</h1>
      <p className={styles.date}>{currentDate}</p>
    </header>
  );
};

export default Header;