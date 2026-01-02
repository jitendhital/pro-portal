import { combineReducers, configureStore } from '@reduxjs/toolkit'
import userReducer from './user/userSlice.js'

import { persistReducer, persistStore } from 'redux-persist';

// Import storage using namespace import to handle ESM compatibility
// Then assign to storage variable to maintain code structure
import * as storageImport from 'redux-persist/lib/storage';
const storage = storageImport.default || storageImport;



const rootReducer = combineReducers({ user: userReducer });

const persistConfig = {
  key: 'root',
  storage,
  version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
   middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);