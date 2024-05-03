import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Platform,
  Linking,
  Dimensions,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import {
  GiftedChat,
  Bubble,
  InputToolbar,
  // MessageImage,
  Time,
} from "react-native-gifted-chat";
import { MaterialIcons } from "@expo/vector-icons";
import SendDisabled from "./assets/send-disabled.svg";
import Send from "./assets/send.svg";
import {
  addMessage,
  // setPresentLocation,
  selectModel,
  selectMessages,
} from "./chatSlice";

const ChatComponent = () => {
  const { width } = Dimensions.get("window"); // Get the screen width
  //   console.log("Dimensions are: ", Dimensions.get("window"));
  console.log("Width is: ", width); // Log the width to the console
  const chatContainerStyle = {
    flex: 1,
    // backgroundColor: "#fff",
    paddingHorizontal: width > 768 ? 350 : 0, // Use the width directly here
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
    // console.log("ChatComponent mounted", messages);
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

  async function extractContentWithFourBrackets(text) {
    const pattern = /(\[\[\[\[.*?\]\]\]\])/gs;
    let result = [];

    function generateUniqueId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match.index === pattern.lastIndex) {
        pattern.lastIndex++;
      }

      result.push({ id: generateUniqueId(), content: match[1] });
    }

    try {
      const existingDataString = await AsyncStorage.getItem("extractedPlan");
      let existingData = [];

      if (existingDataString) {
        existingData = JSON.parse(existingDataString);
      }

      existingData = existingData.concat(result);

      await AsyncStorage.setItem("extractedPlan", JSON.stringify(existingData));

      const storedData = await AsyncStorage.getItem("extractedPlan");
      // console.log("Updated data in storage is: \n\n", storedData);
      refreshPlan();
    } catch (error) {
      console.error("Error updating AsyncStorage:", error);
    }

    return result;
  }

  function extractMessagesAndRemoveBrackets(text) {
    console.log("Extracting messages and removing brackets", text);
    const removePattern = /\[\[\[\[.*?\]\]\]\]|\[\[\[.*?\]\]\]/gs;
    const bracketPattern = /\[\[.*?\]\]|\{\{.*?\}\}/gs;

    let cleanedText = text.replace(removePattern, "");
    cleanedText = cleanedText.replace(bracketPattern, "");

    return cleanedText.trim(); // Add .trim() to remove leading/trailing whitespace
  }

  //   const onSend = useCallback((newMessages = []) => {
  //     setMessages((previousMessages) =>
  //       GiftedChat.append(previousMessages, newMessages)
  //     );
  //     // Here, you can send the newMessages to your backend API
  //     // and handle the response from ChatGPT
  //   }, []);

  const resetStates = () => {
    setIsLoading(false);
    // setImageUri(""); // Ensure this is the correct place to reset
    // setPublicUri(""); // Reset here to ensure it's cleared after sending
    setContextText("");
  };

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
        // chatRef.current?.scrollToOffset({
        //   offset: 0,
        //   animated: true,
        // });

        try {
          const response = await fetch(
            // "http://ec2-44-202-254-222.compute-1.amazonaws.com:3001/openai/message",
            "http://192.168.1.151:3001/openai/message",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userInput: userMessage.text,
                //lat: location?.coords.latitude,
                //long: location?.coords.longitude,
                //dateTime: userMessage.createdAt,
                model: currentModel,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();

          const botMessage = {
            _id: Math.round(Math.random() * 1000000).toString(),
            text: extractMessagesAndRemoveBrackets(data.response.trim()),
            createdAt: new Date().getTime(),
            user: {
              _id: "2",
              name: "Bot",
            },
          };
          //   dispatch(addMessage(botMessage));
          dispatchMessageWithDelay(botMessage);
          //   chatRef.current?.scrollToOffset({
          //     offset: 0,
          //     animated: true,
          //   });
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

  //   function parseAndCleanInput(data) {
  //     const modifiedData = data.map((item) => {
  //       // Check if the text property exists and is not null/undefined
  //       if (item.text) {
  //         // If text exists, replace the patterns as before
  //         item.text = item.text.replace(/\[\[.*?\]\]/g, "").trim();
  //       }
  //       // Return the item whether it was modified or not
  //       return item;
  //     });

  //     return modifiedData;
  //   }

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

  function dispatchMessageWithDelay(botResponseText) {
    console.log("Dispatching message with delay", botResponseText);
    const regex = /^(.+?(?:\n|$))/gm;
    const textWithoutBrackets = botResponseText.text.replace(/\{.*?\}/g, "");
    const sentences = textWithoutBrackets.match(regex) || [];
    // const sentences = textWithoutBrackets.match(/[^.!?]+[.!?]*/g) || [];

    let cumulativeDelay = 0; // Initialize cumulative delay

    sentences.forEach((sentence, index) => {
      const trimmedSentence = sentence.trim();
      const words = trimmedSentence.split(/\s+/).length;

      // Calculate delay based on sentence length, assuming ~200-250 WPM for reading or 40 WPM for typing
      // 1 word = 1.5 seconds / 40 (for typing speed)
      const delayPerWord = 1500 / 40; // Adjust this value as needed
      const sentenceDelay = words * delayPerWord;

      // Adjust base delay here if needed to ensure a minimum visibility time for shorter sentences
      const baseDelay = 500; // Base delay to add between sentences

      // Calculate total delay for this sentence
      const totalDelay = baseDelay + sentenceDelay;

      setTimeout(() => {
        // Dispatch the sentence here
        const message = {
          _id: `${Date.now()}-${index}`,
          createdAt: new Date().getTime(),
          text: trimmedSentence,
          user: { _id: "2", name: "Bot" },
        };

        dispatch(addMessage(message));
        // chatRef.current?.scrollToOffset({
        //   offset: 0,
        //   animated: true,
        // });
        // messageReceivedSound.play();

        // Optionally set loading to false after the last message
        if (index === sentences.length - 1) {
          setIsLoading(false);
        }
      }, cumulativeDelay);

      // Update cumulative delay for the next sentence
      cumulativeDelay += totalDelay;
    });
  }

  const renderTime = (props) => {
    // Check if the current message has an image
    if (props.currentMessage.image) {
      // Return null to not render the time for image messages
      return null;
    }

    // For all other messages, return the default Time component
    return (
      <View style={{ marginHorizontal: 10 }}>
        <Time {...props} />
      </View>
    );
  };

  const randomizeSetIsLoading = () => {
    // Define the minimum and maximum delay times in milliseconds
    const minDelay = 1500; // 1 second
    const maxDelay = 3000; // 5 seconds

    // Generate a random delay within the specified range
    const randomDelay = Math.floor(
      Math.random() * (maxDelay - minDelay + 1) + minDelay
    );

    // Set `setIsLoading` to true after the random delay
    setTimeout(() => {
      setIsLoading(true);
    }, randomDelay);
  };

  //   renderFooter: () => (chatRecipientIsTyping ? <TypingIndicator /> : null);

  return (
    <>
      <View style={chatContainerStyle}>
        <GiftedChat
          renderAvatar={null}
          renderTime={renderTime}
          // renderFooter={() => (isLoading ? <TypingIndicator /> : null)}
          messageContainerRef={chatRef}
          infiniteScroll
          // loadEarlier
          bottomOffset={100}
          renderAvatarOnTop
          // messages={parseAndCleanInput(globalMessages)}
          messages={globalMessages}
          onSend={(newMessages) => onSend(newMessages)}
          renderBubble={renderBubble}
          user={{
            _id: 1,
          }}
          messagesContainerStyle={{
            paddingBottom: 40,
            // backgroundColor: "#151515",
          }}
          inverted={false}
          isTyping={isLoading}
          // isTyping={true}
          renderActions={() => (
            <TouchableOpacity
              style={{
                marginRight: 16,
                marginTop: 8,
                alignSelf: "center",
              }}
              // onPress={handleImagePicker}
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
                  <Send width={24} height={24} />
                ) : (
                  <SendDisabled width={24} height={24} />
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
              //width: "64%",
              height: 48,
              borderColor: "#202428",
              borderWidth: 2,
              borderRadius: 100,
              paddingRight: 64,
              paddingLeft: 20,
              fontSize: 15,
              color: "rgba(255, 255, 255, 0.6)",
              //fontFamily: "SF Pro Text",
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
      </View>
    </>
  );
};

// const styles = StyleSheet.create({
//   chatContainer: {
//     flex: 1,
//     backgroundColor: "#fff",
//     // Apply padding conditionally based on the screen width
//     paddingHorizontal: width > 768 ? 150 : 10,
//   },
//   // Other styles...
// });

export default ChatComponent;
