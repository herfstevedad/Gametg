import { useState, useEffect, useCallback } from 'react';

interface Subgroup {
  subgroup: string;
  teacher: string;
  room: string;
}

interface Pair {
  pair: string;
  subject?: string;
  teacher?: string;
  room?: string;
  subgroups?: Subgroup[];
  isReplacement?: boolean;
  originalSubject?: string;
}

interface Day {
  day: string;
  pairs?: Pair[];
  date?: Date;
}

interface StructuredData {
  week: string;
  days: Day[];
}

interface ScheduleData {
  structuredData: StructuredData[];
}

interface ReplacementSubgroup {
  subgroup: string;
  subject: string;
  teacher: string;
  room: string;
}

interface Replacement {
  pair: string;
  change: string;
  room: string;
  date?: string;
  hasSubgroups?: boolean;
  subgroups?: ReplacementSubgroup[];
}

interface ReplacementHeader {
  combinedHeader: string;
  weekNumber: number;
  date: string | null;
  isoDate: string | null;
  dayOfWeek: string;
  timestamp?: string;
}

interface ReplacementRow {
  change: string;
  pair: string;
  room?: string;
}

interface ReplacementData {
  header: ReplacementHeader;
  rows: ReplacementRow[];
}

type ReplacementsStatus = 'loading' | 'no_replacements' | 'has_replacements' | 'error' | 'not_available';

interface UseScheduleResult {
  scheduleData: ScheduleData | null;
  weeks: StructuredData[];
  currentWeekIndex: number;
  currentDayIndex: number;
  replacements: Replacement[];
  setCurrentWeekIndex: (index: number) => void;
  setCurrentDayIndex: (index: number) => void;
  refreshSchedule: () => void;
  isLoading: boolean;
  error: string | null;
  replacementsStatus: ReplacementsStatus;
  replacementsLastChecked: Date | null;
  replacementsDate: string | null;
}

const MONTHS_RU = {
  'Января': 0, 'Февраля': 1, 'Марта': 2, 'Апреля': 3, 'Мая': 4, 'Июня': 5,
  'Июля': 6, 'Августа': 7, 'Сентября': 8, 'Октября': 9, 'Ноября': 10, 'Декабря': 11
};

