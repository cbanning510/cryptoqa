import React, { useState, useCallback, useEffect } from "react";
import { TouchableOpacity, View, Platform } from "react-native";
import {
  GiftedChat,
  Bubble,
  InputToolbar,
  // MessageImage,
  Time,
} from "react-native-gifted-chat";
import { MaterialIcons } from "@expo/vector-icons";

const ChatComponent = () => {
  const [messages, setMessages] = useState([
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
  ]);

  useEffect(() => {
    // hack to deal with intiial message not showing on web
    if (Platform.OS === "web") {
      const gcLoadingContaineEl = document.querySelectorAll(
        '[data-testid="GC_LOADING_CONTAINER"]'
      )[0];
      if (gcLoadingContaineEl) {
        gcLoadingContaineEl.style.display = "none";
        setTimeout(() => {
          gcLoadingContaineEl.style.display = "flex";
        }, 50);
      }
    }
    console.log("ChatComponent mounted", messages);
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") {
      const gcLoadingContainerEl = document.querySelector(
        '[data-testid="GC_LOADING_CONTAINER"]'
      );
      if (gcLoadingContainerEl) {
        // Remove existing event listeners that could be causing issues
        // This assumes you know the type of event, e.g., 'touchstart', 'wheel'
        gcLoadingContainerEl.removeEventListener(
          "touchstart",
          handleTouchStart,
          { passive: true }
        );

        // Reattach the event listener with passive set to false
        const handleTouchStart = (event) => {
          // your event handling logic here
          console.log("Handling touch start");
        };

        gcLoadingContainerEl.addEventListener("touchstart", handleTouchStart, {
          passive: false,
        });
      }
    }
  }, []);

  const onSend = useCallback((newMessages = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );
    // Here, you can send the newMessages to your backend API
    // and handle the response from ChatGPT
  }, []);

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: "#282D31CC",
            borderBottomLeftRadius: 0,
            marginBottom: 0, // Add space below each left bubble
          },
          right: {
            backgroundColor: props.currentMessage.image
              ? // ? "#282D31CC"
                "transparent"
              : "#34baeb",
            borderBottomRightRadius: props.currentMessage.image ? null : 0,
            marginBottom: 0, // Add space below each right bubble
          },
        }}
        textStyle={{
          left: { color: "white" },
          right: { color: "black" },
        }}
        timeTextStyle={{
          right: {
            color: "grey",
          },
        }}
      />
    );
  };

  const renderTime = (props) =>
    props.currentMessage.image ? null : <Time {...props} />;

  return (
    <>
      <GiftedChat
        renderAvatar={null}
        renderTime={renderTime}
        scrollToBottom
        bottomOffset={100}
        renderAvatarOnTop
        messages={messages}
        onSend={(newMessages) => onSend(newMessages)}
        renderBubble={renderBubble}
        user={{
          _id: 1,
        }}
        messagesContainerStyle={{
          paddingBottom: 40,
          // backgroundColor: "#151515",
        }}
        // inverted={false}
        // isTyping={isLoading}
        renderActions={() => (
          <TouchableOpacity
            style={{
              marginRight: 16,
              marginTop: 8,
              alignSelf: "center",
            }}
            // onPress={handleImagePicker}
            onPress={() => alert("Image Picker")}
          >
            <View>
              <MaterialIcons name="file-upload" size={34} color="white" />
            </View>
          </TouchableOpacity>
        )}
        textInputProps={{
          multiline: false,
          style: {
            flex: 1,
            alignSelf: "center",
            //marginTop: 8,
            //width: "64%",
            height: 48,
            borderColor: "#202428",
            borderWidth: 2,
            borderRadius: 100,
            paddingRight: 64,
            paddingLeft: 20,
            fontSize: 15,
            color: "white",
            // fontFamily: "SF Pro Text",
            backgroundColor: "#131612",
          },
          placeholder: "Message...",
          placeholderTextColor: "rgba(255, 255, 255, 0.45)",
        }}
        renderInputToolbar={(props) => {
          return (
            <InputToolbar
              {...props}
              containerStyle={{
                // width: "80%",
                flex: 1,
                paddingHorizontal: 24,
                paddingLeft: 27,
                backgroundColor: "#131612",
                borderTopWidth: 0,
              }}
            />
          );
        }}
      />
    </>
  );
};

export default ChatComponent;
