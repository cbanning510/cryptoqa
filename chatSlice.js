import { createSlice } from "@reduxjs/toolkit";

export const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [
      {
        _id: Math.round(Math.random() * 1000000).toString(),
        text: "Ask me anything about PEPI tokens and I'll be able to answer anything you need.",
        createdAt: new Date().getTime(),
        user: {
          _id: "2",
          name: "Bot",
        },
      },
    ],
    presentLocation: null,
    model: "gpt-4-turbo",
  },
  reducers: {
    addMessage: (state, action) => {
      // console.log("add message called with message: ", action.payload);
      // If you want to preserve the original timestamp, remove the modification to createdAt
      state.messages.push(action.payload);
    },
    addMultipleMessages: (state, action) => {
      // Concatenate the new messages
      state.messages = state.messages.concat(action.payload);
    },
    setPresentLocation: (state, action) => {
      state.presentLocation = action.payload;
    },
    resetChat: (state) => {
      state.messages = [];
    },
    setModel: (state, action) => {
      // console.log("setModel called with model: ", action.payload);
      state.model = action.payload;
      // call backend to get model
    },
  },
});

export const selectModel = (state) => state.chat.model;
export const selectMessages = (state) => state.chat.messages;

export const {
  addMessage,
  resetChat,
  addMultipleMessages,
  setPresentLocation,
  setModel,
} = chatSlice.actions;

export default chatSlice.reducer;
