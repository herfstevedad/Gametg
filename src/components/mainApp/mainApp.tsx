import Header from "./header/header";
import styles from "./mainApp.module.css";
import PdfParser from "../pdfParser";

interface MainAppProps {
  group: string | null; // Пропс с выбранной группой
}

const MainApp: React.FC<MainAppProps> = ({ group }) => {
  return (
    <div className={styles.appContainer}>
      {/* Передаем выбранную группу в Header, если нужно */}
      <Header/>
      
      <div className={styles.mainContent}>
        {/* Передаем group в PdfParser */}
        <PdfParser group={group} />
      </div>
    </div>
  );
};

export default MainApp;