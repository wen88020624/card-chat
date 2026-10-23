'use client';

import { DrawDeck } from '@components';
import { useAppDispatch, useAppSelector } from '@hooks/use-redux';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import CircularProgress from '@mui/joy/CircularProgress';
import Typography from '@mui/joy/Typography';
import { FETCH_CATEGORIES } from '@redux/slices/categoriesSlice';
import {
  CLOSE_CARD,
  DRAW_CARD,
  FETCH_DRAW_POOL,
  RESET_DRAW,
  SET_DRAW_FILTERS,
} from '@redux/slices/drawSlice';
import { MotionConfig } from 'motion/react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import styles from './page.module.scss';

const STAR_OPTIONS = [1, 2, 3, 4];
const COLLAPSED_KEY = 'draw.sidebarCollapsed';

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

function ChevronIcon({ direction }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`${styles.icon} ${direction === 'right' ? styles.flipX : ''}`}
    >
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export default function DrawContent() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((s) => s.categories.list);
  const { pool, dealOrder, current, drawnIds, filters, loading, exhausted } =
    useAppSelector((s) => s.draw);
  const [drawerOpen, setDrawerOpen] = useState(false); // mobile
  const [collapsed, setCollapsed] = useState(false); // desktop

  useEffect(() => {
    dispatch(FETCH_CATEGORIES());
    try {
      setCollapsed(localStorage.getItem(COLLAPSED_KEY) === '1');
    } catch {}
  }, [dispatch]);

  // Filters apply immediately. On mount, keep an existing round instead of
  // reshuffling when coming back from another page.
  const mounted = useRef(false);
  const hasPool = pool.length > 0;
  // biome-ignore lint/correctness/useExhaustiveDependencies: refetch only when filters change
  useEffect(() => {
    const firstRun = !mounted.current;
    mounted.current = true;
    if (firstRun && hasPool) return;
    dispatch(FETCH_DRAW_POOL(filters));
  }, [dispatch, filters]);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0');
    } catch {}
  };

  const toggleCategory = (id) => {
    const next = filters.categoryIds.includes(id)
      ? filters.categoryIds.filter((c) => c !== id)
      : [...filters.categoryIds, id];
    dispatch(SET_DRAW_FILTERS({ ...filters, categoryIds: next }));
  };

  const toggleStar = (star) => {
    const next = filters.stars.includes(star)
      ? filters.stars.filter((s) => s !== star)
      : [...filters.stars, star];
    dispatch(SET_DRAW_FILTERS({ ...filters, stars: next }));
  };

  const clearFilters = () =>
    dispatch(SET_DRAW_FILTERS({ categoryIds: [], stars: [] }));

  const handleDraw = (fanIndex) => {
    const order = dealOrder.filter((id) => !drawnIds.includes(id));
    dispatch(DRAW_CARD(order[fanIndex]));
  };
  const handleClose = () => dispatch(CLOSE_CARD());
  const handleReset = () => dispatch(RESET_DRAW());

  const remaining = pool.length - drawnIds.length;
  const activeCount = filters.categoryIds.length + filters.stars.length;

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={`${styles.page} ${collapsed ? styles.pageCollapsed : ''}`}
      >
        {drawerOpen && (
          <button
            type="button"
            className={styles.backdrop}
            onClick={() => setDrawerOpen(false)}
            aria-label="關閉篩選"
          />
        )}

        <aside
          className={`${styles.sidebar} ${drawerOpen ? styles.sidebarOpen : ''}`}
          aria-label="篩選"
        >
          {/* Desktop collapsed rail; CSS shows rail or panel */}
          <div className={styles.rail}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={toggleCollapsed}
              aria-label="展開篩選"
              title="展開篩選"
            >
              <ChevronIcon direction="right" />
            </button>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={toggleCollapsed}
              aria-label={`篩選（${activeCount} 個條件）`}
              title="篩選"
            >
              <FilterIcon />
              {activeCount > 0 && (
                <span className={styles.badge}>{activeCount}</span>
              )}
            </button>
          </div>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>篩選</span>
              {activeCount > 0 && (
                <button
                  type="button"
                  className={styles.textBtn}
                  onClick={clearFilters}
                >
                  清除
                </button>
              )}
              <button
                type="button"
                className={`${styles.iconBtn} ${styles.collapseBtn}`}
                onClick={toggleCollapsed}
                aria-label="收合篩選"
                title="收合篩選"
              >
                <ChevronIcon direction="left" />
              </button>
              <button
                type="button"
                className={`${styles.iconBtn} ${styles.drawerCloseBtn}`}
                onClick={() => setDrawerOpen(false)}
                aria-label="關閉篩選"
              >
                ✕
              </button>
            </div>

            <div className={styles.group}>
              <span className={styles.groupTitle}>分類</span>
              <div className={styles.chips}>
                {categories.map((cat) => {
                  const on = filters.categoryIds.includes(cat.id);
                  return (
                    <Chip
                      key={cat.id}
                      size="sm"
                      variant={on ? 'solid' : 'soft'}
                      color={on ? 'primary' : 'neutral'}
                      onClick={() => toggleCategory(cat.id)}
                    >
                      {cat.name}
                    </Chip>
                  );
                })}
                {categories.length === 0 && (
                  <Typography level="body-sm" color="neutral">
                    還沒有分類，<Link href="/manage">去新增</Link>
                  </Typography>
                )}
              </div>
            </div>

            <div className={styles.group}>
              <span className={styles.groupTitle}>難度</span>
              <div className={styles.chips}>
                {STAR_OPTIONS.map((star) => {
                  const on = filters.stars.includes(star);
                  return (
                    <Chip
                      key={star}
                      size="sm"
                      variant={on ? 'solid' : 'soft'}
                      color={on ? 'warning' : 'neutral'}
                      onClick={() => toggleStar(star)}
                    >
                      {'★'.repeat(star)}
                    </Chip>
                  );
                })}
              </div>
            </div>

            <Typography level="body-xs" color="neutral">
              未選任何條件時抽全部卡片
            </Typography>
          </div>
        </aside>

        <section className={styles.main}>
          {loading && (
            <div className={styles.center}>
              <CircularProgress />
            </div>
          )}

          {!loading && pool.length === 0 && (
            <div className={styles.empty}>
              <Typography level="body-md" color="neutral">
                沒有符合條件的卡片
              </Typography>
              {activeCount > 0 ? (
                <Button variant="outlined" onClick={clearFilters}>
                  清除篩選
                </Button>
              ) : (
                <Button component={Link} href="/manage" variant="outlined">
                  去新增卡片
                </Button>
              )}
            </div>
          )}

          {!loading && pool.length > 0 && !exhausted && (
            <div className={styles.deckWrap}>
              <DrawDeck
                remaining={remaining}
                current={current}
                onDraw={handleDraw}
                onClose={handleClose}
              />
              <div className={styles.deckBar}>
                <Typography level="body-sm" color="neutral">
                  剩餘 {remaining} / {pool.length}
                </Typography>
                <Button
                  size="sm"
                  variant="plain"
                  color="neutral"
                  onClick={handleReset}
                >
                  重新洗牌
                </Button>
              </div>
            </div>
          )}

          {exhausted && (
            <div className={styles.empty}>
              <Typography level="body-md" color="neutral">
                這副牌抽完了
              </Typography>
              <Button variant="outlined" onClick={handleReset}>
                重新洗牌
              </Button>
            </div>
          )}
        </section>

        {/* Mobile: open filter drawer */}
        <button
          type="button"
          className={styles.fab}
          onClick={() => setDrawerOpen(true)}
          aria-label="開啟篩選"
        >
          <FilterIcon />
          {activeCount > 0 && (
            <span className={styles.badge}>{activeCount}</span>
          )}
        </button>
      </div>
    </MotionConfig>
  );
}
