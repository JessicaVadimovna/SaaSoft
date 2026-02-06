import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { Account } from '@/types';

export const useAccountStore = defineStore('account', () => {
  const accounts = ref<Account[]>([]);

  // 1. Инициализация: загружаем из LocalStorage при старте
  const init = () => {
    const saved = localStorage.getItem('accounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Восстанавливаем поле _rawLabels из массива labels для отображения в инпуте
        accounts.value = parsed.map((acc: Account) => ({
          ...acc,
          _rawLabels: acc.labels.map(l => l.text).join('; ')
        }));
      } catch (e) {
        console.error('Ошибка парсинга LocalStorage', e);
        accounts.value = [];
      }
    }
  };

  // 2. Сохранение: следим за изменениями и пишем в LocalStorage
  watch(accounts, (newVal) => {
    localStorage.setItem('accounts', JSON.stringify(newVal));
  }, { deep: true });

  // Добавить новую запись
  const addAccount = () => {
    accounts.value.push({
      id: Date.now().toString(), // Простой ID
      labels: [],
      _rawLabels: '',
      type: 'Local',
      login: '',
      password: '',
      isLoginValid: true, // Изначально считаем валидным, чтобы не светить красным сразу
      isPasswordValid: true,
      isLabelValid: true
    });
  };

  // Удалить запись
  const removeAccount = (id: string) => {
    accounts.value = accounts.value.filter(acc => acc.id !== id);
  };

  return {
    accounts,
    init,
    addAccount,
    removeAccount
  };
});
