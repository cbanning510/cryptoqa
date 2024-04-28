import React, { useState, useCallback, useEffect } from "react";
import { GiftedChat } from "react-native-gifted-chat";

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Dummy data for initial messages
    const initialMessages = [
      {
        _id: 1,
        text: "Hello!",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: "ChatGPT",
          avatar: "https://placeimg.com/140/140/any",
        },
      },
    ];

    setMessages(initialMessages);
  }, []);

  const onSend = useCallback((newMessages = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );

    // Here, you can send the newMessages to your backend API
    // and handle the response from ChatGPT
  }, []);

  return (
    <>
      <GiftedChat
        messages={messages}
        onSend={(newMessages) => onSend(newMessages)}
        user={{
          _id: 1,
        }}
      />
    </>
  );
};

export default ChatComponent;
