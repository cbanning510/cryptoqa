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
  container: {
    flex: 1,
    width: "80%",
    padding: 24,
    backgroundColor: "lightblue",
    alignItems: "center",
    justifyContent: "center",
  },
  box1: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
    backgroundColor: "#151515",
  },
});

export default App;
