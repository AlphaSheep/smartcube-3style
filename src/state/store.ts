import { configureStore } from "@reduxjs/toolkit";

import { settingsSlice, settingsPersistanceMiddleware } from "./settings.duck";
import { connectionSlice, connectionMiddleware, disconnectMiddleware } from "./connection.duck";
import { cubeSlice, initialiseCubeBluetoothCallback } from "./cube.duck";
import { promptSlice, promptResetOnSettingsChangeMiddleware, addSettingsToPromptResetMiddleware } from "./prompt.duck";

const store = configureStore({
  reducer: {
    settings: settingsSlice.reducer,
    connection: connectionSlice.reducer,
    cube: cubeSlice.reducer,
    prompt: promptSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(
    settingsPersistanceMiddleware,
    connectionMiddleware,
    disconnectMiddleware,
    promptResetOnSettingsChangeMiddleware,
    addSettingsToPromptResetMiddleware,
  ),
});

initialiseCubeBluetoothCallback(store);

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
