import React, { useMemo, useState } from "react";
import styles from "./ScheduleCards.module.css";
import { useSchedule } from "../../../hooks/useSchedule";
import LoadingSpinner from "../../common/LoadingSpinner/LoadingSpinner";
import ErrorMessage from "../../common/ErrorMessage/ErrorMessage";
import ReplacementsStatus from "../../common/ReplacementsStatus/ReplacementsStatus";

interface ScheduleCardsProps {
  group: string;
}

const shortDayNames: { [key: string]: string } = {
  'Понедельник': 'Пн',
  'Вторник': 'Вт',
  'Среда': 'Ср',
  'Четверг': 'Чт',
  'Пятница': 'Пт',
  'Суббота': 'Сб',
  'Воскресенье': 'Вс'
};

const formatDate = (date: Date) => {
  return date.getDate().toString().padStart(2, '0') + '.' + (date.getMonth() + 1).toString().padStart(2, '0');
};

const ScheduleCards: React.FC<ScheduleCardsProps> = ({ group }) => {
  const {
    weeks,
    currentWeekIndex,
    currentDayIndex,
    setCurrentDayIndex,
    setCurrentWeekIndex,
    isLoading,
    error,
    refreshSchedule,
    replacementsStatus,
    replacementsLastChecked,
    replacementsDate
  } = useSchedule(group);

  const [showingOriginalPair, setShowingOriginalPair] = useState<number | null>(null);

  // Определяем текущий номер недели
  const currentDate = new Date();
  const startDate = new Date(currentDate.getFullYear(), 0, 1);
  const days = Math.floor((currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  const currentWeek = Math.ceil((days + startDate.getDay()) / 7);
  const isEvenWeek = currentWeek % 2 === 0;

  // Функция для получения номера недели (1 или 2)
  const getWeekNumber = (index: number) => {
    // Если текущая неделя четная, то:
    // - индекс 0 соответствует 2-й неделе
    // - индекс 1 соответствует 1-й неделе
    // Если текущая неделя нечетная, то наоборот
    if (isEvenWeek) {
      return index === 0 ? 2 : 1;
    } else {
      return index === 0 ? 1 : 2;
    }
  };

  const daysWithPairs = useMemo(() => {
    if (!weeks?.[currentWeekIndex]?.days) return [];

    const dayOrder = {
      'Понедельник': 0,
      'Вторник': 1,
      'Среда': 2,
      'Четверг': 3,
      'Пятница': 4,
      'Суббота': 5,
      'Воскресенье': 6
    };

    return weeks[currentWeekIndex].days
      .filter(day => day && day.day && day.pairs && Array.isArray(day.pairs))
      .sort((a, b) => {
        const orderA = dayOrder[a.day as keyof typeof dayOrder] ?? 0;
        const orderB = dayOrder[b.day as keyof typeof dayOrder] ?? 0;
        return orderA - orderB;
      });
  }, [weeks, currentWeekIndex]);

  const formatWeekDate = (date: Date) => {
    return date.getDate().toString().padStart(2, '0') + '.' + (date.getMonth() + 1).toString().padStart(2, '0');
  };

  const getWeekDates = (weekIndex: number) => {
    if (!weeks?.[weekIndex]?.days?.length) return null;
    const firstDay = weeks[weekIndex].days[0].date;
    const lastDay = weeks[weekIndex].days[weeks[weekIndex].days.length - 1].date;
    if (!firstDay || !lastDay) return null;
    return `${formatWeekDate(firstDay)}-${formatWeekDate(lastDay)}`;
  };

  // Добавим функцию для правильного склонения слова "пара"
  const getParaWord = (count: number): string => {
    if (count === 1) return 'пара';
    if (count >= 2 && count <= 4) return 'пары';
    return 'пар';
  };

  const handleReplacementClick = (index: number) => {
    setShowingOriginalPair(index);
    setTimeout(() => {
      setShowingOriginalPair(null);
    }, 3000); // Показываем оригинальный предмет на 3 секунды
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <ErrorMessage message={error} onRetry={refreshSchedule} />
      </div>
    );
  }

  if (!daysWithPairs.length || currentDayIndex === undefined) {
    return (
      <div className={styles.container}>
        <div className={styles.dayContent}>
          <div className={styles.dayHeader}>
            <h2 className={styles.dayTitle}>Нет занятий</h2>
          </div>
        </div>
      </div>
    );
  }

  const currentDay = daysWithPairs[currentDayIndex];
  if (!currentDay || !currentDay.pairs) {
    return (
      <div className={styles.container}>
        <div className={styles.dayContent}>
          <div className={styles.dayHeader}>
            <h2 className={styles.dayTitle}>Нет данных о занятиях</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ReplacementsStatus 
        status={replacementsStatus}
        lastChecked={replacementsLastChecked}
        replacementsDate={replacementsDate || undefined}
      />
      <div className={styles.weekNavigation}>
        <div className={styles.weekSwitcher}>
          {weeks?.map((_, index) => {
            const weekDates = getWeekDates(index);
            return (
              <button
                key={index}
                className={`${styles.weekButton} ${index === currentWeekIndex ? styles.active : ''}`}
                onClick={() => setCurrentWeekIndex(index)}
              >
                {index === 0 ? 'Текущая' : 'Следующая'}
                {weekDates && <span style={{ fontSize: '11px', marginLeft: '4px', opacity: 0.8 }}>
                  {weekDates}
                </span>}
              </button>
            );
          })}
        </div>
        {daysWithPairs.map((day, index) => (
          <button
            key={day.day}
            className={`${styles.dayButton} ${index === currentDayIndex ? styles.active : ''}`}
            onClick={() => setCurrentDayIndex(index)}
          >
            <span className={styles.dayName}>{shortDayNames[day.day]}</span>
            <span className={styles.dayDate}>{day.date && formatDate(day.date)}</span>
          </button>
        ))}
      </div>
      <div className={styles.dayContent}>
        <div className={styles.dayHeader}>
          <h2 className={styles.dayTitle}>
            {currentDay.day}, {currentDay.date?.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
            <span className={styles.weekNumber}>
              {` • ${getWeekNumber(currentWeekIndex)} неделя`}
            </span>
          </h2>
          <div className={styles.lessonsCount}>
            {currentDay.pairs?.filter(pair => pair.subject || (pair.subgroups && pair.subgroups.length > 0)).length || 0}
            {' '}
            {getParaWord(currentDay.pairs?.filter(pair => pair.subject || (pair.subgroups && pair.subgroups.length > 0)).length || 0)}
          </div>
        </div>
        <div className={styles.lessonsList}>
          {currentDay.pairs
            .filter(pair => pair.subject || (pair.subgroups && pair.subgroups.length > 0))
            .map((pair, index) => (
            <div 
              key={index} 
              className={`${styles.lessonCard} ${
                pair.isReplacement 
                  ? pair.originalSubject 
                    ? styles.replacement 
                    : styles.emptyReplacement
                  : ''
              } ${showingOriginalPair === index ? styles.showOriginal : ''}`}
              onClick={() => pair.isReplacement && pair.originalSubject ? handleReplacementClick(index) : undefined}
            >
              <div className={styles.lessonContent}>
                <div className={styles.lessonInfo}>
                  {pair.isReplacement && pair.originalSubject && (
                    <div className={styles.originalSubject}>{pair.originalSubject}</div>
                  )}
                  <h3 className={styles.lessonName}>
                    {pair.subject}
                    {pair.isReplacement && (
                      <span className={pair.originalSubject ? styles.replacementBadge : styles.emptyPairBadge}>
                        {pair.originalSubject ? 'Замена' : 'Добавлена'}
                      </span>
                    )}
                  </h3>
                  {!pair.subgroups ? (
                    <>
                      <p className={styles.lessonTeacher}>
                        <span className={styles.pairNumber}>{pair.pair} пара</span>
                        {pair.teacher && <span className={styles.teacherText}>{pair.teacher}</span>}
                      </p>
                      {pair.isReplacement && !pair.originalSubject && (
                        <p className={styles.emptyPairInfo}>Изначально пары не было</p>
                      )}
                      {pair.room && <p className={styles.lessonRoom}>Ауд. {pair.room}</p>}
                    </>
                  ) : (
                    <div>
                      <p className={styles.pairNumber}>{pair.pair} пара</p>
                      {pair.subgroups.map((subgroup, sIndex) => (
                        <div key={sIndex} className={styles.subgroupItem}>
                          <p className={styles.lessonTeacher}>
                            <span className={styles.subgroupLabel}>{subgroup.subgroup}</span>
                            {subgroup.teacher && (
                              <span className={styles.teacherText}>{subgroup.teacher}</span>
                            )}
                            {subgroup.room && (
                              <span className={styles.lessonRoom}>Ауд. {subgroup.room}</span>
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {pair.isReplacement && pair.originalSubject && (
                <div className={styles.originalContent}>
                  <div className={styles.lessonInfo}>
                    <h3 className={styles.lessonName}>
                      {pair.originalSubject}
                      <span className={styles.temporaryBadge}>По расписанию</span>
                    </h3>
                    <p className={styles.lessonTeacher}>
                      <span className={styles.pairNumber}>{pair.pair} пара</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ScheduleCards);