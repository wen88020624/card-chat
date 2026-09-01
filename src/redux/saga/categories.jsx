import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import { categoriesApi } from '@redux/api/apiService';
import {
  FETCH_CATEGORIES,
  SET_CATEGORIES,
  CREATE_CATEGORY,
  ADD_CATEGORY,
  UPDATE_CATEGORY,
  PATCH_CATEGORY,
  DELETE_CATEGORY,
  REMOVE_CATEGORY,
  SET_CATEGORY_ERROR,
} from '@redux/slices/categoriesSlice';

function* fetchCategories() {
  try {
    const data = yield call(categoriesApi.getAll);
    yield put(SET_CATEGORIES(data));
  } catch (err) {
    yield put(SET_CATEGORY_ERROR(err.message));
  }
}

function* createCategory(action) {
  try {
    const data = yield call(categoriesApi.create, action.payload);
    yield put(ADD_CATEGORY(data));
  } catch (err) {
    yield put(SET_CATEGORY_ERROR(err.message));
  }
}

function* updateCategory(action) {
  const { id, ...body } = action.payload;
  try {
    const data = yield call(categoriesApi.update, id, body);
    yield put(PATCH_CATEGORY(data));
  } catch (err) {
    yield put(SET_CATEGORY_ERROR(err.message));
  }
}

function* deleteCategory(action) {
  try {
    yield call(categoriesApi.remove, action.payload);
    yield put(REMOVE_CATEGORY(action.payload));
  } catch (err) {
    yield put(SET_CATEGORY_ERROR(err.message));
  }
}

export function* categoriesSaga() {
  yield takeLatest(FETCH_CATEGORIES.type, fetchCategories);
  yield takeEvery(CREATE_CATEGORY.type, createCategory);
  yield takeEvery(UPDATE_CATEGORY.type, updateCategory);
  yield takeEvery(DELETE_CATEGORY.type, deleteCategory);
}
