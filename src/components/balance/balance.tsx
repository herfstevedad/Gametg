import { useImperativeHandle, forwardRef, useEffect, useState } from 'react';
import './Balance.css';

export interface BalanceRef {
  addCoins: (amount: number) => void;
}

const Balance = forwardRef<BalanceRef>((_, ref) => {
  const [coins, setCoins] = useState<number>(0);

  // Загрузка баланса из localStorage
  useEffect(() => {
    const loadBalance = () => {
      try {
        const savedBalance = localStorage.getItem('balance');
        if (savedBalance) {
          setCoins(Number(savedBalance));
        }
      } catch (error) {
        console.error('Ошибка при загрузке баланса:', error);
      }
    };

    loadBalance();
  }, []);

  // Метод для увеличения баланса
  const addCoins = (amount: number) => {
    const newCoins = coins + amount;
    setCoins(newCoins);

    // Сохранение баланса в localStorage
    try {
      localStorage.setItem('balance', String(newCoins));
    } catch (error) {
      console.error('Ошибка при сохранении баланса:', error);
    }
  };

  useImperativeHandle(ref, () => ({
    addCoins,
  }));

  return (
    <div className="balanceContainer">
      {/* Количество монет */}
      <span className="coinCount">{coins}</span>
      {/* Иконка монеты */}
      <img src="/images/coin.png" alt="" className="coinIcon" />
    </div>
  );
});

export default Balance;