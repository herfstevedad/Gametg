import React, { useState } from "react";
import styles from "./PdfParser.module.css";

interface PdfParserProps {
  group: string | null;
}

// Функция для структуризации данных
function parseSchedule(text: string): any[] {
    // Предварительная обработка текста
    text = text.replace(/\s+/g, " ").trim(); // Удаляем лишние пробелы
    text = text.replace(/\u00A0/g, " "); // Удаляем неразрывные пробелы
  
    const weeks = text.split("Неделя").slice(1); // Разделяем на недели
    const parsedData: any[] = [];
  
    const daysOfWeek = ["Пнд", "Втр", "Срд", "Чтв", "Птн", "Сбт"]; // Дни недели
  
    weeks.forEach((weekText, index) => {
      console.log(`Обработка недели ${index + 1}:`, weekText);
  
      const weekNumberMatch = weekText.match(/\d+-я/);
      if (!weekNumberMatch) {
        throw new Error(`Не удалось найти номер недели в тексте: ${weekText}`);
      }
      const weekNumber = weekNumberMatch[0];
  
      console.log(`Найден номер недели: ${weekNumber}`);
  
      // Разделяем текст на слова
      const words = weekText.split(" ");
  
      let currentDay = "";
      let currentPairs: string[] = [];
      const schedule = [];
      let isDayFound = false;
  
      for (const word of words) {
        if (!isDayFound) {
          // Ищем первый день недели
          if (daysOfWeek.includes(word)) {
            isDayFound = true;
            currentDay = word;
            console.log(`Найден первый день недели: ${currentDay}`);
          } else {
            console.log(`Пропускаем слово до первого дня недели: ${word}`);
          }
          continue;
        }
  
        // Пропускаем заголовки ("Пары", "Время")
        if (["Пары", "Время"].includes(word)) {
          console.log(`Пропускаем заголовок: ${word}`);
          continue;
        }
  
        // Проверяем, является ли слово днем недели
        if (daysOfWeek.includes(word)) {
          if (currentDay) {
            schedule.push({ day: currentDay, pairs: parsePairs(currentPairs) });
            console.log(`Добавлен день недели в расписание: ${currentDay}`, currentPairs);
            currentPairs = [];
          }
          currentDay = word;
          console.log(`Найден новый день недели: ${currentDay}`);
        } else if (word.trim()) {
          // Добавляем слово к текущему блоку данных
          currentPairs.push(word.trim());
        }
      }
  
      if (currentDay && currentPairs.length > 0) {
        schedule.push({ day: currentDay, pairs: parsePairs(currentPairs) });
        console.log(`Добавлен последний день недели в расписание: ${currentDay}`, currentPairs);
      }
  
      parsedData.push({
        week: weekNumber,
        schedule,
      });
  
      console.log(`Завершена обработка недели. Структурированные данные:`, { week: weekNumber, schedule });
    });
  
    return parsedData;
  }
  
  // Функция для разбора пар занятий
  function parsePairs(pairsText: string[]): any[] {
    const result: any[] = [];
    const fullText = pairsText.join(" ");
    
    // Регулярное выражение для обычных предметов
    const regularSubjectRegex = /([А-Яа-яёЁ\s-]+)\s+([А-Яа-яёЁ\.]+\s+[А-Яа-яёЁ\.]+)\s+(\d+[a-zA-Zа-яА-Я\/-]*)/g;
    
    // Регулярное выражение для предметов с подгруппами
    const subgroupSubjectRegex = /(Информатика|Иностранный язык)\s+1 п\/г\s+([А-Яа-яёЁ\.]+\s+[А-Яа-яёЁ\.]+)\s+(\d+)\s+2 п\/г\s+([А-Яа-яёЁ\.]+\s+[А-Яа-яёЁ\.]+)\s+(\d+)/g;
    
    // Сначала обрабатываем предметы с подгруппами
    let lastIndex = 0;
    const processedText = fullText.replace(subgroupSubjectRegex, (match, subject, teacher1, room1, teacher2, room2, offset) => {
        result.push({
            subject: subject,
            subgroups: [
                {
                    subgroup: "1 п/г",
                    teacher: teacher1.trim(),
                    room: room1.trim()
                },
                {
                    subgroup: "2 п/г",
                    teacher: teacher2.trim(),
                    room: room2.trim()
                }
            ]
        });
        lastIndex = offset + match.length;
        return ""; // Удаляем обработанный текст
    });
    
    // Затем обрабатываем оставшийся текст для обычных предметов
    const remainingText = processedText.slice(lastIndex);
    let regularMatch;
    while ((regularMatch = regularSubjectRegex.exec(remainingText)) !== null) {
        // Пропускаем пустые совпадения
        if (!regularMatch[1].trim()) continue;
        
        result.push({
            subject: regularMatch[1].trim(),
            teacher: regularMatch[2].trim(),
            room: regularMatch[3].trim()
        });
    }
    
    return result;
}

  

const PdfParser: React.FC<PdfParserProps> = ({ group }) => {
  const [text, setText] = useState<string>(""); // Состояние для хранения текста
  const [schedule, setSchedule] = useState<any[]>([]); // Состояние для структурированных данных

  // Функция для загрузки данных с сервера
  const loadPdfData = async () => {
    try {
      // URL для запроса данных с сервера
      const serverUrl = `http://localhost:3001/api/schedule/${group}`;

      console.log("Загрузка данных с сервера:", serverUrl);

      // Отправляем GET-запрос на сервер
      const response = await fetch(serverUrl);

      if (!response.ok) {
        throw new Error(`Ошибка сети: ${response.status}`);
      }

      // Получаем JSON-данные
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Неизвестная ошибка');
      }

      // Структурируем данные
      setText(data.schedule);
        const structuredData = parseSchedule(data.schedule);
        setSchedule(structuredData);
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
      setText("Не удалось загрузить данные.");
    }
  };

  return (
    <div className={styles.parserContainer}>
      <h2>Парсинг PDF</h2>
      <button onClick={loadPdfData}>Загрузить данные</button>

      {/* Отображение текста */}
      <pre className={styles.textOutput}>{text}</pre>

      {/* Отображение структурированных данных */}
      <div>
        <h3>Структурированное расписание:</h3>
        <pre>{JSON.stringify(schedule, null, 2)}</pre>
      </div>
    </div>
  );
};

export default PdfParser;