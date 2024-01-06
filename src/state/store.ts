import { configureStore } from "@reduxjs/toolkit";

import { settingsSlice, settingsPersistanceMiddleware } from "./settings";
import { connectionSlice, connectionMiddleware, disconnectMiddleware } from "./connection";
import { cubeSlice } from "./cube";
import { promptSlice, promptResetOnSettingsChangeMiddleware, addSettingsToPromptResetMiddleware } from "./prompt";

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

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
