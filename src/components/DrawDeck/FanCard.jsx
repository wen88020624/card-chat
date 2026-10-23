'use client';

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
} from 'motion/react';
import { useCallback, useEffect, useRef } from 'react';
import styles from './DrawDeck.module.scss';

const SPRING = { stiffness: 260, damping: 24 };
const LIFT = 54;
const DRAG_THRESHOLD = 6;
const DRAW_DISTANCE = 90;
const DRAW_VELOCITY = 0.6; // px per ms, upward

export default function FanCard({
  slot,
  index,
  baseX,
  baseY,
  baseRotate,
  sigma,
  pointerX,
  reduce,
  onDraw,
  onDragChange,
}) {
  const ref = useRef(null);
  const x = useSpring(baseX, SPRING);
  // New cards rise into the fan from below, staggered by position
  const y = useSpring(reduce ? baseY : baseY + 340 + index * 28, SPRING);
  const rotate = useSpring(baseRotate, SPRING);
  const scale = useSpring(1, SPRING);
  const zIndex = useMotionValue(index);

  const gesture = useRef({ press: null, dragging: false, dx: 0, dy: 0 });
  const focused = useRef(false);
  const layout = useRef(null);
  layout.current = { baseX, baseY, baseRotate, sigma, index, reduce };

  const update = useCallback(() => {
    const l = layout.current;
    const g = gesture.current;
    if (g.dragging) {
      x.set(l.baseX + g.dx * 0.4);
      y.set(l.baseY + g.dy);
      rotate.set(g.dx * 0.05);
      scale.set(1.12);
      zIndex.set(999);
      return;
    }
    const px = pointerX.get();
    let lift = 0;
    if (!l.reduce && !Number.isNaN(px)) {
      lift = Math.exp(-((px - l.baseX) ** 2) / (2 * l.sigma ** 2));
    }
    if (focused.current) lift = 1;
    x.set(l.baseX);
    y.set(l.baseY - LIFT * lift);
    rotate.set(l.baseRotate * (1 - 0.75 * lift));
    scale.set(1 + 0.1 * lift);
    zIndex.set(l.index + Math.round(lift * 60));
  }, [pointerX, x, y, rotate, scale, zIndex]);

  useMotionValueEvent(pointerX, 'change', update);
  // Re-target whenever the fan layout changes
  useEffect(() => {
    update();
  });

  const draw = () => {
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    onDraw(slot, {
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
      rotate: rotate.get(),
      width: el.offsetWidth * scale.get(),
    });
  };

  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    gesture.current.press = {
      x0: e.clientX,
      y0: e.clientY,
      lastY: e.clientY,
      lastT: e.timeStamp,
      vy: 0,
    };
  };

  const handlePointerMove = (e) => {
    const g = gesture.current;
    const p = g.press;
    if (!p) return;
    const dx = e.clientX - p.x0;
    const dy = e.clientY - p.y0;
    if (!g.dragging && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      g.dragging = true;
      onDragChange(true);
    }
    if (!g.dragging) return;
    g.dx = dx;
    g.dy = dy < 0 ? dy : dy * 0.25;
    p.vy = (e.clientY - p.lastY) / Math.max(1, e.timeStamp - p.lastT);
    p.lastY = e.clientY;
    p.lastT = e.timeStamp;
    update();
  };

  const finish = (cancelled) => {
    const g = gesture.current;
    const p = g.press;
    if (!p) return;
    const wasDragging = g.dragging;
    const shouldDraw =
      !cancelled &&
      (!wasDragging || g.dy < -DRAW_DISTANCE || p.vy < -DRAW_VELOCITY);
    g.press = null;
    g.dragging = false;
    g.dx = 0;
    g.dy = 0;
    if (wasDragging) onDragChange(false);
    if (shouldDraw) draw();
    else update();
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      aria-label="抽一張牌 Draw a card"
      className={styles.fanCard}
      style={{ x, y, rotate, scale, zIndex }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={() => finish(false)}
      onPointerCancel={() => finish(true)}
      // Pointer taps are handled above; detail === 0 means keyboard activation
      onClick={(e) => e.detail === 0 && draw()}
      onFocus={() => {
        focused.current = true;
        update();
      }}
      onBlur={() => {
        focused.current = false;
        update();
      }}
    />
  );
}
