import { all } from 'redux-saga/effects';
import { categoriesSaga } from './categories';
import { cardsSaga } from './cards';

export default function* rootSaga() {
  yield all([categoriesSaga(), cardsSaga()]);
}
