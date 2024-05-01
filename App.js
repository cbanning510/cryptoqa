import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import ChatComponent from "./ChatComponent";
import Header from "./Header";
import { Provider } from "react-redux";
import { store } from "./store";

const App = () => {
  return (
    <Provider store={store}>
      <View style={styles.box1}>
        <Header />
        <ChatComponent />
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  box1: {
    flex: 1,
    paddingBottom: 40,
    justifyContent: "center",
    alignContent: "center",
    backgroundColor: "#151515",
  },
});

export default App;
