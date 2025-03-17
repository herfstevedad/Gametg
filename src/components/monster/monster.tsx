// Monster.tsx
import React, { useEffect, useState, useRef } from 'react';
import './monster.css';

interface MonsterProps {
  onDeath: (droppedCoins: number) => void;
}

const Monster: React.FC<MonsterProps> = ({ onDeath }) => {
  const [hits, setHits] = useState<number>(0);
  const [isAlive, setIsAlive] = useState<boolean>(true);
  const [respawnTextScale, setRespawnTextScale] = useState<number>(1);
  const isProcessingHit = useRef<boolean>(false); // Флаг для предотвращения быстрых нажатий    

 // Функция для выполнения анимации удара
 
 const handleHit = () => {
    if (!isAlive || isProcessingHit.current) return;

    isProcessingHit.current = true; // Блокируем обработку новых нажатий

    const newHits = hits + 1;
    setHits(newHits);

    if (newHits >= 10) {
      setIsAlive(false); // Монстр умирает
      const droppedCoins = 5; // Случайное количество монет (от 5 до 15)
      onDeath(droppedCoins);

      // Запускаем таймер на 10 секунд для возрождения монстра
      setTimeout(() => {
        setIsAlive(true); // Возрождаем монстра
        setHits(0); // Сбрасываем количество ударов
      }, 10000); // 10 секунд
    }

    // Разблокируем обработку нажатий через 300мс (время анимации удара)
    setTimeout(() => {
      isProcessingHit.current = false;
    }, 300);
  };

  // Эффект для анимации текста "Поиск..."
  useEffect(() => {
    let scale = 1;
    const interval = setInterval(() => {
      scale = scale === 1 ? 1.2 : 1; // Плавное изменение масштаба
      setRespawnTextScale(scale);
    }, 500); // Изменение каждые 500мс

    // Очищаем интервал при возрождении монстра
    return () => clearInterval(interval);
  }, [isAlive]);


  return (
    <div className='monsterContainer'>
      {/* Индикатор возрождения */}
      {!isAlive && (
        <div
        className={'respawnText'}
        style={{ transform: `scale(${respawnTextScale})` }}
      >
        Поиск...
      </div>
      )}
    
    {isAlive && (
        <>
          <img
            src="/images/goblin.png" // Путь к изображению гоблина
            alt="Гоблин"
            className={`${'monsterImage'}`}
            onClick={handleHit}
          />

          {/* Полоса здоровья */}
          {hits > 0 && (
            <div className={'healthBarContainer'}>
              <div
                className={'healthBar'}
                style={{
                  width: `${((10 - hits) / 10) * 100}%`,
                  backgroundColor: hits < 5 ? 'green' : 'red',
                }}
              ></div>
            </div>
          )}
        </>
      )}

    </div>

    
  );
};

export default Monster;