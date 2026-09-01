'use client';

import { useEffect, useState } from 'react';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import CircularProgress from '@mui/joy/CircularProgress';
import Typography from '@mui/joy/Typography';
import { useAppDispatch, useAppSelector } from '@hooks/use-redux';
import { FETCH_CATEGORIES } from '@redux/slices/categoriesSlice';
import {
  FETCH_DRAW_POOL,
  SET_DRAW_FILTERS,
  DRAW_CARD,
  RESET_DRAW,
} from '@redux/slices/drawSlice';
import { StarRating } from '@components';
import styles from './page.module.scss';

const STAR_OPTIONS = [1, 2, 3, 4];

export default function DrawContent() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((s) => s.categories.list);
  const { pool, current, drawnIds, filters, loading, exhausted } =
    useAppSelector((s) => s.draw);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(FETCH_CATEGORIES());
  }, [dispatch]);

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

  const handleLoad = () => {
    dispatch(FETCH_DRAW_POOL(filters));
    setSidebarOpen(false);
  };

  const handleDraw = () => dispatch(DRAW_CARD());
  const handleReset = () => dispatch(RESET_DRAW());

  const remaining = pool.length - drawnIds.length;

  return (
    <div className={styles.page}>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <section
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}
      >
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>Filters</span>
          <button
            className={styles.closeBtn}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close filters"
          >
            ✕
          </button>
        </div>

        <Typography level="title-md" className={styles.sectionTitle}>
          Categories
        </Typography>
        <div className={styles.chips}>
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              variant={
                filters.categoryIds.includes(cat.id) ? 'solid' : 'outlined'
              }
              color={
                filters.categoryIds.includes(cat.id) ? 'primary' : 'neutral'
              }
              onClick={() => toggleCategory(cat.id)}
              className={styles.chip}
            >
              {cat.name}
            </Chip>
          ))}
          {categories.length === 0 && (
            <Typography level="body-sm" color="neutral">
              No categories yet
            </Typography>
          )}
        </div>

        <Typography level="title-md" className={styles.sectionTitle}>
          Difficulty
        </Typography>
        <div className={styles.chips}>
          {STAR_OPTIONS.map((star) => (
            <Chip
              key={star}
              variant={filters.stars.includes(star) ? 'solid' : 'outlined'}
              color={filters.stars.includes(star) ? 'warning' : 'neutral'}
              onClick={() => toggleStar(star)}
              className={styles.chip}
            >
              {'★'.repeat(star)}
            </Chip>
          ))}
        </div>

        <Button
          fullWidth
          onClick={handleLoad}
          loading={loading}
          className={styles.loadBtn}
        >
          Load Cards
        </Button>

        {pool.length > 0 && (
          <Typography level="body-sm" color="neutral" className={styles.poolInfo}>
            {remaining} / {pool.length} remaining
          </Typography>
        )}
      </section>

      <section className={styles.main}>
        {loading && (
          <div className={styles.center}>
            <CircularProgress />
          </div>
        )}

        {!loading && pool.length === 0 && (
          <div className={styles.empty}>
            <Typography level="h3">🃏</Typography>
            <Typography level="body-md" color="neutral">
              Select filters and click Load Cards to begin
            </Typography>
          </div>
        )}

        {!loading && pool.length > 0 && !current && !exhausted && (
          <div className={styles.center}>
            <Button size="lg" onClick={handleDraw} className={styles.drawBtn}>
              Draw a Card
            </Button>
          </div>
        )}

        {exhausted && (
          <div className={styles.empty}>
            <Typography level="h3">🎉</Typography>
            <Typography level="body-md" color="neutral">
              All cards drawn!
            </Typography>
            <Button
              variant="outlined"
              onClick={handleReset}
              className={styles.resetBtn}
            >
              Reset & Draw Again
            </Button>
          </div>
        )}

        {current && !exhausted && (
          <div className={styles.cardWrap}>
            <div className={styles.card}>
              <div className={styles.cardMeta}>
                <Chip size="sm" variant="soft" color="primary">
                  {current.category?.name}
                </Chip>
                <StarRating value={current.stars} readOnly />
              </div>
              <Typography level="h3" className={styles.cardContent}>
                {current.content}
              </Typography>
            </div>
            <div className={styles.cardActions}>
              <Button onClick={handleDraw} disabled={remaining === 0}>
                Next Card
              </Button>
              <Button variant="outlined" color="neutral" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Mobile FAB */}
      <button
        className={styles.fab}
        onClick={() => setSidebarOpen(true)}
        aria-label="Open filters"
      >
        ⚙
        {(filters.categoryIds.length > 0 || filters.stars.length > 0) && (
          <span className={styles.fabBadge} />
        )}
      </button>
    </div>
  );
}
