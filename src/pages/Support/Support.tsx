import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  Clock, 
  CheckCircle,
  HelpCircle,
  Shield,
  Zap,
  ArrowRight,
  ExternalLink,
  Users,
  Globe
} from 'lucide-react';
import styles from './Support.module.css';

function Support() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleContactTelegram = () => {
    window.open('https://t.me/triphoyprod', '_blank', 'noopener,noreferrer');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const supportFeatures = [
    {
      icon: <Zap />,
      title: "Мгновенная поддержка",
      description: "Получите ответ в течение 5-15 минут в рабочее время"
    },
    {
      icon: <Users />,
      title: "Персональный подход",
      description: "Основатель проекта ответит вам лично"
    },
    {
      icon: <Globe />,
      title: "24/7 доступность",
      description: "Помощь в любое время суток"
    }
  ];

  return (
    <div className={`${styles.container} ${isVisible ? styles.visible : ''}`}>
      {/* Hero Section */}
      <section className={styles.hero}>
        
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Shield size={16} />
            <span>Поддержка пользователей</span>
          </div>
          
          <h1 className={styles.heroTitle}>
            Мы здесь, чтобы <span className={styles.gradientText}>помочь</span>
          </h1>
          
          <p className={styles.heroSubtitle}>
            Основатель проекта лично отвечает на все вопросы. 
            Получите мгновенную помощь прямо в Telegram и продолжите строить бизнес без остановок.
          </p>
          
          <div className={styles.contactCard}>
            <div className={styles.contactHeader}>
              <div className={styles.contactAvatar}>
                <span>TP</span>
              </div>
              <div className={styles.contactInfo}>
                <h3>@triphoyprod</h3>
                <p>Основатель TripBusiness</p>
              </div>
            </div>
            
            <div className={styles.contactStats}>
              <div className={styles.stat}>
                <Clock size={16} />
                <span>Ответ за 5-15 минут</span>
              </div>
              <div className={styles.stat}>
                <CheckCircle size={16} />
                <span>Личные консультации</span>
              </div>
            </div>
            
            <button 
              className={styles.telegramButton}
              onClick={handleContactTelegram}
            >
              <MessageCircle size={20} />
              <span>Написать в Telegram</span>
              <ExternalLink size={16} />
            </button>
            
            <div className={styles.contactHint}>
              <HelpCircle size={14} />
              <span>Нажмите кнопку выше или сохраните контакт @triphoyprod</span>
            </div>
          </div>
        </div>
        
        <div className={styles.heroVisual}>
          <div className={styles.supportGlow} />
          <div className={styles.supportOrbit}>
            <div className={styles.orbitMessage}>
              <MessageCircle size={20} />
            </div>
            <div className={styles.orbitShield}>
              <Shield size={20} />
            </div>
            <div className={styles.orbitCheck}>
              <CheckCircle size={20} />
            </div>
            <div className={styles.orbitCenter}>
              <Users size={32} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Почему наша поддержка — <span className={styles.gradientText}>особенная</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            Не просто техподдержка, а стратегический партнёр на пути к вашему успеху
          </p>
        </div>
        
        <div className={styles.featuresGrid}>
          {supportFeatures.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                {feature.icon}
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>   

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>
              Вернуться к <span className={styles.gradientText}>строительству бизнеса</span>
            </h2>
            <p className={styles.ctaText}>
              Получили помощь? Возвращайтесь к своему AI-партнёру и продолжайте двигаться к целям
            </p>
            
            <div className={styles.ctaButtons}>
              <button 
                className={styles.primaryButton}
                onClick={handleGoHome}
              >
                <span>Вернуться к AI-ассистенту</span>
                <ArrowRight className={styles.buttonIcon} />
              </button>
              
              <button 
                className={styles.secondaryButton}
                onClick={handleContactTelegram}
              >
                <MessageCircle size={18} />
                <span>Ещё вопрос в Telegram</span>
              </button>
            </div>
            
            <div className={styles.ctaNote}>
              <Shield size={16} />
              <p>
                Помните: основатель @triphoyprod всегда на связи для решения самых сложных задач.
                Не стесняйтесь обращаться за помощью — мы здесь, чтобы ваш бизнес рос.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Support;