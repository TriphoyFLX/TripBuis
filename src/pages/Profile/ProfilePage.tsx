import { useEffect, useState, ChangeEvent } from 'react';
import { supabase } from '../../supabaseClient';
import styles from './ProfilePage.module.css';
import { 
  FiLogOut, 
  FiCamera, 
  FiSave, 
  FiX, 
  FiEdit2, 
  FiUser, 
  FiMail, 
  FiAtSign 
} from 'react-icons/fi';
import { 
  HiOutlineCalendar, 
  HiOutlineChat,
  HiOutlineFolder
} from 'react-icons/hi';

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  updated_at: string;
}

interface FormData {
  full_name: string;
  username: string;
}

interface Stats {
  joined: string;
  chats: number;
  projects: number;
}

function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    username: '',
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<Stats>({
    joined: '2024',
    chats: 0,
    projects: 0
  });

  useEffect(() => {
    loadProfile();
    loadUserStats();
  }, []);

  const loadProfile = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) return;

      setEmail(user.email || '');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        username: data.username || '',
      });
      
      if (data.avatar_url) {
        await downloadImage(data.avatar_url);
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserStats = async (): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Загружаем количество чатов
      const { count: chatsCount } = await supabase
        .from('chats')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Загружаем количество проектов
      const { count: projectsCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Получаем дату регистрации из created_at пользователя
      const { data: authData } = await supabase.auth.getUser();
      const joinedYear = authData.user?.created_at 
        ? new Date(authData.user.created_at).getFullYear().toString()
        : new Date().getFullYear().toString();

      setStats({
        joined: joinedYear,
        chats: chatsCount || 0,
        projects: projectsCount || 0
      });
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  const downloadImage = async (path: string): Promise<void> => {
    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .download(path);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      setAvatarUrl(url);
    } catch (error) {
      console.error('Ошибка загрузки аватара:', error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Пользователь не найден');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...formData } : null);
      setIsEditing(false);
      
      // Показать уведомление об успехе
      showNotification('Профиль успешно обновлен!', 'success');
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      showNotification('Ошибка обновления профиля', 'error');
    }
  };

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Выберите файл для загрузки.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Пользователь не найден');
      
      // Загружаем файл в storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Обновляем ссылку на аватар в профиле
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Обновляем отображение аватара
      await downloadImage(filePath);
      showNotification('Аватар успешно обновлен!', 'success');
    } catch (error) {
      console.error('Ошибка загрузки аватара:', error);
      showNotification('Ошибка загрузки аватара', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Перенаправляем на главную страницу
      window.location.href = '/';
    } catch (error) {
      console.error('Ошибка выхода:', error);
      showNotification('Ошибка при выходе', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error'): void => {
    // Создаем временное уведомление
    const notification = document.createElement('div');
    notification.className = `${styles.notification} ${type === 'error' ? styles.error : ''}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out forwards';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Загрузка профиля...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.errorContainer}>
        <h2>Профиль не найден</h2>
        <p>Попробуйте перезагрузить страницу</p>
        <button 
          onClick={() => window.location.reload()}
          className={styles.retryBtn}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.profileContainer} ${styles.container}`}>
      <div className={styles.profileHeader}>
        {/* Заголовок можно оставить или убрать, в зависимости от дизайна */}
      </div>

      <div className={styles.profileCard}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarContainer}>
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Аватар" 
                className={styles.avatar}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const placeholder = e.currentTarget.nextElementSibling as HTMLDivElement;
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
            ) : null}
            {!avatarUrl && (
              <div className={styles.avatarPlaceholder}>
                {profile.full_name?.charAt(0) || 'U'}
              </div>
            )}
            <div className={styles.avatarOverlay}>
              <label htmlFor="avatar-upload" className={styles.avatarUploadLabel}>
                <FiCamera size={16} /> {uploading ? 'Загрузка...' : 'Изменить'}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>

        <div className={styles.profileInfo}>
          {isEditing ? (
            <div className={styles.editForm}>
              <div className={styles.formGroup}>
                <label htmlFor="full_name">
                  <FiUser size={18} /> Имя
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Введите ваше имя"
                  autoFocus
                  maxLength={50}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="username">
                  <FiAtSign size={18} /> Никнейм
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Введите ваш никнейм"
                  maxLength={30}
                />
              </div>

              <div className={styles.formActions}>
                <button 
                  onClick={handleSaveProfile}
                  className={styles.saveBtn}
                  disabled={!formData.full_name.trim()}
                >
                  <FiSave size={18} /> Сохранить
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className={styles.cancelBtn}
                >
                  <FiX size={18} /> Отмена
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.infoRow}>
                <span className={styles.label}>
                  <FiUser size={18} /> Имя
                </span>
                <span className={styles.value}>{profile.full_name || 'Не указано'}</span>
              </div>
              
              <div className={styles.infoRow}>
                <span className={styles.label}>
                  <FiAtSign size={18} /> Никнейм
                </span>
                <span className={styles.value}>{profile.username || 'Не указан'}</span>
              </div>
              
              <div className={styles.infoRow}>
                <span className={styles.label}>
                  <FiMail size={18} /> Email
                </span>
                <span className={styles.value}>{email}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>Обновлен</span>
                <span className={styles.value}>{formatDate(profile.updated_at)}</span>
              </div>

              <button 
                onClick={() => setIsEditing(true)}
                className={styles.editBtn}
              >
                <FiEdit2 size={18} /> Редактировать профиль
              </button>
            </>
          )}
        </div>

        <div className={styles.profileStats}>
          <div className={styles.statItem}>
            <HiOutlineCalendar size={24} className={styles.statIcon} />
            <div className={styles.statValue}>{stats.joined}</div>
            <div className={styles.statLabel}>Год регистрации</div>
          </div>
          <div className={styles.statItem}>
            <HiOutlineChat size={24} className={styles.statIcon} />
            <div className={styles.statValue}>{stats.chats}</div>
            <div className={styles.statLabel}>Чатов</div>
          </div>
          <div className={styles.statItem}>
            <HiOutlineFolder size={24} className={styles.statIcon} />
            <div className={styles.statValue}>{stats.projects}</div>
            <div className={styles.statLabel}>Проектов</div>
          </div>
        </div>
        
        <button 
          onClick={handleSignOut}
          className={styles.logoutBtn}
        >
          <FiLogOut size={18} /> Выйти
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;