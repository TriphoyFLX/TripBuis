import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { useSidebar } from './Layout';
import { 
  MessageSquare, Folder, Info, LifeBuoy, 
  ChevronRight, Plus, Trash, FolderPlus,
  FolderOpen, FolderClosed, Edit2, Briefcase, Target, Lightbulb,
  Rocket, Building, Globe, TrendingUp, Users,
  Calendar, FileText, DollarSign, Package, X,
  Search, Menu, LogOut, User
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  created_at: string;
  chat_count?: number;
}

interface Chat {
  id: string;
  title: string;
  created_at: string;
  project_id: string | null;
}

const iconComponents: Record<string, React.ComponentType<any>> = {
  'Folder': Folder,
  'FolderOpen': FolderOpen,
  'FolderClosed': FolderClosed,
  'Briefcase': Briefcase,
  'Target': Target,
  'Lightbulb': Lightbulb,
  'Rocket': Rocket,
  'Building': Building,
  'Globe': Globe,
  'TrendingUp': TrendingUp,
  'Users': Users,
  'Calendar': Calendar,
  'FileText': FileText,
  'DollarSign': DollarSign,
  'Package': Package
};


const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [openChats, setOpenChats] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    color: '#0A84FF',
    icon: 'Folder'
  });
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const iconOptions = [
    'Folder', 'FolderOpen', 'FolderClosed', 'Briefcase', 'Target', 
    'Lightbulb', 'Rocket', 'Building', 'Globe', 'TrendingUp',
    'Users', 'Calendar', 'FileText', 'DollarSign', 'Package'
  ];

  const colorOptions = [
    '#0A84FF', '#30D158', '#FF453A', '#FF9F0A', '#BF5AF2',
    '#FF375F', '#64D2FF', '#5E5CE6', '#32D74B', '#FFD60A'
  ];

  // Определение мобильного режима с debounce
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowMobileMenu(false);
        setShowSearch(false);
      }
    };
    
    checkMobile();
    const handleResize = debounce(checkMobile, 250);
    
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Скрытие хедера при скролле (только для мобильных)
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollDelta = 5; // Минимальная дельта для срабатывания
      
      if (scrollTop > lastScrollTop && scrollTop > 100 && scrollTop - lastScrollTop > scrollDelta) {
        setIsHeaderVisible(false);
      } else if (lastScrollTop - scrollTop > scrollDelta) {
        setIsHeaderVisible(true);
      }
      
      setLastScrollTop(scrollTop <= 0 ? 0 : scrollTop);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, lastScrollTop]);

  // Закрытие меню при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
        if (isMobile) setShowSearch(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  // Закрытие мобильного меню при изменении роута
  useEffect(() => {
    setShowMobileMenu(false);
    setShowSearch(false);
  }, [location.pathname]);

  // Загрузка данных пользователя
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || '');
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);

      await Promise.all([loadChats(), loadProjects()]);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadChats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: chatsData } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      setChats(chatsData || []);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: projectsData } = await supabase
        .from('projects')
        .select(`
          *,
          chats:chats(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const projectsWithCount = projectsData?.map(project => ({
        ...project,
        chat_count: project.chats?.[0]?.count || 0
      })) || [];

      setProjects(projectsWithCount);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  // Оптимизированный поиск с useMemo
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return { filteredChats: [], filteredProjects: [] };
    }

    const query = searchQuery.toLowerCase().trim();
    
    const filteredChats = chats.filter(chat => 
      chat.title?.toLowerCase().includes(query)
    );

    const filteredProjects = projects.filter(project => 
      project.name.toLowerCase().includes(query) ||
      (project.description && project.description.toLowerCase().includes(query))
    );

    return { filteredChats, filteredProjects };
  }, [searchQuery, chats, projects]);

  // Создание нового чата
  const createNewChat = useCallback(async (projectId: string | null = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('chats')
        .insert({ 
          user_id: user.id, 
          title: 'Новый чат',
          project_id: projectId
        })
        .select()
        .single();

      if (error) throw error;

      setChats(prev => [data, ...prev]);
      if (isMobile) {
        setShowMobileMenu(false);
        setShowSearch(false);
      }
      navigate(`/chat/${data.id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Не удалось создать чат');
    }
  }, [navigate, isMobile]);

  // Создание проекта
  const createProject = useCallback(async () => {
    if (!projectForm.name.trim()) {
      alert('Введите название проекта');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: projectForm.name.trim(),
          description: projectForm.description.trim(),
          color: projectForm.color,
          icon: projectForm.icon
        })
        .select()
        .single();

      if (error) throw error;

      setProjects(prev => [{ ...data, chat_count: 0 }, ...prev]);
      setCreatingProject(false);
      setProjectForm({
        name: '',
        description: '',
        color: '#0A84FF',
        icon: 'Folder'
      });
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Не удалось создать проект');
    }
  }, [projectForm]);

  // Обновление проекта
  const updateProject = useCallback(async (projectId: string) => {
    if (!projectForm.name.trim()) {
      alert('Введите название проекта');
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: projectForm.name.trim(),
          description: projectForm.description.trim(),
          color: projectForm.color,
          icon: projectForm.icon,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) throw error;

      await loadProjects();
      setEditingProject(null);
      setProjectForm({
        name: '',
        description: '',
        color: '#0A84FF',
        icon: 'Folder'
      });
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Не удалось обновить проект');
    }
  }, [projectForm, loadProjects]);

  // Удаление проекта
  const deleteProject = useCallback(async (projectId: string) => {
    if (!confirm('Удалить проект? Все чаты будут перемещены в "Все чаты"')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      await supabase
        .from('chats')
        .update({ project_id: null })
        .eq('project_id', projectId);

      await Promise.all([loadProjects(), loadChats()]);
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Не удалось удалить проект');
    }
  }, [loadProjects, loadChats]);

  // Перемещение чата в проект
  const moveChatToProject = useCallback(async (chatId: string, projectId: string | null) => {
    try {
      const { error } = await supabase
        .from('chats')
        .update({ project_id: projectId })
        .eq('id', chatId);

      if (error) throw error;

      await loadChats();
      await loadProjects();
    } catch (error) {
      console.error('Error moving chat:', error);
      alert('Не удалось переместить чат');
    }
  }, [loadChats, loadProjects]);

  // Получение иконки
  const getIconComponent = useCallback((iconName: string) => {
    const IconComponent = iconComponents[iconName] || Folder;
    return <IconComponent size={16} />;
  }, []);

  // Выход из системы
  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }, [navigate]);

  // Фильтрация чатов для выбранного проекта
  const filteredChats = useMemo(() => {
    if (!selectedProject) return chats;
    return chats.filter(chat => chat.project_id === selectedProject);
  }, [chats, selectedProject]);

  // Обработчик закрытия поиска
  const handleCloseSearch = useCallback(() => {
    setSearchQuery('');
    setShowSearchResults(false);
    setShowSearch(false);
  }, []);

  // Мобильный хедер
  const MobileHeader = useMemo(() => (
    <header 
      className={`${styles.mobileHeader} ${!isHeaderVisible ? styles.hidden : ''}`}
      data-visible={isHeaderVisible}
    >
      <div className={styles.mobileHeaderContent}>
        {/* Кнопка меню */}
        <button 
          className={styles.mobileMenuButton}
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-label="Открыть меню"
          aria-expanded={showMobileMenu}
          aria-controls="mobile-menu"
        >
          <Menu size={24} />
        </button>

        {/* Логотип */}
        <div className={styles.mobileLogo} onClick={() => navigate('/')}>
          <div className={styles.circle}>
            <div className={styles.innerCircle} />
          </div>
          <span className={styles.logoText}>TripBusiness</span>
        </div>

        {/* Действия */}
        <div className={styles.mobileActions}>
          {/* Поиск */}
          <div className={styles.mobileSearchWrapper} ref={searchRef}>
            {showSearch ? (
              <div className={styles.searchContainer}>
                <Search size={18} className={styles.searchIcon} />
                <input 
                  type="text" 
                  placeholder="Поиск..." 
                  className={styles.searchInput} 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(e.target.value.length > 0);
                  }}
                  autoFocus
                  aria-label="Поиск чатов и проектов"
                />
                <button 
                  className={styles.clearSearchButton}
                  onClick={handleCloseSearch}
                  aria-label="Закрыть поиск"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button 
                className={styles.mobileSearchButton}
                onClick={() => setShowSearch(true)}
                aria-label="Поиск"
              >
                <Search size={22} />
              </button>
            )}

            {/* Результаты поиска */}
            {showSearchResults && searchQuery.trim() && (
              <div className={styles.mobileSearchResults}>
                <div className={styles.searchResultsContent}>
                  {searchResults.filteredChats.map((chat) => (
                    <button
                      key={chat.id}
                      className={styles.searchResultItem}
                      onClick={() => {
                        navigate(`/chat/${chat.id}`);
                        handleCloseSearch();
                      }}
                    >
                      <div className={styles.searchResultIcon}>
                        <MessageSquare size={16} />
                      </div>
                      <div className={styles.searchResultContent}>
                        <div className={styles.searchResultTitle}>
                          {chat.title || 'Без названия'}
                        </div>
                        <div className={styles.searchResultType}>Чат</div>
                      </div>
                    </button>
                  ))}
                  
                  {searchResults.filteredProjects.map((project) => (
                    <button
                      key={project.id}
                      className={styles.searchResultItem}
                      onClick={() => {
                        setSelectedProject(project.id);
                        handleCloseSearch();
                        setShowMobileMenu(true);
                      }}
                    >
                      <div 
                        className={styles.searchResultIcon}
                        style={{ color: project.color, backgroundColor: `${project.color}20` }}
                      >
                        {getIconComponent(project.icon)}
                      </div>
                      <div className={styles.searchResultContent}>
                        <div className={styles.searchResultTitle}>{project.name}</div>
                        <div className={styles.searchResultDescription}>
                          {project.description || 'Без описания'}
                        </div>
                        <div className={styles.searchResultType}>
                          Проект • {project.chat_count || 0} чатов
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {searchResults.filteredChats.length === 0 && 
                   searchResults.filteredProjects.length === 0 && (
                    <div className={styles.noResults}>
                      <p>Ничего не найдено</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Кнопка нового чата */}
          <button 
            className={styles.mobileNewChatButton}
            onClick={() => createNewChat(null)}
            aria-label="Новый чат"
          >
            <Plus size={24} />
          </button>

          {/* Профиль */}
          {profile && (
            <button 
              className={styles.mobileProfileButton}
              onClick={() => navigate('/profile')}
              aria-label="Профиль"
            >
              <div className={styles.userAvatar}>
                {profile.username?.[0]?.toUpperCase()}
              </div>
            </button>
          )}
        </div>
      </div>
    </header>
  ), [
    isHeaderVisible, showMobileMenu, showSearch, searchQuery, searchResults,
    profile, navigate, createNewChat, getIconComponent, handleCloseSearch
  ]);

  // Мобильное меню
  const MobileMenu = useMemo(() => (
    <>
      <div 
        className={`${styles.mobileMenuOverlay} ${showMobileMenu ? styles.active : ''}`}
        onClick={() => setShowMobileMenu(false)}
        aria-hidden="true"
      />
      <div 
        ref={mobileMenuRef}
        id="mobile-menu"
        className={`${styles.mobileMenu} ${showMobileMenu ? styles.active : ''}`}
        aria-hidden={!showMobileMenu}
      >
        <div className={styles.mobileMenuHeader}>
          <div className={styles.mobileMenuLogo}>
            <div className={styles.circle}>
              <div className={styles.innerCircle} />
            </div>
            <span className={styles.logoText}>TripBusiness</span>
          </div>
          <button 
            className={styles.mobileMenuClose}
            onClick={() => setShowMobileMenu(false)}
            aria-label="Закрыть меню"
          >
            <X size={24} />
          </button>
        </div>

        <div className={styles.mobileMenuContent}>
          {/* Быстрые действия */}
          <div className={styles.mobileQuickActions}>
            <button 
              className={styles.mobileQuickButton}
              onClick={() => {
                createNewChat(null);
                setShowMobileMenu(false);
              }}
            >
              <div className={styles.quickButtonIcon}>
                <Plus size={20} />
              </div>
              <div className={styles.quickButtonText}>
                <div className={styles.quickButtonTitle}>Новый чат</div>
                <div className={styles.quickButtonSubtitle}>Создать беседу</div>
              </div>
            </button>
            
            <button 
              className={styles.mobileQuickButton}
              onClick={() => {
                setCreatingProject(true);
                setShowMobileMenu(false);
              }}
            >
              <div className={styles.quickButtonIcon} style={{ color: '#30D158' }}>
                <FolderPlus size={20} />
              </div>
              <div className={styles.quickButtonText}>
                <div className={styles.quickButtonTitle}>Новый проект</div>
                <div className={styles.quickButtonSubtitle}>Организовать чаты</div>
              </div>
            </button>
          </div>

          {/* Чаты */}
          <div className={styles.mobileSection}>
            <h3 className={styles.mobileSectionTitle}>
              <MessageSquare size={18} />
              Чаты ({chats.length})
            </h3>
            <div className={styles.mobileChatList}>
              {isLoading ? (
                <div className={styles.loadingIndicator}>
                  <div className={styles.loadingDot} />
                  <div className={styles.loadingDot} />
                  <div className={styles.loadingDot} />
                </div>
              ) : (
                <>
                  {chats.slice(0, 5).map((chat) => (
                    <button
                      key={chat.id}
                      className={styles.mobileChatItem}
                      onClick={() => {
                        navigate(`/chat/${chat.id}`);
                        setShowMobileMenu(false);
                      }}
                    >
                      <div className={styles.mobileChatIcon}>
                        <MessageSquare size={16} />
                      </div>
                      <div className={styles.mobileChatContent}>
                        <div className={styles.mobileChatTitle}>
                          {chat.title || 'Без названия'}
                        </div>
                        <div className={styles.mobileChatDate}>
                          {new Date(chat.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {chats.length > 5 && (
                    <button 
                      className={styles.mobileShowMore}
                      onClick={() => navigate('/chats')}
                    >
                      Показать все чаты
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Проекты */}
          <div className={styles.mobileSection}>
            <h3 className={styles.mobileSectionTitle}>
              <Folder size={18} />
              Проекты ({projects.length})
            </h3>
            <div className={styles.mobileProjectList}>
              {isLoading ? (
                <div className={styles.loadingIndicator}>
                  <div className={styles.loadingDot} />
                  <div className={styles.loadingDot} />
                  <div className={styles.loadingDot} />
                </div>
              ) : (
                projects.map((project) => (
                  <button
                    key={project.id}
                    className={styles.mobileProjectItem}
                    onClick={() => {
                      setSelectedProject(project.id);
                      setShowMobileMenu(false);
                    }}
                  >
                    <div 
                      className={styles.mobileProjectIcon}
                      style={{ 
                        color: project.color,
                        backgroundColor: `${project.color}20`
                      }}
                    >
                      {getIconComponent(project.icon)}
                    </div>
                    <div className={styles.mobileProjectContent}>
                      <div className={styles.mobileProjectName}>{project.name}</div>
                      <div className={styles.mobileProjectMeta}>
                        <span className={styles.mobileProjectCount}>
                          {project.chat_count || 0} чатов
                        </span>
                        <span className={styles.mobileProjectDate}>
                          {new Date(project.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={16} className={styles.mobileProjectArrow} />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Сервис */}
          <div className={styles.mobileSection}>
            <h3 className={styles.mobileSectionTitle}>Сервис</h3>
            <div className={styles.mobileServiceList}>
              <button 
                className={styles.mobileServiceItem}
                onClick={() => navigate('/about')}
              >
                <Info size={18} />
                <span>О проекте</span>
              </button>
              <button 
                className={styles.mobileServiceItem}
                onClick={() => navigate('/support')}
              >
                <LifeBuoy size={18} />
                <span>Поддержка</span>
              </button>
            </div>
          </div>

          {/* Профиль */}
          {profile && (
            <div className={styles.mobileProfileSection}>
              <div className={styles.mobileProfileInfo}>
                <div className={styles.userAvatar}>
                  {profile.username?.[0]?.toUpperCase()}
                </div>
                <div className={styles.mobileProfileDetails}>
                  <div className={styles.userName}>{profile.full_name || profile.username}</div>
                  <div className={styles.userEmail}>{email}</div>
                </div>
              </div>
              <div className={styles.mobileProfileActions}>
                <button 
                  className={styles.mobileProfileAction}
                  onClick={() => {
                    navigate('/profile');
                    setShowMobileMenu(false);
                  }}
                >
                  <User size={16} />
                  Профиль
                </button>
                <button 
                  className={styles.mobileLogoutAction}
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Выйти
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  ), [
    showMobileMenu, isLoading, chats, projects, profile, email,
    navigate, createNewChat, getIconComponent, handleLogout
  ]);

  // Десктопный сайдбар
  const DesktopSidebar = useMemo(() => (
    <aside 
      ref={sidebarRef}
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}
      aria-label="Боковая панель"
    >
      

      {/* Логотип */}
      <div className={styles.logoContainer}>
        <button className={styles.logo} onClick={() => navigate('/')}>
          <div className={styles.circle}>
            <div className={styles.innerCircle} />
          </div>
          {!isCollapsed && <span className={styles.logoText}>TripBusiness.com</span>}
        </button>
      </div>

      <div className={styles.sidebarContent}>
        {/* Поиск */}
        <div className={styles.searchWrapper} ref={searchRef}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Поиск чатов и проектов..." 
              className={styles.searchInput} 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(e.target.value.length > 0);
              }}
              onFocus={() => {
                if (searchQuery.length > 0) setShowSearchResults(true);
              }}
              aria-label="Поиск чатов и проектов"
            />
            {searchQuery && (
              <button 
                className={styles.clearSearchButton}
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                aria-label="Очистить поиск"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Результаты поиска */}
          {showSearchResults && searchQuery.trim() && (
            <div className={styles.searchResults} role="dialog" aria-label="Результаты поиска">
              <div className={styles.searchResultsContent}>
                {searchResults.filteredChats.length > 0 && (
                  <div className={styles.searchResultsSection}>
                    <h4 className={styles.searchResultsTitle}>
                      <MessageSquare size={14} />
                      Чаты ({searchResults.filteredChats.length})
                    </h4>
                    <div className={styles.searchResultsList}>
                      {searchResults.filteredChats.map((chat) => (
                        <button
                          key={chat.id}
                          className={styles.searchResultItem}
                          onClick={() => {
                            navigate(`/chat/${chat.id}`);
                            setSearchQuery('');
                            setShowSearchResults(false);
                          }}
                        >
                          <div className={styles.searchResultIcon}>
                            <MessageSquare size={14} />
                          </div>
                          <div className={styles.searchResultContent}>
                            <div className={styles.searchResultTitle}>
                              {chat.title || 'Без названия'}
                            </div>
                            <div className={styles.searchResultType}>
                              Чат
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.filteredProjects.length > 0 && (
                  <div className={styles.searchResultsSection}>
                    <h4 className={styles.searchResultsTitle}>
                      <Folder size={14} />
                      Проекты ({searchResults.filteredProjects.length})
                    </h4>
                    <div className={styles.searchResultsList}>
                      {searchResults.filteredProjects.map((project) => (
                        <button
                          key={project.id}
                          className={styles.searchResultItem}
                          onClick={() => {
                            setSelectedProject(project.id);
                            setSearchQuery('');
                            setShowSearchResults(false);
                            setOpenChats(false);
                          }}
                        >
                          <div 
                            className={styles.searchResultIcon}
                            style={{ color: project.color }}
                          >
                            {getIconComponent(project.icon)}
                          </div>
                          <div className={styles.searchResultContent}>
                            <div className={styles.searchResultTitle}>
                              {project.name}
                            </div>
                            <div className={styles.searchResultDescription}>
                              {project.description || 'Без описания'}
                            </div>
                            <div className={styles.searchResultType}>
                              Проект • {project.chat_count || 0} чатов
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.filteredChats.length === 0 && 
                 searchResults.filteredProjects.length === 0 && (
                  <div className={styles.noResults}>
                    <p>Ничего не найдено по запросу "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ВСЕ ЧАТЫ */}
        {!showSearchResults && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              {!isCollapsed && <p className={styles.sectionTitle}>Чаты</p>}
              <button 
                className={styles.newChatButton} 
                onClick={() => createNewChat(null)}
                title="Новый чат"
                aria-label="Создать новый чат"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Все чаты (без проекта) */}
            <button
              className={`${styles.navItem} ${selectedProject === null ? styles.selected : ''}`}
              onClick={() => {
                if (!isCollapsed) {
                  setSelectedProject(null);
                  setOpenChats(!openChats);
                }
              }}
              title={isCollapsed ? "Все чаты" : undefined}
              aria-expanded={openChats && selectedProject === null}
            >
              <div className={styles.navLeft}>
                <MessageSquare size={18} /> 
                {!isCollapsed && `Все чаты (${chats.length})`}
              </div>
              {!isCollapsed && (
                <ChevronRight 
                  size={16} 
                  className={`${styles.chevron} ${openChats ? styles.rotated : ''}`}
                />
              )}
            </button>

            {!isCollapsed && selectedProject === null && openChats && (
              <div className={styles.chatList}>
                {isLoading ? (
                  <div className={styles.loadingIndicator}>
                    <div className={styles.loadingDot} />
                    <div className={styles.loadingDot} />
                    <div className={styles.loadingDot} />
                  </div>
                ) : filteredChats.length > 0 ? (
                  filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={styles.chatListItem}
                      onClick={() => navigate(`/chat/${chat.id}`)}
                    >
                      <div className={styles.chatTitle}>
                        {chat.title || 'Без названия'}
                      </div>
                      <div className={styles.chatActions}>
                        <select
                          className={styles.projectSelect}
                          value={chat.project_id || ''}
                          onChange={(e) => moveChatToProject(chat.id, e.target.value || null)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Переместить чат в проект"
                        >
                          <option value="">Без проекта</option>
                          {projects.map(project => (
                            <option key={project.id} value={project.id}>
                              {project.name}
                            </option>
                          ))}
                        </select>
                        <button
                          className={styles.deleteButton}
                          onClick={async (e) => {
                            e.stopPropagation();
                            const { error } = await supabase
                              .from('chats')
                              .delete()
                              .eq('id', chat.id);
                            
                            if (error) {
                              alert(error.message);
                              return;
                            }
                            
                            setChats(prev => prev.filter(c => c.id !== chat.id));
                          }}
                          title="Удалить чат"
                          aria-label="Удалить чат"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>
                      <MessageSquare size={24} />
                    </div>
                    <p>Нет чатов</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ПРОЕКТЫ */}
        {!showSearchResults && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              {!isCollapsed && <p className={styles.sectionTitle}>Проекты</p>}
              <button 
                className={styles.newProjectButton}
                onClick={() => setCreatingProject(true)}
                title="Новый проект"
                aria-label="Создать новый проект"
              >
                <FolderPlus size={16} />
              </button>
            </div>

            {/* Создание нового проекта */}
            {!isCollapsed && creatingProject && (
              <div className={styles.projectForm} role="dialog" aria-label="Создание проекта">
                <div className={styles.formHeader}>
                  <h4>Новый проект</h4>
                  <button 
                    className={styles.closeButton}
                    onClick={() => setCreatingProject(false)}
                    aria-label="Закрыть форму"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <input
                  type="text"
                  placeholder="Название проекта"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                  className={styles.formInput}
                  autoFocus
                  aria-label="Название проекта"
                />
                
                <textarea
                  placeholder="Описание (необязательно)"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                  className={styles.formTextarea}
                  rows={2}
                  aria-label="Описание проекта"
                />
                
                <div className={styles.iconSelector}>
                  <label>Иконка:</label>
                  <div className={styles.iconGrid}>
                    {iconOptions.map(icon => (
                      <button
                        key={icon}
                        className={`${styles.iconOption} ${projectForm.icon === icon ? styles.selectedIcon : ''}`}
                        onClick={() => setProjectForm({...projectForm, icon})}
                        type="button"
                        aria-label={`Иконка ${icon}`}
                        aria-pressed={projectForm.icon === icon}
                      >
                        {getIconComponent(icon)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className={styles.colorSelector}>
                  <label>Цвет:</label>
                  <div className={styles.colorGrid}>
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        className={`${styles.colorOption} ${projectForm.color === color ? styles.selectedColor : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setProjectForm({...projectForm, color})}
                        type="button"
                        aria-label={`Цвет ${color}`}
                        aria-pressed={projectForm.color === color}
                      />
                    ))}
                  </div>
                </div>
                
                <div className={styles.formActions}>
                  <button 
                    className={styles.cancelButton}
                    onClick={() => setCreatingProject(false)}
                  >
                    Отмена
                  </button>
                  <button 
                    className={styles.saveButton}
                    onClick={createProject}
                  >
                    Создать
                  </button>
                </div>
              </div>
            )}

            {/* Список проектов */}
            {isLoading && projects.length === 0 ? (
              <div className={styles.loadingIndicator}>
                <div className={styles.loadingDot} />
                <div className={styles.loadingDot} />
                <div className={styles.loadingDot} />
              </div>
            ) : (
              projects.map((project) => (
                <div key={project.id}>
                  {/* Заголовок проекта */}
                  <button
                    className={`${styles.projectHeader} ${selectedProject === project.id ? styles.selected : ''}`}
                    onClick={() => {
                      if (!isCollapsed) {
                        setSelectedProject(selectedProject === project.id ? null : project.id);
                      }
                    }}
                    title={isCollapsed ? project.name : undefined}
                    aria-expanded={selectedProject === project.id}
                  >
                    <div className={styles.projectLeft}>
                      <div 
                        className={styles.projectIcon}
                        style={{ color: project.color }}
                      >
                        {getIconComponent(project.icon)}
                      </div>
                      {!isCollapsed && (
                        <div className={styles.projectInfo}>
                          <span className={styles.projectName}>{project.name}</span>
                          <span className={styles.projectCount}>
                            {project.chat_count || 0} чатов
                          </span>
                        </div>
                      )}
                    </div>
                    {!isCollapsed && (
                      <div className={styles.projectActions}>
                        <button
                          className={styles.projectAction}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingProject(project.id);
                            setProjectForm({
                              name: project.name,
                              description: project.description || '',
                              color: project.color,
                              icon: project.icon
                            });
                          }}
                          title="Редактировать"
                          aria-label="Редактировать проект"
                        >
                          <Edit2 size={14} />
                        </button>
                        <ChevronRight 
                          size={16} 
                          className={`${styles.chevron} ${selectedProject === project.id ? styles.rotated : ''}`}
                        />
                      </div>
                    )}
                  </button>

                  {/* Редактирование проекта */}
                  {!isCollapsed && editingProject === project.id && (
                    <div className={styles.projectForm} role="dialog" aria-label="Редактирование проекта">
                      <div className={styles.formHeader}>
                        <h4>Редактировать проект</h4>
                        <button 
                          className={styles.closeButton}
                          onClick={() => setEditingProject(null)}
                          aria-label="Закрыть форму"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      <input
                        type="text"
                        placeholder="Название проекта"
                        value={projectForm.name}
                        onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                        className={styles.formInput}
                        autoFocus
                        aria-label="Название проекта"
                      />
                      
                      <textarea
                        placeholder="Описание"
                        value={projectForm.description}
                        onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                        className={styles.formTextarea}
                        rows={2}
                        aria-label="Описание проекта"
                      />
                      
                      <div className={styles.iconSelector}>
                        <label>Иконка:</label>
                        <div className={styles.iconGrid}>
                          {iconOptions.map(icon => (
                            <button
                              key={icon}
                              className={`${styles.iconOption} ${projectForm.icon === icon ? styles.selectedIcon : ''}`}
                              onClick={() => setProjectForm({...projectForm, icon})}
                              type="button"
                              aria-label={`Иконка ${icon}`}
                              aria-pressed={projectForm.icon === icon}
                            >
                              {getIconComponent(icon)}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className={styles.colorSelector}>
                        <label>Цвет:</label>
                        <div className={styles.colorGrid}>
                          {colorOptions.map(color => (
                            <button
                              key={color}
                              className={`${styles.colorOption} ${projectForm.color === color ? styles.selectedColor : ''}`}
                              style={{ backgroundColor: color }}
                              onClick={() => setProjectForm({...projectForm, color})}
                              type="button"
                              aria-label={`Цвет ${color}`}
                              aria-pressed={projectForm.color === color}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className={styles.formActions}>
                        <button 
                          className={styles.deleteProjectButton}
                          onClick={() => {
                            if (confirm('Удалить проект?')) {
                              deleteProject(project.id);
                            }
                          }}
                        >
                          Удалить
                        </button>
                        <button 
                          className={styles.cancelButton}
                          onClick={() => setEditingProject(null)}
                        >
                          Отмена
                        </button>
                        <button 
                          className={styles.saveButton}
                          onClick={() => updateProject(project.id)}
                        >
                          Сохранить
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Чатлист внутри проекта */}
                  {!isCollapsed && selectedProject === project.id && (
                    <div className={styles.projectChatList}>
                      <div className={styles.projectChatListHeader}>
                        <span>Чаты проекта</span>
                        <button
                          className={styles.addToProjectButton}
                          onClick={() => createNewChat(project.id)}
                          title="Добавить чат в проект"
                          aria-label="Добавить чат в проект"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      {isLoading ? (
                        <div className={styles.loadingIndicator}>
                          <div className={styles.loadingDot} />
                          <div className={styles.loadingDot} />
                          <div className={styles.loadingDot} />
                        </div>
                      ) : filteredChats.length > 0 ? (
                        filteredChats.map((chat) => (
                          <div
                            key={chat.id}
                            className={styles.chatListItem}
                            onClick={() => navigate(`/chat/${chat.id}`)}
                          >
                            <div className={styles.chatTitle}>
                              {chat.title || 'Без названия'}
                            </div>
                            <button
                              className={styles.deleteButton}
                              onClick={async (e) => {
                                e.stopPropagation();
                                const { error } = await supabase
                                  .from('chats')
                                  .delete()
                                  .eq('id', chat.id);
                                
                                if (error) {
                                  alert(error.message);
                                  return;
                                }
                                
                                setChats(prev => prev.filter(c => c.id !== chat.id));
                              }}
                              title="Удалить чат"
                              aria-label="Удалить чат"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className={styles.emptyProject}>
                          <p>Нет чатов в проекте</p>
                          <button
                            className={styles.emptyButton}
                            onClick={() => createNewChat(project.id)}
                          >
                            Создать первый чат
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* СЕРВИС */}
        {!showSearchResults && (
          <div className={styles.section}>
            {!isCollapsed && <p className={styles.sectionTitle}>Сервис</p>}
            <button 
              className={styles.navItem} 
              title={isCollapsed ? "О проекте" : undefined}
              onClick={() => navigate('/about')}
            >
              <div className={styles.navLeft}>
                <Info size={18} /> 
                {!isCollapsed && "О проекте"}
              </div>
              {!isCollapsed && <ChevronRight size={16} className={styles.chevron} />}
            </button>

            <button 
              className={styles.navItem} 
              title={isCollapsed ? "Поддержка" : undefined}
              onClick={() => navigate('/support')}
            >
              <div className={styles.navLeft}>
                <LifeBuoy size={18} /> 
                {!isCollapsed && "Поддержка"}
              </div>
              {!isCollapsed && <ChevronRight size={16} className={styles.chevron} />}
            </button>
          </div>
        )}
      </div>

      {/* ПРОФИЛЬ */}
      {profile && (
        <button 
          className={styles.userProfile} 
          onClick={() => navigate('/profile')}
          title={isCollapsed ? "Профиль" : undefined}
          aria-label="Профиль пользователя"
        >
          <div className={styles.userAvatar}>{profile.username?.[0]?.toUpperCase()}</div>
          {!isCollapsed && (
            <div className={styles.userInfo}>
              <div className={styles.userName}>{profile.full_name || profile.username}</div>
              <div className={styles.userEmail}>{email}</div>
            </div>
          )}
        </button>
      )}
    </aside>
  ), [
    isCollapsed, searchQuery, showSearchResults, searchResults, isLoading,
    chats, projects, filteredChats, profile, email, navigate, createNewChat,
    getIconComponent, moveChatToProject, createProject, updateProject,
    deleteProject, selectedProject, openChats, creatingProject,
    editingProject, projectForm, setProjectForm, setEditingProject,
    setCreatingProject, setSelectedProject, setOpenChats, setIsCollapsed
  ]);

  // Модалка для создания проекта (мобильная)
  const CreateProjectModal = useMemo(() => {
    if (!creatingProject || !isMobile) return null;

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent} role="dialog" aria-label="Создание проекта">
          <div className={styles.modalHeader}>
            <h3>Новый проект</h3>
            <button 
              className={styles.modalClose}
              onClick={() => setCreatingProject(false)}
              aria-label="Закрыть"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className={styles.modalBody}>
            <input
              type="text"
              placeholder="Название проекта"
              value={projectForm.name}
              onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
              className={styles.modalInput}
              autoFocus
              aria-label="Название проекта"
            />
            
            <textarea
              placeholder="Описание (необязательно)"
              value={projectForm.description}
              onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
              className={styles.modalTextarea}
              rows={3}
              aria-label="Описание проекта"
            />
            
            <div className={styles.modalSection}>
              <label className={styles.modalLabel}>Иконка</label>
              <div className={styles.modalIconGrid}>
                {iconOptions.map(icon => (
                  <button
                    key={icon}
                    className={`${styles.modalIconOption} ${projectForm.icon === icon ? styles.selected : ''}`}
                    onClick={() => setProjectForm({...projectForm, icon})}
                    type="button"
                    aria-label={`Иконка ${icon}`}
                    aria-pressed={projectForm.icon === icon}
                  >
                    {getIconComponent(icon)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className={styles.modalSection}>
              <label className={styles.modalLabel}>Цвет</label>
              <div className={styles.modalColorGrid}>
                {colorOptions.map(color => (
                  <button
                    key={color}
                    className={`${styles.modalColorOption} ${projectForm.color === color ? styles.selected : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setProjectForm({...projectForm, color})}
                    type="button"
                    aria-label={`Цвет ${color}`}
                    aria-pressed={projectForm.color === color}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className={styles.modalFooter}>
            <button 
              className={styles.modalCancelButton}
              onClick={() => setCreatingProject(false)}
            >
              Отмена
            </button>
            <button 
              className={styles.modalSaveButton}
              onClick={createProject}
              disabled={!projectForm.name.trim()}
            >
              Создать
            </button>
          </div>
        </div>
      </div>
    );
  }, [creatingProject, isMobile, projectForm, getIconComponent, createProject]);

  return (
    <>
      {isMobile ? (
        <>
          {MobileHeader}
          {MobileMenu}
          {CreateProjectModal}
        </>
      ) : (
        DesktopSidebar
      )}
    </>
  );
};

export default Sidebar;