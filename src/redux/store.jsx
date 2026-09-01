import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import categoriesReducer from './slices/categoriesSlice';
import cardsReducer from './slices/cardsSlice';
import drawReducer from './slices/drawSlice';
import rootSaga from './saga/index';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: {
    categories: categoriesReducer,
    cards: cardsReducer,
    draw: drawReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export default store;
