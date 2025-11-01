// store/index.js
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
      serializableCheck: false,
    }),
});

export default store;