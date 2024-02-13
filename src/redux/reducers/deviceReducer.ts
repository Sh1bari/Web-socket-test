import { createReducer, createAction } from "@reduxjs/toolkit";

// Создаем экшен для установки id устройства
export const setOpenDeviceId = createAction<number>("setOpenDeviceId");
export const setIsOnline = createAction<boolean>("setIsOnline");

// Создаем начальное состояние редьюсера
interface DeviceState {
  openDeviceId: number | null;
  isOnline: boolean;
}

const initialState: DeviceState = {
  openDeviceId: 0,
  isOnline: false,
};

// Создаем редьюсер с помощью createReducer
const deviceReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setOpenDeviceId, (state, action) => {
      state.openDeviceId = action.payload;
    })
    .addCase(setIsOnline, (state, action) => {
      state.isOnline = action.payload;
    });
});

export default deviceReducer;
