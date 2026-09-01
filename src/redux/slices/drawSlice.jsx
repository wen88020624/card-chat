import { createSlice } from '@reduxjs/toolkit';

const drawSlice = createSlice({
  name: 'draw',
  initialState: {
    pool: [],
    drawnIds: [],
    current: null,
    filters: {
      categoryIds: [],
      stars: [],
    },
    loading: false,
    error: null,
    exhausted: false,
  },
  reducers: {
    FETCH_DRAW_POOL: (state) => {
      state.loading = true;
      state.error = null;
      state.exhausted = false;
    },
    SET_DRAW_POOL: (state, action) => {
      state.pool = action.payload;
      state.drawnIds = [];
      state.current = null;
      state.loading = false;
      state.exhausted = false;
    },
    SET_DRAW_FILTERS: (state, action) => {
      state.filters = action.payload;
    },
    DRAW_CARD: (state) => {
      const remaining = state.pool.filter(
        (c) => !state.drawnIds.includes(c.id),
      );
      if (remaining.length === 0) {
        state.exhausted = true;
        state.current = null;
        return;
      }
      const idx = Math.floor(Math.random() * remaining.length);
      state.current = remaining[idx];
      state.drawnIds.push(remaining[idx].id);
      state.exhausted = false;
    },
    RESET_DRAW: (state) => {
      state.drawnIds = [];
      state.current = null;
      state.exhausted = false;
    },
    SET_DRAW_ERROR: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  FETCH_DRAW_POOL,
  SET_DRAW_POOL,
  SET_DRAW_FILTERS,
  DRAW_CARD,
  RESET_DRAW,
  SET_DRAW_ERROR,
} = drawSlice.actions;

export default drawSlice.reducer;
