'use client';

import Chip from '@mui/joy/Chip';
import Typography from '@mui/joy/Typography';
import { animate, motion, useIsPresent, useSpring } from 'motion/react';
import { useLayoutEffect, useRef } from 'react';
import StarRating from '../StarRating/StarRating';
import styles from './DrawDeck.module.scss';

const exitVariants = {
  exit: (mode) =>
    mode === 'close'
      ? { opacity: 0, scale: 0.85, y: 40, transition: { duration: 0.25 } }
      : {
          x: '-115%',
          y: -40,
          rotate: -16,
          scale: 0.7,
          opacity: 0,
          transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
        },
};

const TILT_SPRING = { stiffness: 200, damping: 20 };

export default function RevealedCard({ card, origin, reduce, onClose }) {
  const flyRef = useRef(null);
  const isPresent = useIsPresent();
  const tiltX = useSpring(0, TILT_SPRING);
  const tiltY = useSpring(0, TILT_SPRING);

  // Fly from the picked fan card's position to the centre of the stage
  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useLayoutEffect(() => {
    const el = flyRef.current;
    if (reduce || !origin) {
      animate(el, { opacity: [0, 1] }, { duration: 0.22 });
      return;
    }
    const rect = el.getBoundingClientRect();
    const dx = origin.cx - (rect.left + rect.width / 2);
    const dy = origin.cy - (rect.top + rect.height / 2);
    const sc = origin.width / rect.width;
    const r = origin.rotate;
    el.style.transform = `translate(${dx}px, ${dy}px) rotate(${r}deg) scale(${sc})`;
    animate(
      el,
      {
        x: [dx, dx * 0.3, 0],
        y: [dy, dy * 0.3 - 70, 0],
        rotate: [r, r * 0.2, 0],
        scale: [sc, ((sc + 1) / 2) * 1.08, 1],
      },
      { duration: 0.76, times: [0, 0.55, 1], ease: [0.22, 0.9, 0.27, 1] },
    );
  }, []);

  const handlePointerMove = (e) => {
    if (reduce || e.pointerType !== 'mouse') return;
    // Freeze the tilt over the close button so it doesn't slide away
    if (e.target.closest(`.${styles.close}`)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
    const py = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
    tiltY.set(px * 10);
    tiltX.set(-py * 8);
  };

  const handlePointerLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    // A leaving card must not swallow clicks meant for the new one
    <motion.div
      className={`${styles.reveal} ${isPresent ? '' : styles.leaving}`}
      variants={exitVariants}
      exit="exit"
    >
      <div ref={flyRef} className={styles.fly}>
        <motion.div
          className={styles.tilt}
          style={{ rotateX: tiltX, rotateY: tiltY }}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <motion.div
            className={styles.flip}
            initial={{ rotateY: reduce ? 0 : 180 }}
            animate={{ rotateY: 0 }}
            transition={{
              delay: 0.28,
              type: 'spring',
              stiffness: 140,
              damping: 14,
            }}
          >
            <div className={`${styles.face} ${styles.front}`}>
              <div className={styles.meta}>
                <div className={styles.metaStart}>
                  <button
                    type="button"
                    className={styles.close}
                    onClick={() => isPresent && onClose()}
                    aria-label="關閉卡片 Close card"
                  >
                    ✕
                  </button>
                  {card.category?.name && (
                    <Chip size="sm" variant="soft" color="primary">
                      {card.category.name}
                    </Chip>
                  )}
                </div>
                <StarRating value={card.stars} readOnly />
              </div>
              <Typography level="h3" className={styles.content}>
                {card.content}
              </Typography>
            </div>
            <div className={`${styles.face} ${styles.back}`} />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
