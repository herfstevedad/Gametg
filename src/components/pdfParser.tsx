import { useState, useEffect } from "react";
import styles from "./PdfParser.module.css";

interface PdfParserProps {
  group: string;
  onScheduleLoaded: (data: any) => void;
}

const PdfParser: React.FC<PdfParserProps> = ({ group, onScheduleLoaded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const storageKey = `schedule_${group}`;
  const replacementsStorageKey = `replacements_${group}`;

  const loadPdfData = async () => {
    if (!group) {
      setError("Номер группы не указан");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [scheduleResponse, replacementsResponse] = await Promise.all([
        fetch(`http://localhost:3001/api/schedule/${group}`),
        fetch(`http://localhost:3001/api/replacements/${group}`)
      ]);
      if (!scheduleResponse.ok)
        throw new Error(`Ошибка сервера: ${scheduleResponse.status}`);
      if (!replacementsResponse.ok)
        throw new Error(`Ошибка сервера: ${replacementsResponse.status}`);

      const [scheduleData, replacementsData] = await Promise.all([
        scheduleResponse.json(),
        replacementsResponse.json()
      ]);
      if (!scheduleData)
        throw new Error("Неизвестная ошибка сервера");

      localStorage.setItem(storageKey, JSON.stringify(scheduleData));
      localStorage.setItem(replacementsStorageKey, JSON.stringify(replacementsData));
      window.dispatchEvent(new Event("scheduleUpdated"));

      const combinedData = {
        schedule: scheduleData,
        replacements: replacementsData
      };

      setData(combinedData);
      if (onScheduleLoaded) {
        onScheduleLoaded(combinedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      console.error("Ошибка при загрузке данных:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAndLoadData = () => {
    const storedSchedule = localStorage.getItem(storageKey);
    const storedReplacements = localStorage.getItem(replacementsStorageKey);

    if (storedSchedule) {
      const parsedSchedule = JSON.parse(storedSchedule);
      const currentTime = new Date().getTime();
      const dataTime = parsedSchedule.timestamp;
      const daysDifference = (currentTime - dataTime) / (1000 * 60 * 60 * 24);

      if (daysDifference > 7) {
        loadPdfData();
        return;
      }
      let parsedReplacements = null;
      if (storedReplacements) {
        parsedReplacements = JSON.parse(storedReplacements);
        const currentDate = new Date().setHours(0, 0, 0, 0);
        const replacementsDate = new Date(parsedReplacements.date).setHours(0, 0, 0, 0);

        if (replacementsDate < currentDate) {
          localStorage.removeItem(replacementsStorageKey);
          parsedReplacements = null;
        }
      }
      const combinedData = {
        schedule: parsedSchedule,
        replacements: parsedReplacements
      };

      setData(combinedData);
      if (onScheduleLoaded) {
        onScheduleLoaded(combinedData);
      }
    } else {
      loadPdfData();
    }
  };

  useEffect(() => {
    if (group) {
      checkAndLoadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group]);

  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}
      {isLoading && <div className={styles.loading}>Загрузка...</div>}
      {data?.replacements && (
        <div className={styles.replacements}>
          <h3>{data.replacements[0]?.header?.date}</h3>
        </div>
      )}
    </div>
  );
};

export default PdfParser;