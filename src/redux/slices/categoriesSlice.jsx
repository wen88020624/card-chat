import { createSlice } from '@reduxjs/toolkit';

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    FETCH_CATEGORIES: (state) => {
      state.loading = true;
      state.error = null;
    },
    SET_CATEGORIES: (state, action) => {
      state.list = action.payload;
      state.loading = false;
    },
    CREATE_CATEGORY: (state) => {
      state.loading = true;
      state.error = null;
    },
    ADD_CATEGORY: (state, action) => {
      state.list.push(action.payload);
      state.loading = false;
    },
    UPDATE_CATEGORY: (state) => {
      state.loading = true;
      state.error = null;
    },
    PATCH_CATEGORY: (state, action) => {
      const idx = state.list.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
      state.loading = false;
    },
    DELETE_CATEGORY: (state) => {
      state.loading = true;
      state.error = null;
    },
    REMOVE_CATEGORY: (state, action) => {
      state.list = state.list.filter((c) => c.id !== action.payload);
      state.loading = false;
    },
    SET_CATEGORY_ERROR: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  FETCH_CATEGORIES,
  SET_CATEGORIES,
  CREATE_CATEGORY,
  ADD_CATEGORY,
  UPDATE_CATEGORY,
  PATCH_CATEGORY,
  DELETE_CATEGORY,
  REMOVE_CATEGORY,
  SET_CATEGORY_ERROR,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;
