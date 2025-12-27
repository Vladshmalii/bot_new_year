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

    // Функция для создания анимации снежинки
    const spawnSnowflake = (f: number, r: boolean) => {
      // Получаем размер из стиля снежинки
      const size = parseFloat(a[f].s.style.width) || (1.8 + Math.random() * 5.2);
      const startX = -400 + (cw + 800) * Math.random();
      const randomOffset = -400 + Math.random() * 800; // random(-400, 400)
      const endX = startX + randomOffset;
      const timeScale = size / 37; // timeScale основан на размере (как в оригинале)
      const baseDuration = 15; // базовая длительность падения

      a[f].t = gsap.timeline({ repeat: -1, repeatRefresh: true })
        .fromTo(
          a[f].s,
          {
            x: startX,
            y: -15,
            rotation: 0
          },
          {
            ease: 'none',
            y: ch + 15,
            x: endX,
            rotation: 360 * (Math.random() > 0.5 ? 1 : -1), // случайное вращение
            duration: baseDuration,
          }
        )
        .seek(r ? Math.random() * 99 : 0)
        .timeScale(timeScale);
    };

    // Инициализируем все снежинки
    for (let f = 0; f < 1300; f++) {
      spawnSnowflake(f, true);
    }

    // Обработка изменения размера окна
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

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
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

