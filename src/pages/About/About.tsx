import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { 
  Sparkles, 
  Target, 
  TrendingUp, 
  Rocket, 
  Users, 
  Shield,
  Lightbulb,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import styles from './About.module.css';

function About() {
  const [activeCapability, setActiveCapability] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate(); 
   const handleStartJourney = () => {
    navigate('/'); 
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const capabilities = [
    {
      icon: <Lightbulb />,
      title: "Генерация бизнес-идей",
      description: "AI анализирует тренды, ваши навыки и интересы, чтобы предложить уникальные бизнес-концепции с высоким потенциалом роста."
    },
    {
      icon: <Target />,
      title: "Анализ рынка и стратегия",
      description: "Полный анализ конкурентов, целевой аудитории и рыночных возможностей. Создание пошаговой стратегии выхода на рынок."
    },
    {
      icon: <Rocket />,
      title: "Запуск и масштабирование",
      description: "От MVP до глобального бренда. AI помогает с продуктом, маркетингом, автоматизацией и системным ростом."
    },
    {
      icon: <Users />,
      title: "Персональный AI-партнёр",
      description: "Ваш виртуальный сооснователь, который сопровождает на каждом этапе — от идеи до прибыли и масштабирования."
    }
  ];

  const principles = [
    {
      title: "AI как партнёр",
      description: "Мы создали не инструмент, а интеллектуального партнёра, который думает вместе с вами и предлагает стратегические решения."
    },
    {
      title: "Основано на данных",
      description: "Каждая рекомендация основана на анализе миллионов успешных кейсов и актуальных рыночных данных."
    },
    {
      title: "Сфокусировано на росте",
      description: "Наша философия — не просто создать бизнес, а построить устойчивую, масштабируемую компанию будущего."
    },
    {
      title: "Доступно каждому",
      description: "Профессиональные бизнес-инсайты и стратегии, доступные предпринимателям любого уровня опыта."
    }
  ];

  return (
    <div className={`${styles.aboutContainer} ${isVisible ? styles.visible : ''}`}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Sparkles size={16} />
            <span>AI Business Platform</span>
          </div>
          
          <h1 className={styles.heroTitle}>
            <span className={styles.gradientText}>Строим бизнес будущего</span>
            <br />
            вместе с искусственным интеллектом
          </h1>
          
          <p className={styles.heroSubtitle}>
            Первая нейросеть, которая становится вашим стратегическим партнёром — от идеи до глобального масштабирования.
            Мы превращаем амбиции в системный, прибыльный бизнес.
          </p>
          
          <div className={styles.heroStats}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>10K+</div>
              <div className={styles.statLabel}>успешных запусков</div>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <div className={styles.statNumber}>98%</div>
              <div className={styles.statLabel}>клиентов рекомендуют</div>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <div className={styles.statNumber}>2.3x</div>
              <div className={styles.statLabel}>средний рост доходов</div>
            </div>
          </div>
        </div>
        
        <div className={styles.heroVisual}>
          <div className={styles.glow} />
          <div className={styles.aiOrbit}>
            <div
  className={styles.orbitDot}
  style={{ '--delay': '0s' } as React.CSSProperties}
/>
<div
  className={styles.orbitDot}
  style={{ '--delay': '0.5s' } as React.CSSProperties}
/>
<div
  className={styles.orbitDot}
  style={{ '--delay': '1s' } as React.CSSProperties}
/>

            <div className={styles.orbitCenter}>
              <Zap className={styles.aiIcon} />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.mission}>
        <div className={styles.missionCard}>
          <div className={styles.missionHeader}>
            <h2 className={styles.missionTitle}>
              <span className={styles.highlight}>Мы решаем</span> главную проблему предпринимателей
            </h2>
            <p className={styles.missionText}>
              87% стартапов терпят неудачу из-за отсутствия системного подхода, 
              недостатка экспертизы и невозможности масштабирования. Мы устраняем эти барьеры.
            </p>
          </div>
          
          <div className={styles.missionGrid}>
            <div className={styles.missionItem}>
              <div className={styles.missionIcon}>
                <Shield />
              </div>
              <h3>Для начинающих предпринимателей</h3>
              <p>Кто хочет начать свой бизнес, но не знает с чего стартовать и как избежать критических ошибок.</p>
            </div>
            
            <div className={styles.missionItem}>
              <div className={styles.missionIcon}>
                <TrendingUp />
              </div>
              <h3>Для опытных бизнесменов</h3>
              <p>Кто ищет новые направления роста, автоматизацию процессов и стратегическое масштабирование.</p>
            </div>
            
            <div className={styles.missionItem}>
              <div className={styles.missionIcon}>
                <Globe />
              </div>
              <h3>Для цифровых номадов</h3>
              <p>Кто строит location-independent бизнес и нуждается в гибких, адаптивных решениях.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.capabilities}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Ваш полный цикл <span className={styles.gradientText}>бизнес-развития</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            От первой мысли до международной экспансии — один интеллектуальный партнёр на всех этапах
          </p>
        </div>
        
        <div className={styles.capabilitiesGrid}>
          <div className={styles.capabilitiesNav}>
            {capabilities.map((cap, index) => (
              <button
                key={index}
                className={`${styles.capabilityTab} ${activeCapability === index ? styles.active : ''}`}
                onClick={() => setActiveCapability(index)}
              >
                <div className={styles.tabIcon}>{cap.icon}</div>
                <div className={styles.tabContent}>
                  <h3>{cap.title}</h3>
                  <p>{cap.description}</p>
                </div>
                <ArrowRight className={styles.tabArrow} />
              </button>
            ))}
          </div>
          
          <div className={styles.capabilitiesVisual}>
            <div className={styles.visualCard}>
              <div className={styles.visualContent}>
                <div className={styles.visualIcon}>
                  {capabilities[activeCapability].icon}
                </div>
                <h3 className={styles.visualTitle}>
                  {capabilities[activeCapability].title}
                </h3>
                <p className={styles.visualDescription}>
                  {capabilities[activeCapability].description}
                </p>
                <ul className={styles.featureList}>
                  {['Анализ в реальном времени', 'Персонализированные решения', 'Данные из 150+ источников'].map((feature, idx) => (
                    <li key={idx}>
                      <CheckCircle size={16} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.philosophy}>
        <div className={styles.philosophyContent}>
          <div className={styles.philosophyHeader}>
            <h2 className={styles.philosophyTitle}>
              Философия <span className={styles.gradientText}>партнёрства</span>, а не обслуживания
            </h2>
            <p className={styles.philosophySubtitle}>
              Мы верим, что будущее бизнеса — в симбиозе человеческого креатива и искусственного интеллекта
            </p>
          </div>
          
          <div className={styles.principlesGrid}>
            {principles.map((principle, index) => (
              <div key={index} className={styles.principleCard}>
                <div className={styles.principleNumber}>0{index + 1}</div>
                <h3 className={styles.principleTitle}>{principle.title}</h3>
                <p className={styles.principleDescription}>{principle.description}</p>
                <div className={styles.principleLine} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>
              Начните строить <span className={styles.gradientText}>бизнес будущего</span> сегодня
            </h2>
            <p className={styles.ctaText}>
              Присоединяйтесь к 10 000+ предпринимателей, которые уже доверили AI-партнёру своё развитие
            </p>
            
            <div className={styles.ctaButtons}>
              <button 
                className={styles.primaryButton}
                onClick={handleStartJourney}
              >
                <span>Начать путь к бизнесу</span>
                <ArrowRight className={styles.buttonIcon} />
              </button>
              
            </div>
            
            <div className={styles.ctaFeatures}>
              <div className={styles.featureItem}>
                <CheckCircle size={16} />
                <span>Бесплатно 14 дней</span>
              </div>
              <div className={styles.featureItem}>
                <CheckCircle size={16} />
                <span>Без привязки карты</span>
              </div>
              <div className={styles.featureItem}>
                <CheckCircle size={16} />
                <span>Персональный онбординг</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;