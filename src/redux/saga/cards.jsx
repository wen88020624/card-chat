import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import { cardsApi } from '@redux/api/apiService';
import {
  FETCH_CARDS,
  SET_CARDS,
  CREATE_CARD,
  ADD_CARD,
  UPDATE_CARD,
  PATCH_CARD,
  DELETE_CARD,
  REMOVE_CARD,
  SET_CARD_ERROR,
} from '@redux/slices/cardsSlice';
import {
  FETCH_DRAW_POOL,
  SET_DRAW_POOL,
  SET_DRAW_ERROR,
} from '@redux/slices/drawSlice';

function* fetchCards(action) {
  try {
    const data = yield call(cardsApi.getAll, action.payload || {});
    yield put(SET_CARDS(data));
  } catch (err) {
    yield put(SET_CARD_ERROR(err.message));
  }
}

function* createCard(action) {
  try {
    const data = yield call(cardsApi.create, action.payload);
    yield put(ADD_CARD(data));
  } catch (err) {
    yield put(SET_CARD_ERROR(err.message));
  }
}

function* updateCard(action) {
  const { id, ...body } = action.payload;
  try {
    const data = yield call(cardsApi.update, id, body);
    yield put(PATCH_CARD(data));
  } catch (err) {
    yield put(SET_CARD_ERROR(err.message));
  }
}

function* deleteCard(action) {
  try {
    yield call(cardsApi.remove, action.payload);
    yield put(REMOVE_CARD(action.payload));
  } catch (err) {
    yield put(SET_CARD_ERROR(err.message));
  }
}

function* fetchDrawPool(action) {
  try {
    const data = yield call(cardsApi.getAll, action.payload || {});
    yield put(SET_DRAW_POOL(data));
  } catch (err) {
    yield put(SET_DRAW_ERROR(err.message));
  }
}

export function* cardsSaga() {
  yield takeLatest(FETCH_CARDS.type, fetchCards);
  yield takeEvery(CREATE_CARD.type, createCard);
  yield takeEvery(UPDATE_CARD.type, updateCard);
  yield takeEvery(DELETE_CARD.type, deleteCard);
  yield takeLatest(FETCH_DRAW_POOL.type, fetchDrawPool);
}
