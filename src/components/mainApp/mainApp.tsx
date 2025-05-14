import React from "react";
import styles from "./mainApp.module.css";
import Header from "./header/header";
import PdfParser from "../pdfParser";
import ScheduleCards from "./scheduleCards/scheduleCards";

interface MainAppProps {
  group: string | null;
  onRegistrationOpen: () => void;
}

const MainApp: React.FC<MainAppProps> = ({ group, onRegistrationOpen }) => {
  const handleScheduleLoaded = () => {
    // Обработка загруженного расписания
  };

  return (
    <div className={styles.appContainer}>
      <Header onRegistrationOpen={onRegistrationOpen} />
      {group && <ScheduleCards group={group} />}
      {group && <PdfParser group={group} onScheduleLoaded={handleScheduleLoaded} />}
    </div>
  );
};export default MainApp;