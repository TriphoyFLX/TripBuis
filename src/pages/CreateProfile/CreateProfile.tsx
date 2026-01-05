import { useState, FormEvent } from 'react';
import { supabase } from '../../supabaseClient';
import styles from './CreateProfile.module.css';

function CreateProfile() {
  const [username, setUsername] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const createProfile = async (): Promise<void> => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert('Пользователь не найден');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      username,
      full_name: fullName,
    });

    if (error) {
      alert(error.message);
    }

    setLoading(false);
    window.location.reload();
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (username.trim() && fullName.trim()) {
      createProfile();
    }
  };

  const isFormValid: boolean = username.trim().length > 0 && fullName.trim().length > 0;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.appleIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#0A84FF"/>
              <path d="M12 6C9.79 6 8 7.79 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 7.79 14.21 6 12 6ZM12 12C10.9 12 10 11.1 10 10C10 8.9 10.9 8 12 8C13.1 8 14 8.9 14 10C14 11.1 13.1 12 12 12Z" fill="#0A84FF"/>
              <path d="M12 16C10.33 16 6 17.34 6 19V20H18V19C18 17.34 13.67 16 12 16Z" fill="#0A84FF"/>
            </svg>
          </div>
          <h1 className={styles.title}>Создание профиля</h1>
          <p className={styles.subtitle}>Завершите настройку вашего аккаунта</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Никнейм</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Введите ваш никнейм"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Полное имя</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Введите ваше полное имя"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={`${styles.button} ${loading ? styles.loading : ''}`}
            disabled={!isFormValid || loading}
            aria-label={loading ? 'Обработка данных' : 'Продолжить'}
          >
            <span className={styles.buttonText}>
              {loading ? (
                <>
                  <span className={styles.spinner} aria-hidden="true"></span>
                  Обработка...
                </>
              ) : (
                'Продолжить'
              )}
            </span>
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.hint}>Вы сможете изменить эти данные позже в настройках профиля</p>
        </div>
      </div>
    </div>
  );
}

export default CreateProfile;