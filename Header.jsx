import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Avatar from "./Avatar";

const Header = () => {
  const avatarUri = "./assets/pepe.webp";

  return (
    <View style={styles.header}>
      <View style={styles.leftHeaderContainer}>
        <Avatar uri={avatarUri} />
        <Text style={styles.headerText}>PEPi Support</Text>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Back to Telegram</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 80,
    backgroundColor: "#282D31",
    //paddingHorizontal: "5%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  headerText: {
    color: "#FFF",
    fontSize: 22,
    paddingLeft: 16,
  },
  leftHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
  },
  button: {
    padding: 10,
    borderRadius: 8,
    borderColor: "grey",
    borderWidth: 1,
  },
});

export default Header;
