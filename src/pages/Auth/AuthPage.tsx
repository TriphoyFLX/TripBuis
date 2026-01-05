import { useState } from 'react';
import { supabase } from '../../supabaseClient'; // Убедись, что путь правильный
import styles from './authpage.module.css';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(false); // По умолчанию регистрация, как на макете
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    if (isLogin) {
      // Логика Входа
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) alert(error.message);
    } else {
      // Логика Регистрации
      if (password !== confirmPassword) {
        alert('Пароли не совпадают!');
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) alert(error.message);
      else alert('Регистрация успешна! Проверьте почту.');
    }
    setLoading(false);
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) alert(error.message);
  };

  return (
    <div className={styles.container}>
      {/* Левая часть - Картинка */}
      <div className={styles.imageSection}>
        <div className={styles.overlay}>
          <div className={styles.logoBadge}>
            <div className={styles.logoCircle}></div>
            <span>TripBusiness</span>
          </div>
          
          <div className={styles.imageFooter}>
            <span>Попробовать демо</span>
            <div className={styles.arrowIcon}>›</div>
          </div>
        </div>
      </div>

      {/* Правая часть - Форма */}
      <div className={styles.formSection}>
        <div className={styles.formContent}>
          <h2 className={styles.title}>
            {isLogin ? 'С возвращением!' : 'Войдите или зарегистрируйтесь'}
          </h2>

          <div className={styles.inputGroup}>
            <label>Электронная почта</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.passwordRow}>
            <div className={styles.inputGroup}>
              <label>Пароль</label>
              <input
                type="password"
                className={styles.input}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            
            {/* Показываем подтверждение пароля только при регистрации */}
            {!isLogin && (
              <div className={styles.inputGroup}>
                <label>Подтвердите пароль</label>
                <input
                  type="password"
                  className={styles.input}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          <button 
            className={styles.primaryButton} 
            onClick={handleAuth} 
            disabled={loading}
          >
            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>

          <p className={styles.toggleText}>
            {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Зарегистрироваться' : 'Войти'}
            </span>
          </p>

          <div className={styles.divider}>
            <span>или {isLogin ? 'войдите' : 'зарегистрируйтесь'} через</span>
          </div>

          <button className={styles.googleButton} onClick={signInWithGoogle}>
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.489 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.989 -25.464 56.619 L -21.484 53.529 Z" />
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
              </g>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;