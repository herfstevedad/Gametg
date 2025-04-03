import React, { useState } from "react";
import styles from "./PdfParser.module.css";

interface PdfParserProps {
  group: string | null;
}

interface SchedulePair {
  subject: string;
}

interface ScheduleDay {
  day: string;
  pairs: SchedulePair[];
}

interface WeekSchedule {
  week: string;
  schedule: ScheduleDay[];
}

function parseSchedule(text: string): WeekSchedule[] {
  console.log('=== НАЧАЛО ПАРСИНГА ===');
  console.log('Исходный текст:', text);

  // Нормализация текста
  text = text.replace(/\s+/g, ' ').trim();
  text = text.replace(/\u00A0/g, ' ');
  console.log('Текст после нормализации:', text);

  // Словарь дней недели
  const dayNamesMap: Record<string, string> = {
    'Пнд': 'Понедельник',
    'Втр': 'Вторник',
    'Срд': 'Среда',
    'Чтв': 'Четверг',
    'Птн': 'Пятница',
    'Сбт': 'Суббота'
  };
  const daysAbbreviations = Object.keys(dayNamesMap);

  // Разделяем текст на недели
  const weekSections = text.split('Неделя:').slice(1);
  console.log(`Найдено недель: ${weekSections.length}`);

  const result: WeekSchedule[] = [];

  weekSections.forEach((weekText, weekIndex) => {
    console.log(`\n=== ОБРАБОТКА НЕДЕЛИ ${weekIndex + 1} ===`);

    const weekNumberMatch = weekText.match(/(\d+-я)/);
    const weekNumber = weekNumberMatch?.[1] || '1-я';
    console.log(`Номер недели: ${weekNumber}`);

    const weekData: WeekSchedule = {
      week: weekNumber,
      schedule: []
    };

    // Ищем дни недели в тексте
    const dayRegex = new RegExp(`(${daysAbbreviations.join('|')})\\s*(.*?)(?=${daysAbbreviations.join('|')}|$)`, 'gs');
    const dayMatches = [...weekText.matchAll(dayRegex)];
    console.log(`Найдено дней в неделе: ${dayMatches.length}`);

    dayMatches.forEach((match, dayIndex) => {
      const dayAbbreviation = match[1];
      let dayContent = match[2].trim();
      console.log(`\nОбработка дня ${dayIndex + 1}: ${dayAbbreviation}`);
      console.log('Содержимое дня:', dayContent);

      const dayData: ScheduleDay = {
        day: dayNamesMap[dayAbbreviation],
        pairs: []
      };

      // Обработка дней без пар
      if (dayContent.trim() === '_') {
        weekData.schedule.push(dayData);
        return;
      }

      // Удаляем лишние символы
      dayContent = dayContent.replace(/_$/, '').trim();

      // Разделяем на отдельные пары (как обычные, так и с подгруппами)
      const allPairs = splitIntoPairs(dayContent);
      console.log('Все пары дня:', allPairs);

      // Обрабатываем каждую пару
      allPairs.forEach(pair => {
        if (isSubgroupPair(pair)) {
          // Для пар с подгруппами сохраняем как есть
          dayData.pairs.push({ subject: pair.trim() });
        } else {
          // Для обычных пар разбиваем на составляющие
          const parsedPair = parseRegularPair(pair);
          if (parsedPair) {
            dayData.pairs.push({ subject: parsedPair });
          }
        }
      });

      weekData.schedule.push(dayData);
      console.log(`Результат обработки дня ${dayAbbreviation}:`, dayData);
    });

    result.push(weekData);
    console.log(`Результат обработки недели ${weekNumber}:`, weekData);
  });

  console.log('\n=== РЕЗУЛЬТАТ ПАРСИНГА ===');
  console.log(JSON.stringify(result, null, 2));
  return result;
}

// Вспомогательные функции

/** Определяет, является ли пара парой с подгруппами */
function isSubgroupPair(pair: string): boolean {
  return /(\d\s?п\/г)/.test(pair);
}

