import { useState, useEffect } from "react";
import styles from "./PdfParser.module.css";

interface PdfParserProps {
  group: string | null;
  onScheduleLoaded: (schedule: WeekSchedule[]) => void; // Callback для передачи данных
}

interface SchedulePair {
  subjectName: string;
  teacher: string;
  room: string;
}

interface SubgroupPair {
  subjectName: string;
  subgroups: {
    subgroup: string; // Например: "1 п/г"
    teacher: string;
    room: string;
  }[];
}

interface ScheduleDay {
  day: string;
  pairs: (SchedulePair | SubgroupPair)[];
}

export interface WeekSchedule {
  week: string;
  schedule: ScheduleDay[];
}

function parseSchedule(text: string): WeekSchedule[] {
  // Нормализация текста
  text = text.replace(/\s+/g, ' ').trim();
  text = text.replace(/\u00A0/g, ' ');

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
  const result: WeekSchedule[] = [];

  weekSections.forEach(weekText => {
    const weekNumberMatch = weekText.match(/(\d+-я)/);
    const weekNumber = weekNumberMatch?.[1] || '1-я';

    const weekData: WeekSchedule = {
      week: weekNumber,
      schedule: []
    };

    // Ищем дни недели в тексте
    const dayRegex = new RegExp(`(${daysAbbreviations.join('|')})\\s*(.*?)(?=${daysAbbreviations.join('|')}|$)`, 'gs');
    const dayMatches = [...weekText.matchAll(dayRegex)];

    dayMatches.forEach(match => {
      const dayAbbreviation = match[1];
      let dayContent = match[2].trim();

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

      // Разделяем на отдельные пары
      const allPairs = splitIntoPairs(dayContent);

      // Обрабатываем каждую пару
      allPairs.forEach(pair => {
        console.log(`[Обработка пары] Начало обработки: "${pair}"`);

        if (isSubgroupPair(pair)) {
          console.log('[Обработка пары] Обнаружена пара с подгруппой');
          const parsedPair = parseRegularPair(pair);
          if (parsedPair && 'subgroups' in parsedPair) {
            console.log('[Обработка пары] Успешно структурирована пара с подгруппами:', parsedPair);
            dayData.pairs.push(parsedPair);
          } else {
            console.log('[Обработка пары] Не удалось структурировать пару с подгруппами');
            dayData.pairs.push({
              subjectName: pair.trim(),
              teacher: '',
              room: ''
            });
          }
        } else {
          const parsedPair = parseRegularPair(pair);
          if (parsedPair) {
            console.log('[Обработка пары] Успешно структурирована обычная пара:', parsedPair);
            dayData.pairs.push(parsedPair);
          } else {
            console.log('[Обработка пары] Не удалось структурировать, сохраняем как есть');
            dayData.pairs.push({
              subjectName: pair.trim(),
              teacher: '',
              room: ''
            });
          }
        }
      });

      weekData.schedule.push(dayData);
    });

    result.push(weekData);
  });

  return result;
}

// Вспомогательные функции
function isSubgroupPair(pair: string): boolean {
  return /(\d\s?п\/г)/.test(pair);
}

function parseRegularPair(pair: string): SchedulePair | SubgroupPair | null {
  // Улучшенная нормализация строки
  pair = pair
    .replace(/([А-ЯЁ])\.\s+([А-ЯЁ])\./g, '$1.$2.') // Убираем пробелы между инициалами
    .replace(/([А-ЯЁ])\.([А-ЯЁ])\s?\.?/g, '$1.$2.') // Исправляем пропущенные точки
    .replace(/\s+/g, ' ') // Убираем множественные пробелы
    .trim();

  console.log(`[parseRegularPair] Нормализованная строка: "${pair}"`);

  // Проверяем, содержит ли строка подгруппы
  const subgroupMatch = pair.match(/^(.+?)\s+(\d\s?п\/г\s+[А-ЯЁ][а-яё]+\s[А-ЯЁ]\.[А-ЯЁ]\.?\s+\d+[a-zA-Zа-яА-Я\/-]*)/);
  if (subgroupMatch) {
    const subjectName = subgroupMatch[1].trim();
    console.log(`[parseRegularPair] Обнаружена пара с подгруппами. Предмет: "${subjectName}"`);

    const subgroups: { subgroup: string; teacher: string; room: string }[] = [];

    // Разделяем подгруппы
    const subgroupParts = pair.split(/\s+(\d\s?п\/г)/).filter(Boolean);
    console.log(`[parseRegularPair] Подгруппы найдены:`, subgroupParts);

    for (let i = 1; i < subgroupParts.length; i += 2) {
      const subgroupName = subgroupParts[i].trim(); // Например: "1 п/г"
      const details = subgroupParts[i + 1].trim();
      console.log(`[parseRegularPair] Обработка подгруппы ${subgroupName}: "${details}"`);

      const [teacher, room] = details.split(/\s+(\d+[a-zA-Zа-яА-Я\/-]*)$/).filter(Boolean);
      console.log(`[parseRegularPair] Преподаватель: "${teacher}", Аудитория: "${room}"`);

      subgroups.push({
        subgroup: subgroupName, // Используем только номер подгруппы
        teacher: teacher.trim(),
        room: room.trim()
      });
    }

    return {
      subjectName,
      subgroups
    };
  }

  // Специальная обработка для Физической культуры
  if (pair.startsWith('Физическая культура')) {
    const parts = pair.split(' ');
    const teacher = parts[2] + ' ' + parts[3];
    const room = parts.slice(4).join(' ');
    return {
      subjectName: 'Физическая культура',
      teacher,
      room
    };
  }

  // Новое улучшенное регулярное выражение
  const match = pair.match(/^(.+?)\s+([А-ЯЁ][а-яё]+(?:\s[А-ЯЁ]\.[А-ЯЁ]\.?)+)\s+(\d+[a-zA-Zа-яА-Я\/-]*)(?:\s|$)/);

  if (!match) {
    // Попробуем альтернативный вариант парсинга
    const altMatch = pair.match(/^(.+?)\s+([А-ЯЁ][а-яё]+\s[А-ЯЁ]\.[А-ЯЁ]?\.?)\s*(\d+[a-zA-Zа-яА-Я\/-]*)$/);
    if (altMatch) {
      return {
        subjectName: altMatch[1],
        teacher: altMatch[2].replace(/\s+/g, ' ').trim(),
        room: altMatch[3]
      };
    }

    console.log('[parseRegularPair] Не удалось распарсить даже после нормализации');
    return null;
  }

  return {
    subjectName: match[1],
    teacher: match[2].replace(/\s+/g, ' ').trim(),
    room: match[3]
  };
}

