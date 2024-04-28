import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import ChatComponent from "./ChatComponent";
import Header from "./Header";

const App = () => {
  return (
    <View style={styles.box1}>
      <Header />
      <ChatComponent />
    </View>
  );
};

const styles = StyleSheet.create({
  box1: {
    flex: 1,
    padding: 40,
    justifyContent: "center",
    alignContent: "center",
    backgroundColor: "#151515",
  },
});

export default App;
