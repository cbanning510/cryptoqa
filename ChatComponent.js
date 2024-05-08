import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Platform,
  Linking,
  Dimensions,
  Image,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import {
  GiftedChat,
  Bubble,
  InputToolbar,
  Time,
  Message,
} from "react-native-gifted-chat";
import { MaterialIcons } from "@expo/vector-icons";
import SendDisabled from "./assets/send-disabled.png";
import Send from "./assets/send.png";
import { addMessage, selectModel, selectMessages } from "./chatSlice";
import io from "socket.io-client";

const urlPattern = /(?:🔗\s*)?([^[\]]+)\]\(([^)]+)\)/g;

const ChatComponent = () => {
  const { width } = Dimensions.get("window");
  const chatContainerStyle = {
    flex: 1,
    paddingHorizontal: width > 768 ? 350 : 0,
  };
  const chatRef = useRef(null);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      _id: Math.round(Math.random() * 1000000).toString(),
      text: "Ask me anything about xcoin and I'll be able to answer anything you need.",
      createdAt: new Date().getTime(),
      user: {
        _id: "2",
        name: "Bot",
      },
    },
  ]);
  const model = useSelector(selectModel);
  const globalMessages = useSelector(selectMessages);
  const [contextText, setContextText] = useState("");
  const currentModel = model || "gpt-3.5-turbo-1106";
  const socketRef = useRef(null);
  const [accumulatedMessage, setAccumulatedMessage] = useState("");

  useEffect(() => {
    // const socket = io("http://localhost:3001");
    const socket = io("https://api.nofud.xyz");
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to server!!!!!!!");
    });

    socket.on("message", (data) => {
      if (data.clientId === socketRef.current.id) {
        setAccumulatedMessage((prevMessage) => prevMessage + data.text);
      }
    });

    socket.on("streamEnd", (data) => {
      console.log("Message received", data);
      console.log("Socket id is: ", socketRef.current.id);
      console.log("data.clientId id is: ", data.clientId);
      if (data.clientId === socketRef.current.id) {
        setAccumulatedMessage((prevMessage) => {
          console.log("accumulatedMessage: ", prevMessage);
          const cleanedMessage = extractMessagesAndRemoveBrackets(
            prevMessage.trim()
          );
          const botMessage = {
            _id: Math.round(Math.random() * 1000000).toString(),
            text: cleanedMessage,
            createdAt: new Date().getTime(),
            user: {
              _id: "2",
              name: "Bot",
            },
          };
          console.log("Bot message is: ", botMessage);
          dispatchMessageWithDelay(botMessage);

          setIsLoading(false);

          return "";
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") {
      const gcLoadingContainerEl = document.querySelector(
        '[data-testid="GC_LOADING_CONTAINER"]'
      );
      if (gcLoadingContainerEl) {
        gcLoadingContainerEl.removeEventListener(
          "touchstart",
          handleTouchStart,
          { passive: true }
        );

        const handleTouchStart = (event) => {
          console.log("Handling touch start");
        };

        gcLoadingContainerEl.addEventListener("touchstart", handleTouchStart, {
          passive: false,
        });
      }
    }
  }, []);

  const resetStates = () => {
    setIsLoading(false);
    setContextText("");
  };

  function extractMessagesAndRemoveBrackets(text) {
    console.log("Extracting messages and removing brackets", text);
    const removePattern = /\[\[\[\[.*?\]\]\]\]|\[\[\[.*?\]\]\]/gs;
    const bracketPattern = /\[\[.*?\]\]|\{\{.*?\}\}/gs;

    let cleanedText = text.replace(removePattern, "");
    cleanedText = cleanedText.replace(bracketPattern, "");

    return cleanedText.trim(); // Add .trim() to remove leading/trailing whitespace
  }

  const onSend = useCallback(
    async (newMessages) => {
      setIsLoading(true);
      if (newMessages.length > 0) {
        const userMessageCreatedAt =
          newMessages[0].createdAt instanceof Date
            ? newMessages[0].createdAt.getTime()
            : new Date(newMessages[0].createdAt).getTime();

        const userMessage = {
          ...newMessages[0],
          createdAt: userMessageCreatedAt,
        };
        dispatch(addMessage(userMessage));

        try {
          console.log(socketRef.current.id);
          const response = await fetch(
            // "http://192.168.1.151:3001/api/openai/message",
            "https://api.nofud.xyz/api/openai/message",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userInput: userMessage.text,
                model: currentModel,
                clientId: socketRef.current.id,
              }),
            }
          );
          console.log("Response is: ", response);

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          resetStates();
        } catch (error) {
          console.error("Error:", error);
          resetStates();
        }
      }
      setIsLoading(false);
    },
    [dispatch, currentModel]
  );

  const renderBubble = (props) => {
    const { currentMessage } = props;
    const { text } = currentMessage;

    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: "#282D31CC",
            borderBottomLeftRadius: 0,
            marginBottom: 0,
            maxWidth: width > 475 ? "46%" : "70%",
          },
          right: {
            backgroundColor: props.currentMessage.image
              ? "transparent"
              : "#1186FF",
            borderBottomRightRadius: props.currentMessage.image ? null : 0,
            marginBottom: 0,
            maxWidth: width > 475 ? "46%" : "70%",
          },
        }}
        textStyle={{
          left: { color: "white" },
          right: { color: "white" },
        }}
        timeTextStyle={{
          right: {
            color: "lightgrey",
          },
        }}
        parsePatterns={(linkStyle) => [
          {
            type: "url",
            style: { color: "#3B83F6", textDecorationLine: "underline" },
            onPress: (url) => Linking.openURL(url),
            pattern: /\[\[.*?\]\]\s*([^[\]]+)\]\(([^)]+)\)/g,
          },
        ]}
      />
    );
  };

  function dispatchMessageWithDelay(botResponseText) {
    console.log("Dispatching message with delay", botResponseText);
    const regex = /^(.+?(?:\n|$))/gm;
    const textWithoutBrackets = botResponseText.text.replace(/\{.*?\}/g, "");
    const sentences = textWithoutBrackets.match(regex) || [];

    let cumulativeDelay = 0;

    sentences.forEach((sentence, index) => {
      const trimmedSentence = sentence.trim();
      const words = trimmedSentence.split(/\s+/).length;

      const delayPerWord = 1500 / 40;
      const sentenceDelay = words * delayPerWord;

      const baseDelay = 500;

      const totalDelay = baseDelay + sentenceDelay;

      setTimeout(() => {
        const message = {
          _id: `${Date.now()}-${index}`,
          createdAt: new Date().getTime(),
          text: trimmedSentence,
          user: { _id: "2", name: "Bot" },
        };

        dispatch(addMessage(message));

        if (index === sentences.length - 1) {
          setIsLoading(false);
        }
      }, cumulativeDelay);

      cumulativeDelay += totalDelay;
    });
  }

  const renderTime = (props) => {
    if (props.currentMessage.image) {
      return null;
    }

    return (
      <View style={{ marginHorizontal: 10 }}>
        <Time {...props} />
      </View>
    );
  };

  const randomizeSetIsLoading = () => {
    const minDelay = 1500;
    const maxDelay = 3000;

    const randomDelay = Math.floor(
      Math.random() * (maxDelay - minDelay + 1) + minDelay
    );

    setTimeout(() => {
      setIsLoading(true);
    }, randomDelay);
  };

  const renderMessage = (props) => {
    return (
      <Message
        {...props}
        linkStyle={{
          right: {
            color: "pink",
          },
          left: {
            color: "orange",
          },
        }}
      />
    );
  };

  return (
    <>
      <View style={chatContainerStyle}>
        <GiftedChat
          renderAvatar={null}
          renderTime={renderTime}
          messageContainerRef={chatRef}
          renderMessage={this.renderMessage}
          infiniteScroll
          bottomOffset={100}
          renderAvatarOnTop
          messages={globalMessages}
          onSend={(newMessages) => onSend(newMessages)}
          renderBubble={renderBubble}
          user={{
            _id: 1,
          }}
          messagesContainerStyle={{
            paddingBottom: 40,
            backgroundColor: "#151515",
          }}
          inverted={false}
          isTyping={isLoading}
          renderActions={() => (
            <TouchableOpacity
              style={{
                marginRight: 16,
                marginTop: 8,
                alignSelf: "center",
              }}
              onPress={() => {
                const url = "https://www.google.com";
                Linking.canOpenURL(url)
                  .then((supported) => {
                    if (supported) {
                      Linking.openURL(url);
                    } else {
                      console.log("Don't know how to open URI: " + url);
                    }
                  })
                  .catch((err) => console.error("An error occurred", err));
              }}
            >
              <View>
                <MaterialIcons name="file-upload" size={34} color="white" />
              </View>
            </TouchableOpacity>
          )}
          renderSend={(props) => {
            return (
              <TouchableOpacity
                style={{
                  marginRight: 14,
                  padding: 12,
                  position: "absolute",
                  right: -4,
                  top: 9,
                }}
                onPress={() => {
                  if (props.text && props.onSend) {
                    props.onSend({ text: props.text.trim() }, true);
                  }
                }}
              >
                {props.text ? (
                  <Image source={Send} style={{ width: 24, height: 24 }} />
                ) : (
                  <Image
                    source={SendDisabled}
                    style={{ width: 24, height: 24 }}
                  />
                )}
              </TouchableOpacity>
            );
          }}
          textInputProps={{
            multiline: false,
            style: {
              flex: 1,
              alignSelf: "center",
              marginTop: 8,
              height: 48,
              borderColor: "#202428",
              borderWidth: 2,
              borderRadius: 100,
              paddingRight: 64,
              paddingLeft: 20,
              fontSize: 15,
              color: "rgba(255, 255, 255, 0.6)",
              backgroundColor: "#151515",
            },
            placeholder: "Message...",
            placeholderTextColor: "rgba(255, 255, 255, 0.45)",
          }}
          renderInputToolbar={(props) => {
            return (
              <InputToolbar
                {...props}
                textInputProps={{
                  ...props.textInputProps,
                  onSubmitEditing: ({ nativeEvent: { text } }) =>
                    props.onSend({ text: text.trim() }, true),
                  returnKeyType: "send",
                  blurOnSubmit: false,
                }}
                containerStyle={{
                  flex: 1,
                  paddingHorizontal: 24,
                  paddingLeft: 27,
                  backgroundColor: "#151515",
                  borderTopWidth: 0,
                }}
              />
            );
          }}
        />
      </View>
    </>
  );
};

export default ChatComponent;
