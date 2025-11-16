// store/store.js - FIXED
import { configureStore } from '@reduxjs/toolkit';
import bookingReducer from './bookingSlice';
import savedReducer from './savedSlice';

const store = configureStore({
  reducer: {
    booking: bookingReducer, 
    saved: savedReducer,     
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['saved/fetchSavedLists/fulfilled', 'saved/createNewList/fulfilled'],
        // Ignore these paths in the state
        ignoredPaths: ['saved.lists'],
      },
    }),
});

export default store;