export const useSchedule = (group: string): UseScheduleResult => {
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [weeks, setWeeks] = useState<StructuredData[]>([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [replacements, setReplacements] = useState<Replacement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replacementsStatus, setReplacementsStatus] = useState<ReplacementsStatus>('loading');
  const [replacementsLastChecked, setReplacementsLastChecked] = useState<Date | null>(null);
  const [replacementsDate, setReplacementsDate] = useState<string | null>(null);

  const parseRussianDate = (dateStr: string): Date | null => {
    try {
      // Формат: "13 Мая 2025г."
      const match = dateStr.match(/(\d+)\s+([А-Яа-я]+)\s+(\d{4})г\./);
      if (!match) return null;

      const [, day, month, year] = match;
      const monthIndex = MONTHS_RU[month as keyof typeof MONTHS_RU];
      
      if (monthIndex === undefined) return null;
      
      return new Date(parseInt(year), monthIndex, parseInt(day));
    } catch (error) {
      console.error("Ошибка парсинга даты:", error);
      return null;
    }
  };

  const isSameDay = (date1: Date, date2: Date | string | null): boolean => {
    if (!date2) return false;
    
    const d1 = new Date(date1);
    const d2 = typeof date2 === 'string' ? parseRussianDate(date2) : date2;
    
    if (!d2) return false;

    // Сравниваем только день и месяц, игнорируя год
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth();
  };

  const processReplacements = (rawReplacements: any): Replacement[] => {
    console.log("=== Начало обработки сырых данных замен ===");
    console.log("Сырые данные замен:", rawReplacements);

    if (!rawReplacements || !rawReplacements.success) {
      console.log("Нет данных о заменах или ошибка");
      setReplacementsStatus('not_available');
      return [];
    }

    if (!Array.isArray(rawReplacements.replacements) || rawReplacements.replacements.length === 0) {
      console.log("Массив замен пуст");
      setReplacementsStatus('no_replacements');
      return [];
    }

    const processedReplacements: Replacement[] = [];
    let hasReplacementsForGroup = false;

    const splitIntoSubgroups = (change: string, rooms: string): { subject: string; teacher: string; room: string; }[] => {
      // Разделяем строку замены по двойным пробелам, чтобы получить части для разных подгрупп
      const parts = change.split(/\s{2,}/);
      const roomParts = rooms.split(/\s+/);
      
      return parts.map((part, index) => {
        // Ищем преподавателя по шаблону "Фамилия И.О."
        const teacherMatch = part.match(/([А-Я][а-я]+\s+[А-Я]\.[А-Я]\.)/);
        let subject = part;
        let teacher = '';

        if (teacherMatch) {
          teacher = teacherMatch[1];
          // Удаляем имя преподавателя из названия предмета
          subject = part.replace(teacherMatch[1], '').trim();
        }

        return {
          subject: subject,
          teacher: teacher,
          room: roomParts[index] || ''
        };
      });
    };

    rawReplacements.replacements.forEach((replacementData: ReplacementData) => {
      console.log("Обработка блока замен:", replacementData);
      
      if (replacementData.header.date) {
        console.log("Дата замен:", replacementData.header.date);
        setReplacementsDate(replacementData.header.date);
        
        replacementData.rows.forEach((row: ReplacementRow) => {
          if (row.pair && row.change) {
            console.log("Обработка строки замены:", row);
            hasReplacementsForGroup = true;

            const subgroups = splitIntoSubgroups(row.change, row.room || '');
            
            const processedReplacement = {
              pair: row.pair.trim(),
              change: row.change,
              room: row.room || '',
              date: replacementData.header.date || undefined,
              hasSubgroups: subgroups.length > 1,
              subgroups: subgroups.length > 1 ? subgroups.map((sg, index) => ({
                subgroup: `${index + 1} подгруппа`,
                subject: sg.subject,
                teacher: sg.teacher,
                room: sg.room
              })) : undefined
            };

            console.log("Обработанная замена:", processedReplacement);
            processedReplacements.push(processedReplacement);
          }
        });
      }
    });

    setReplacementsStatus(hasReplacementsForGroup ? 'has_replacements' : 'no_replacements');
    console.log("Итоговые обработанные замены:", processedReplacements);
    console.log("=== Конец обработки сырых данных замен ===");
    return processedReplacements;
  };

  const applyReplacementsToPairs = (pairs: Pair[] | undefined, date: Date, replacements: Replacement[]): Pair[] => {
    console.log('=== Начало обработки замен ===');
    console.log('Дата:', date.toLocaleDateString());
    console.log('Текущие пары:', pairs);
    console.log('Доступные замены:', replacements);

    // Если пар нет, создаем пустой массив
    let updatedPairs = pairs ? [...pairs] : [];
    
    // Находим все замены для текущего дня
    const dayReplacements = replacements.filter(r => {
      const replacementDate = r.date ? parseRussianDate(r.date) : null;
      const isSameDate = replacementDate && isSameDay(date, replacementDate);
      console.log('Проверка замены:', {
        replacement: r,
        parsedDate: replacementDate?.toLocaleDateString(),
        currentDate: date.toLocaleDateString(),
        matches: isSameDate
      });
      return isSameDate;
    });

    console.log('Найденные замены для текущего дня:', dayReplacements);

    // Обрабатываем каждую замену
    dayReplacements.forEach(replacement => {
      console.log('Обработка замены:', replacement);
      const pairIndex = updatedPairs.findIndex(p => p.pair === replacement.pair);
      
      if (pairIndex !== -1) {
        console.log('Найдена существующая пара для замены:', updatedPairs[pairIndex]);
        
        // Сохраняем информацию о замене
        const replacedPair = {
          pair: replacement.pair,
          isReplacement: true,
          originalSubject: updatedPairs[pairIndex].subject || undefined
        } as Pair;

        if (replacement.hasSubgroups && replacement.subgroups) {
          replacedPair.subgroups = replacement.subgroups.map(sg => ({
            subgroup: sg.subgroup,
            teacher: sg.teacher,
            room: sg.room,
            subject: sg.subject
          }));
        } else {
          replacedPair.subject = replacement.change;
          replacedPair.room = replacement.room;
        }
        
        updatedPairs[pairIndex] = replacedPair;
        console.log('Пара заменена:', replacedPair);
      } else {
        console.log('Добавление новой пары из замены');
        const newPair = {
          pair: replacement.pair,
          isReplacement: true
        } as Pair;

        if (replacement.hasSubgroups && replacement.subgroups) {
          newPair.subgroups = replacement.subgroups.map(sg => ({
            subgroup: sg.subgroup,
            teacher: sg.teacher,
            room: sg.room,
            subject: sg.subject
          }));
        } else {
          newPair.subject = replacement.change;
          newPair.room = replacement.room;
        }

        updatedPairs.push(newPair);
        console.log('Новая пара добавлена:', newPair);
      }
    });

    // Сортируем пары по номеру
    const sortedPairs = updatedPairs
      .sort((a, b) => parseInt(a.pair) - parseInt(b.pair))
      .filter(pair => pair.subject !== '' || parseInt(pair.pair) <= Math.max(...updatedPairs.filter(p => p.subject !== '').map(p => parseInt(p.pair))));

    console.log('Итоговый список пар:', sortedPairs);
    console.log('=== Конец обработки замен ===');
    return sortedPairs;
  };

  const loadScheduleFromStorage = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setReplacementsStatus('loading');
    
    try {
      const storageKey = `schedule_${group}`;
      const replacementsStorageKey = `replacements_${group}`;
      const storedData = localStorage.getItem(storageKey);
      const storedReplacements = localStorage.getItem(replacementsStorageKey);

      let currentReplacements: Replacement[] = [];

      if (storedReplacements) {
        try {
          const parsedReplacements = JSON.parse(storedReplacements);
          console.log("Распарсенные замены:", parsedReplacements);
          
          currentReplacements = processReplacements(parsedReplacements);
          setReplacementsLastChecked(new Date());
          
          setReplacements(currentReplacements);
        } catch (error) {
          console.error("Ошибка парсинга замен:", error);
          setReplacementsStatus('error');
        }
      } else {
        setReplacementsStatus('not_available');
      }

      if (storedData) {
        try {
          const parsedData: ScheduleData = JSON.parse(storedData);
          const flattenedData = Array.isArray(parsedData.structuredData)
            ? parsedData.structuredData.flat()
            : [];
          
          const currentDate = new Date();
          const startDate = new Date(currentDate.getFullYear(), 0, 1);
          const days = Math.floor((currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
          const currentWeek = Math.ceil((days + startDate.getDay()) / 7);
          const isEvenWeek = currentWeek % 2 === 0;
      
          const weekIndex = isEvenWeek ? 0 : 1;
          
          const sortedWeeks = isEvenWeek 
            ? [flattenedData[1], flattenedData[0]]
            : [flattenedData[0], flattenedData[1]];
      
          // Получаем текущий день недели (0 - воскресенье, 1 - понедельник, и т.д.)
          let currentDayOfWeek = currentDate.getDay();
          // Преобразуем в нашу систему (0 - понедельник, 1 - вторник, и т.д.)
          currentDayOfWeek = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

          // Находим дату понедельника текущей недели
          const mondayDate = new Date(currentDate);
          mondayDate.setDate(currentDate.getDate() - currentDayOfWeek);

          const updatedData = sortedWeeks.map((week, weekIdx) => {
            return {
              ...week,
              days: week.days.map((day, dayIndex) => {
                // Создаем новую дату, начиная с понедельника
                const dayDate = new Date(mondayDate);
                // Добавляем смещение для конкретного дня недели
                dayDate.setDate(mondayDate.getDate() + dayIndex + (weekIdx * 7));
                
                return {
                  ...day,
                  date: dayDate,
                  pairs: applyReplacementsToPairs(day.pairs, dayDate, currentReplacements)
                };
              })
            };
          });
      
          setScheduleData({ ...parsedData, structuredData: updatedData });
          setWeeks(updatedData);
          setCurrentWeekIndex(weekIndex);
          setCurrentDayIndex(currentDayOfWeek);
        } catch (error) {
          console.error("Ошибка парсинга данных:", error);
          setError("Ошибка при загрузке расписания");
        }
      } else {
        setScheduleData(null);
        setError("Расписание не найдено");
      }
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
      setError("Произошла ошибка при загрузке данных");
    } finally {
      setIsLoading(false);
    }
  }, [group]);

  const checkReplacements = useCallback(async () => {
    try {
      setReplacementsStatus('loading');
      const response = await fetch(`http://localhost:3001/api/replacements/${group}`);
      
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      
      const replacementsData = await response.json();
      localStorage.setItem(`replacements_${group}`, JSON.stringify(replacementsData));
      
      const processedReplacements = processReplacements(replacementsData);
      setReplacements(processedReplacements);
      setReplacementsLastChecked(new Date());
      
    } catch (error) {
      console.error("Ошибка при проверке замен:", error);
      setReplacementsStatus('error');
    }
  }, [group]);

  useEffect(() => {
    if (group) {
      loadScheduleFromStorage();
      checkReplacements();
    }
  }, [group, loadScheduleFromStorage, checkReplacements]);

  useEffect(() => {
    window.addEventListener("scheduleUpdated", loadScheduleFromStorage);
    return () => {
      window.removeEventListener("scheduleUpdated", loadScheduleFromStorage);
    };
  }, [loadScheduleFromStorage]);

  return {
    scheduleData,
    weeks,
    currentWeekIndex,
    currentDayIndex,
    replacements,
    setCurrentWeekIndex,
    setCurrentDayIndex,
    refreshSchedule: loadScheduleFromStorage,
    isLoading,
    error,
    replacementsStatus,
    replacementsLastChecked,
    replacementsDate
  };
};

export type { 
  Subgroup,
  Pair,
  Day,
  StructuredData,
  ScheduleData,
  Replacement,
  UseScheduleResult
}; 