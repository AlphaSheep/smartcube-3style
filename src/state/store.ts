import { configureStore } from "@reduxjs/toolkit";

import { settingsSlice, settingsPersistenceMiddleware } from "./settings.duck";
import { connectionSlice, connectionMiddleware, disconnectMiddleware } from "./connection.duck";
import { addStateToSetTargetMiddleware, cubeSlice, initialiseCubeBluetoothCallback } from "./cube.duck";
import { promptSlice, addSettingsToPromptResetMiddleware, setTargetOnPromptChangeMiddleware } from "./prompt.duck";
import { addResultMiddleware, resetOnSettingsChangeMiddleware, startTrainingMiddleware, trainerCheckSolvedMiddleware, trainerRepeatMiddleware, trainerSkipMiddleware, trainerSlice } from "./trainer.duck";

const store = configureStore({
  reducer: {
    settings: settingsSlice.reducer,
    connection: connectionSlice.reducer,
    cube: cubeSlice.reducer,
    prompt: promptSlice.reducer,
    trainer: trainerSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(
    settingsPersistenceMiddleware,
    connectionMiddleware,
    disconnectMiddleware,
    addSettingsToPromptResetMiddleware,
    addStateToSetTargetMiddleware,
    startTrainingMiddleware,
    trainerRepeatMiddleware,
    trainerSkipMiddleware,
    trainerCheckSolvedMiddleware,
    setTargetOnPromptChangeMiddleware,
    addResultMiddleware,
    resetOnSettingsChangeMiddleware,
  ),
});

initialiseCubeBluetoothCallback(store);

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