function splitIntoPairs(content: string): string[] {
  content = content.replace(/_$/, '').trim();
  const pairs: string[] = [];
  const tokens = content.split(/\s+/);

  let i = 0;
  while (i < tokens.length) {
    if (i + 1 < tokens.length && tokens[i] === '1' && tokens[i + 1] === 'п/г') {
      let pairContent = '';

      let subjectTokens = [];
      let j = i - 1;
      while (j >= 0 && !isRoom(tokens[j])) {
        subjectTokens.unshift(tokens[j]);
        j--;
      }
      pairContent = subjectTokens.join(' ');

      pairContent += ` 1 п/г ${tokens[i + 2]} ${tokens[i + 3]} ${tokens[i + 4]}`;
      i += 5;

      if (i + 1 < tokens.length && tokens[i] === '2' && tokens[i + 1] === 'п/г') {
        pairContent += ` 2 п/г ${tokens[i + 2]} ${tokens[i + 3]} ${tokens[i + 4]}`;
        i += 5;
      }

      pairs.push(pairContent);
    } else {
      let pairContent = '';
      let hasTeacher = false;
      let hasRoom = false;

      while (i < tokens.length) {
        const token = tokens[i];

        if (i + 1 < tokens.length && token === '1' && tokens[i + 1] === 'п/г') {
          break;
        }

        pairContent += (pairContent ? ' ' : '') + token;

        if (pairContent.includes('Физическая культура')) {
          if (!hasTeacher && i + 1 < tokens.length) {
            pairContent += ' ' + tokens[i + 1];
            hasTeacher = true;
            i++;
          }
        } else if (!hasTeacher && /^[А-ЯЁ][а-яё]+\.[А-ЯЁ]\.[А-ЯЁ]?\.?$/.test(token)) {
          hasTeacher = true;
        }

        if (!hasRoom && isRoom(token)) {
          hasRoom = true;
          i++;
          break;
        }

        i++;
      }

      if ((pairContent && hasTeacher && hasRoom) ||
        (pairContent.includes('Физическая культура') && hasRoom) ||
        (pairContent && isRoom(tokens[i - 1]))) {
        pairs.push(pairContent);
      }
    }
  }

  return pairs.filter(p => p.trim().length > 0);
}

function isRoom(token: string): boolean {
  return /^\d+[a-zA-Zа-яА-Я]*(?:\/\d+[a-zA-Zа-яА-Я]*)?$/.test(token);
}

const PdfParser: React.FC<PdfParserProps> = ({ group, onScheduleLoaded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [schedule, setSchedule] = useState<WeekSchedule[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadPdfData = async () => {
    if (!group) {
      setError("Номер группы не указан");
      return; 
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://server-re9g.onrender.com/api/schedule/${group}`);
      if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Неизвестная ошибка сервера');

      const structuredData = parseSchedule(data.schedule);
      setSchedule(structuredData);

      // Вызываем колбэк, если он передан
      if (onScheduleLoaded) {
        onScheduleLoaded(structuredData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      console.error("Ошибка при загрузке данных:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (group) {
      loadPdfData();
    }
  }, [group]);

  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}
      {isLoading && <div className={styles.loading}>Загрузка...</div>}
    </div>
  );
};

export default PdfParser;