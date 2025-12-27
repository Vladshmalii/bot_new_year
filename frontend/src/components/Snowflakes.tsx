import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface Snowflake {
  s: HTMLDivElement;
  t: gsap.core.Timeline | null;
}

const Snowflakes: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const snowflakesRef = useRef<Snowflake[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const cw = window.innerWidth;
    const ch = window.innerHeight;
    const a: Snowflake[] = [];

    // Создаем контейнер для снежинок
    const container = containerRef.current;

    // Создаем 1300 снежинок
    for (let f = 0; f < 1300; f++) {
      const snowflake = document.createElement('div');
      snowflake.className = 'snowflake';
      
      // Случайный размер для каждой снежинки
      const size = 1.8 + Math.random() * 5.2; // от 1.8 до 7
      const opacity = 0.3 + Math.random() * 0.5; // от 0.3 до 0.8
      
      snowflake.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.3) 100%);
        border-radius: 50%;
        pointer-events: none;
        opacity: ${opacity};
        z-index: 1;
        box-shadow: 0 0 ${size}px rgba(255, 255, 255, 0.5);
      `;
      container.appendChild(snowflake);

      a[f] = {
        s: snowflake,
        t: null
      };
    }

    snowflakesRef.current = a;

    // Определяем зону накопления снега (верхняя часть экрана, где начинается контент)
    const getContentStartY = () => {
      // Ищем первый контентный блок (обычно начинается после заголовка/навигации)
      const contentElements = document.querySelectorAll('.character-profile, .stats-card, .inventory-list-container, .master-dashboard, .player-app-content, .master-content, .profile-card');
      if (contentElements.length > 0) {
        const firstElement = contentElements[0] as HTMLElement;
        const rect = firstElement.getBoundingClientRect();
        // Возвращаем верхнюю границу контента - снежинки накапливаются на верхней части блока
        const topY = rect.top + window.scrollY;
        // Снежинки накапливаются на верхней части блока (от -30px до +30px от верха)
        return Math.max(topY - 30, 80);
      }
      // По умолчанию - примерно 15-20% от высоты экрана (зона заголовков)
      return Math.max(ch * 0.15, 80);
    };

    // Функция для создания анимации снежинки
    const spawnSnowflake = (f: number, r: boolean) => {
      // Получаем размер из стиля снежинки
      const size = parseFloat(a[f].s.style.width) || (1.8 + Math.random() * 5.2);
      const startX = -400 + (cw + 800) * Math.random();
      const randomOffset = -400 + Math.random() * 800; // random(-400, 400)
      const endX = startX + randomOffset;
      const timeScale = size / 37; // timeScale основан на размере (как в оригинале)
      const baseDuration = 15; // базовая длительность падения
      
      // Высота, где снежинки должны накапливаться (верхняя часть контента)
      const contentStartY = getContentStartY();
      // Снежинки падают до этой высоты и останавливаются
      // Вариация от -20 до +40px для эффекта накопления на верхней части блока
      const stopY = contentStartY - 20 + Math.random() * 60;

      a[f].t = gsap.timeline({ repeat: -1, repeatRefresh: true })
        .fromTo(
          a[f].s,
          {
            x: startX,
            y: -15,
            rotation: 0,
            opacity: 0
          },
          {
            ease: 'power1.out', // Замедление в конце для плавной остановки
            y: stopY,
            x: endX,
            rotation: 360 * (Math.random() > 0.5 ? 1 : -1),
            opacity: parseFloat(a[f].s.style.opacity) || 0.6,
            duration: baseDuration,
          }
        )
        // После остановки снежинка остается на месте (накапливается)
        .to(
          a[f].s,
          {
            opacity: parseFloat(a[f].s.style.opacity) || 0.6,
            duration: 999, // Долгое время на месте для эффекта накопления
            ease: 'none'
          }
        )
        .seek(r ? Math.random() * 99 : 0)
        .timeScale(timeScale);
    };

    // Инициализируем все снежинки
    for (let f = 0; f < 1300; f++) {
      spawnSnowflake(f, true);
    }

    // Обработка изменения размера окна и скролла
    const handleResize = () => {
      const newCw = window.innerWidth;
      const newCh = window.innerHeight;
      
      // Перезапускаем анимации с новыми размерами
      for (let f = 0; f < 1300; f++) {
        if (a[f].t) {
          a[f].t.kill();
        }
        spawnSnowflake(f, true);
      }
    };

    // Обновляем позиции снежинок при скролле (чтобы они оставались на верхней части блоков)
    const handleScroll = () => {
      // Перезапускаем анимации для обновления позиций накопления
      for (let f = 0; f < 1300; f++) {
        if (a[f].t) {
          const currentProgress = a[f].t.progress();
          a[f].t.kill();
          spawnSnowflake(f, false);
          // Восстанавливаем прогресс анимации
          if (a[f].t) {
            a[f].t.progress(currentProgress);
          }
        }
      }
    };

    window.addEventListener('resize', handleResize);
    // Обновляем при скролле с debounce для производительности
    let scrollTimeout: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 100);
    });

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      a.forEach(snowflake => {
        if (snowflake.t) {
          snowflake.t.kill();
        }
        if (snowflake.s.parentNode) {
          snowflake.s.parentNode.removeChild(snowflake.s);
        }
      });
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="snowflakes-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden'
      }}
    />
  );
};

export default Snowflakes;

