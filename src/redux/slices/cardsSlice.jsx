import { createSlice } from '@reduxjs/toolkit';

const cardsSlice = createSlice({
  name: 'cards',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    FETCH_CARDS: (state) => {
      state.loading = true;
      state.error = null;
    },
    SET_CARDS: (state, action) => {
      state.list = action.payload;
      state.loading = false;
    },
    CREATE_CARD: (state) => {
      state.loading = true;
      state.error = null;
    },
    ADD_CARD: (state, action) => {
      state.list.unshift(action.payload);
      state.loading = false;
    },
    UPDATE_CARD: (state) => {
      state.loading = true;
      state.error = null;
    },
    PATCH_CARD: (state, action) => {
      const idx = state.list.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
      state.loading = false;
    },
    DELETE_CARD: (state) => {
      state.loading = true;
      state.error = null;
    },
    REMOVE_CARD: (state, action) => {
      state.list = state.list.filter((c) => c.id !== action.payload);
      state.loading = false;
    },
    SET_CARD_ERROR: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  FETCH_CARDS,
  SET_CARDS,
  CREATE_CARD,
  ADD_CARD,
  UPDATE_CARD,
  PATCH_CARD,
  DELETE_CARD,
  REMOVE_CARD,
  SET_CARD_ERROR,
} = cardsSlice.actions;

export default cardsSlice.reducer;
