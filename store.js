import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./chatSlice"; // Import the reducer from your chat slice

export const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
});