/** Разделяет содержимое дня на отдельные пары */
function splitIntoPairs(content: string): string[] {
  console.log('=== START splitIntoPairs ===');
  console.log('Original content:', content);
  
  content = content.replace(/_$/, '').trim();
  console.log('After cleaning:', content);
  
  const pairs: string[] = [];
  const tokens = content.split(/\s+/);
  console.log('Tokens:', tokens);
  
  let i = 0;
  while (i < tokens.length) {
    console.log(`\nProcessing token ${i}: "${tokens[i]}"`);
    
    // Обработка пар с подгруппами
    if (i + 1 < tokens.length && tokens[i] === '1' && tokens[i+1] === 'п/г') {
      console.log('Found subgroup pair start');
      let pairContent = '';
      
      // Собираем название предмета
      let subjectTokens = [];
      let j = i - 1;
      while (j >= 0 && !isRoom(tokens[j])) {
        subjectTokens.unshift(tokens[j]);
        j--;
      }
      pairContent = subjectTokens.join(' ');
      console.log('Subject name:', pairContent);
      
      // Добавляем подгруппы
      pairContent += ` 1 п/г ${tokens[i+2]} ${tokens[i+3]} ${tokens[i+4]}`;
      i += 5;
      console.log('After 1st subgroup:', pairContent, 'New i:', i);
      
      // Проверяем вторую подгруппу
      if (i + 1 < tokens.length && tokens[i] === '2' && tokens[i+1] === 'п/г') {
        pairContent += ` 2 п/г ${tokens[i+2]} ${tokens[i+3]} ${tokens[i+4]}`;
        i += 5;
        console.log('After 2nd subgroup:', pairContent, 'New i:', i);
      }
      
      pairs.push(pairContent);
      console.log('Added subgroup pair:', pairContent);
    }
    // Обработка обычных пар
    else {
      console.log('Processing regular pair');
      let pairContent = '';
      let hasTeacher = false;
      let hasRoom = false;
      let teacherName = '';
      
      while (i < tokens.length) {
        const token = tokens[i];
        console.log(`Token ${i}: "${token}"`, 'Current pair:', pairContent);
        
        // Проверяем не начало ли это следующей пары с подгруппами
        if (i + 1 < tokens.length && token === '1' && tokens[i+1] === 'п/г') {
          console.log('Next token starts subgroup, breaking');
          break;
        }
        
        pairContent += (pairContent ? ' ' : '') + token;
        console.log('Updated pairContent:', pairContent);
        
        // Проверяем специальные случаи названий
        if (pairContent.includes('Физическая культура')) {
          console.log('Found "Физическая культура"');
          if (!hasTeacher && i + 1 < tokens.length) {
            teacherName = tokens[i+1];
            pairContent += ' ' + teacherName;
            hasTeacher = true;
            i++;
            console.log('Added teacher:', teacherName, 'New i:', i);
          }
        }
        // Проверяем стандартное ФИО преподавателя
        else if (!hasTeacher && /^[А-ЯЁ][а-яё]+\.[А-ЯЁ]\.[А-ЯЁ]?\.?$/.test(token)) {
          hasTeacher = true;
          console.log('Found standard teacher:', token);
        }
        
        // Проверяем аудиторию
        if (!hasRoom && isRoom(token)) {
          hasRoom = true;
          console.log('Found room:', token);
          i++;
          break;
        }
        
        i++;
      }
      
      console.log('Finished processing pair:', {
        pairContent,
        hasTeacher,
        hasRoom,
        lastToken: tokens[i-1],
        isRoomLast: isRoom(tokens[i-1])
      });
      
      // Условия добавления пары
      if ((pairContent && hasTeacher && hasRoom) ||
          (pairContent.includes('Физическая культура') && hasRoom) ||
          (pairContent && isRoom(tokens[i-1]))) {
        pairs.push(pairContent);
        console.log('✅ Added pair:', pairContent);
      } else {
        console.log('❌ Skipped pair:', pairContent, 'Reason:', 
          !hasTeacher ? 'No teacher' : '', 
          !hasRoom ? 'No room' : '');
      }
    }
  }

  console.log('=== FINAL PAIRS ===', pairs);
  return pairs.filter(p => p.trim().length > 0);
}

/** Парсит обычную пару (без подгрупп) */
function parseRegularPair(pair: string): string | null {
  // Специальная обработка для Физической культуры
  if (pair.startsWith('Физическая культура')) {
    return pair;
  }
  
  const match = pair.match(/^(.+?)\s+([А-ЯЁ][а-яё]+\s[А-ЯЁ]\.[А-ЯЁ]\.?)\s+(\d+[a-zA-Zа-яА-Я\/-]*)$/);
  return match ? `${match[1]} ${match[2]} ${match[3]}` : pair;
}

/** Проверяет, является ли токен аудиторией */
function isRoom(token: string): boolean {
  // Расширенное регулярное выражение для аудиторий
  const result = /^\d+[a-zA-Zа-яА-Я]*(?:\/\d+)?$/.test(token);
  console.log(`isRoom("${token}") -> ${result}`);
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
      console.log(data.text);
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