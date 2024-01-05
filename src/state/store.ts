import { configureStore } from "@reduxjs/toolkit";

import { settingsSlice, settingsPersistanceMiddleware } from "./settings";
import { connectionSlice, connectionMiddleware, disconnectMiddleware } from "./connection";
import { cubeSlice } from "./cube";

const store = configureStore({
  reducer: {
    settings: settingsSlice.reducer,
    connection: connectionSlice.reducer,
    cube: cubeSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(
    settingsPersistanceMiddleware,
    connectionMiddleware,
    disconnectMiddleware,
  ),
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
