// Balance.tsx
import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { cloudStorage } from '@telegram-apps/sdk';
import './balance.css';

export interface BalanceRef {
  addCoins: (amount: number) => void;
}

const Balance = forwardRef<BalanceRef>((_, ref) => {
  const [coins, setCoins] = useState<number>(0);

  useEffect(() => {
    const loadBalance = async () => {
      try {
        const savedBalance = await cloudStorage.getItem('balance')
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
  const addCoins = async (amount: number) => {
    const newCoins = coins + amount;
    setCoins(newCoins);

    // Сохранение баланса в CloudStorage
    try {
      await cloudStorage.setItem('balance', String(newCoins));
    } catch (error) {
      console.error('Ошибка при сохранении баланса:', error);
    }
  };

  useImperativeHandle(ref, () => ({
    addCoins,
  }));

  return (
    <div className={'balanceContainer'}>
    {/* Иконка монеты */}
    <span className={'coinIcon'}>🪙</span>
    {/* Количество монет */}
    <span className={'coinCount'}>{coins}</span>
  </div>
  );
});

export default Balance;