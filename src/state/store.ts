import { configureStore } from "@reduxjs/toolkit";

import {
  settingsSlice,
  settingsPersistenceMiddleware
} from "./settings.duck";
import {
  connectionSlice,
  connectionMiddleware,
  disconnectMiddleware
} from "./connection.duck";
import {
  cubeSlice,
  addStateToSetTargetMiddleware,
  ignoreMoveUnlessActiveMiddleware,
  initialiseCubeBluetoothCallback
} from "./cube.duck";
import {
  promptSlice,
  addSettingsToPromptResetMiddleware,
  setTargetOnPromptChangeMiddleware
} from "./prompt.duck";
import {
  addResultMiddleware,
  ignoreCommandUnlessActiveMiddleware,
  initialiseSkipRepeatCallbacks,
  resetOnSettingsChangeMiddleware,
  startTrainingMiddleware,
  trainerCheckCompleteMiddleware,
  trainerCheckSolvedMiddleware,
  trainerRepeatMiddleware,
  trainerSkipMiddleware,
  trainerSlice
} from "./trainer.duck";

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
    addSettingsToPromptResetMiddleware,
    resetOnSettingsChangeMiddleware,
    setTargetOnPromptChangeMiddleware,
    addStateToSetTargetMiddleware,

    connectionMiddleware,
    disconnectMiddleware,

    ignoreMoveUnlessActiveMiddleware,
    ignoreCommandUnlessActiveMiddleware,

    addResultMiddleware,
    trainerCheckCompleteMiddleware,
    trainerRepeatMiddleware,
    trainerSkipMiddleware,
    trainerCheckSolvedMiddleware,

    startTrainingMiddleware,
  ),
});

initialiseCubeBluetoothCallback(store);
initialiseSkipRepeatCallbacks(store);

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
