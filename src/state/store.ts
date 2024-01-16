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
  endTrainingMiddleware,
  ignoreCommandUnlessActiveMiddleware,
  initialiseSkipRepeatCallbacks,
  resetOnSettingsOrConnectionChangeMiddleware,
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
    resetOnSettingsOrConnectionChangeMiddleware,
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
    endTrainingMiddleware,
  ),
});

initialiseCubeBluetoothCallback(store);
initialiseSkipRepeatCallbacks(store);

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
