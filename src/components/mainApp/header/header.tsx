import styles from "./header.module.css";

interface HeaderProps {
  currentWeek: string; // Текущая неделя
  onWeekChange: () => void; // Callback для переключения недель
}

const Header: React.FC<HeaderProps> = ({ currentWeek, onWeekChange }) => {
  const currentDate = new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",     
  }); 

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Расписание</h1>
      <p className={styles.date}>{currentDate}</p>
      <button onClick={onWeekChange} className={styles.weekButton}>
        {currentWeek}
      </button>
    </header>
  );
};

export default Header;