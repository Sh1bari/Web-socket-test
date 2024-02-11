import { createReducer, createAction } from '@reduxjs/toolkit';

// Создаем экшен для установки id устройства
export const setOpenDeviceId = createAction<number>('setOpenDeviceId');

// Создаем начальное состояние редьюсера
interface DeviceState {
  openDeviceId: number | null;
}

const initialState: DeviceState = {
  openDeviceId: 0,
};

// Создаем редьюсер с помощью createReducer
const deviceReducer = createReducer(initialState, (builder) => {
  builder.addCase(setOpenDeviceId, (state, action) => {
    state.openDeviceId = action.payload;
  });
});

export default deviceReducer;