'use client';

import {
  AnimatePresence,
  useMotionValue,
  useReducedMotion,
} from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import styles from './DrawDeck.module.scss';
import FanCard from './FanCard';
import RevealedCard from './RevealedCard';

const MAX_FAN = 12;

let slotSeq = 0;
const newSlots = (n) => Array.from({ length: n }, () => ++slotSeq);

export default function DrawDeck({ remaining, current, onDraw, onClose }) {
  const reduce = useReducedMotion();
  const fanRef = useRef(null);
  const draggingRef = useRef(false);
  const pointerX = useMotionValue(Number.NaN);
  const [slots, setSlots] = useState(() =>
    newSlots(Math.min(remaining, MAX_FAN)),
  );
  const [size, setSize] = useState({ fanW: 0, cardW: 0 });
  const [origin, setOrigin] = useState(null);
  const [exitMode, setExitMode] = useState('discard');

  // Keep the number of visible fan cards in sync with the remaining pool
  useEffect(() => {
    setSlots((prev) => {
      const target = Math.min(remaining, MAX_FAN);
      if (prev.length === target) return prev;
      if (prev.length < target) {
        return [...prev, ...newSlots(target - prev.length)];
      }
      return prev.slice(0, target);
    });
  }, [remaining]);

  useEffect(() => {
    const el = fanRef.current;
    if (!el) return;
    const measure = () => {
      const cardW = Number.parseFloat(
        getComputedStyle(el).getPropertyValue('--card-w'),
      );
      setSize({ fanW: el.clientWidth, cardW: cardW || 0 });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Fan position i always maps to the i-th remaining card in deal order,
  // so the card you pick is the card you get.
  const handleDraw = (slot, from) => {
    const index = slots.indexOf(slot);
    setOrigin(from);
    setExitMode('discard');
    setSlots((prev) => prev.filter((s) => s !== slot));
    onDraw(index);
  };

  const handleClose = () => {
    setExitMode('close');
    onClose();
  };

  const handleDragChange = (dragging) => {
    draggingRef.current = dragging;
    if (dragging) pointerX.set(Number.NaN);
  };

  const handlePointerMove = (e) => {
    if (e.pointerType !== 'mouse' || draggingRef.current) return;
    const rect = fanRef.current.getBoundingClientRect();
    pointerX.set(e.clientX - (rect.left + rect.width / 2));
  };

  // Fan geometry
  const { fanW, cardW } = size;
  const n = slots.length;
  const spread = Math.max(0, Math.min(fanW - cardW - 16, n * cardW * 0.42));
  const spacing = n > 1 ? spread / (n - 1) : 0;
  const step = n > 1 ? Math.min(6, 44 / (n - 1)) : 0;
  const sigma = Math.max(spacing * 1.3, cardW * 0.5, 1);

  return (
    <div className={styles.deck}>
      <div className={styles.stage}>
        {!current && remaining > 0 && (
          <div className={styles.hint}>
            <div className={styles.ghost}>DRAW A CARD</div>
            <span className={styles.arrow} aria-hidden="true">
              ↑
            </span>
            <span>點擊或向上拖曳任一張牌來抽牌 · Tap or swipe up to draw</span>
          </div>
        )}
        <AnimatePresence custom={exitMode}>
          {current && (
            <RevealedCard
              key={current.id}
              card={current}
              origin={origin}
              reduce={reduce}
              onClose={handleClose}
            />
          )}
        </AnimatePresence>
      </div>

      <div
        ref={fanRef}
        className={styles.fan}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => pointerX.set(Number.NaN)}
      >
        {cardW > 0 &&
          slots.map((slot, i) => {
            const off = i - (n - 1) / 2;
            return (
              <FanCard
                key={slot}
                slot={slot}
                index={i}
                baseX={off * spacing}
                baseY={off * off * step * 0.4}
                baseRotate={off * step}
                sigma={sigma}
                pointerX={pointerX}
                reduce={reduce}
                onDraw={handleDraw}
                onDragChange={handleDragChange}
              />
            );
          })}
        {remaining === 0 && (
          <p className={styles.empty}>這副牌抽完了 · All cards drawn</p>
        )}
      </div>
    </div>
  );
}
