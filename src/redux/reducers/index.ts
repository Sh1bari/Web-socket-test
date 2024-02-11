import { combineReducers } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';
import deviceReducer from './deviceReducer';

const rootReducer = combineReducers({
  counter: counterReducer,
  device: deviceReducer,
});

export default rootReducer;