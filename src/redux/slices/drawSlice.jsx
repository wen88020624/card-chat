import { createSlice } from '@reduxjs/toolkit';

// Fisher–Yates shuffle of card ids; fixed for the whole round
const shuffleIds = (cards) => {
  const ids = cards.map((c) => c.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
};

const drawSlice = createSlice({
  name: 'draw',
  initialState: {
    pool: [],
    dealOrder: [],
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
      state.dealOrder = shuffleIds(action.payload);
      state.drawnIds = [];
      state.current = null;
      state.loading = false;
      state.exhausted = false;
    },
    SET_DRAW_FILTERS: (state, action) => {
      state.filters = action.payload;
    },
    // payload (optional): id of the card picked from the fan.
    // Without it, draws the next card in dealOrder.
    DRAW_CARD: (state, action) => {
      const remaining = state.dealOrder.filter(
        (id) => !state.drawnIds.includes(id),
      );
      if (remaining.length === 0) {
        state.exhausted = true;
        state.current = null;
        return;
      }
      const id = remaining.includes(action.payload)
        ? action.payload
        : remaining[0];
      state.current = state.pool.find((c) => c.id === id);
      state.drawnIds.push(id);
      state.exhausted = false;
    },
    CLOSE_CARD: (state) => {
      state.current = null;
    },
    RESET_DRAW: (state) => {
      state.dealOrder = shuffleIds(state.pool);
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
  CLOSE_CARD,
  RESET_DRAW,
  SET_DRAW_ERROR,
} = drawSlice.actions;

export default drawSlice.reducer;
