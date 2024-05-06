import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Image,
} from "react-native";
import Avatar from "./Avatar";
import Pepe from "./assets/hero-image.png";

const Header = () => {
  // const avatarUri = "./assets/hero-image.png";

  return (
    <View style={styles.header}>
      <View style={styles.leftHeaderContainer}>
        <Image source={Pepe} style={{ width: 30, height: 30 }} />
        <Text style={styles.headerText}>PEPi Support</Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          const url = "https://www.telegram.com";
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
        style={styles.button}
      >
        <Text style={styles.buttonText}>Back to Telegram</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 80,
    backgroundColor: "#282D31",
    paddingHorizontal: "5%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    color: "#FFF",
    fontSize: 20,
    paddingLeft: 8,
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
    padding: 6,
    borderRadius: 4,
    borderColor: "#1186FF",
    borderWidth: 1,
  },
});

export default Header;
