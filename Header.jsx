import { View, Text, StyleSheet } from "react-native";

const Header = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>PEPI Support</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#282D31",
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    color: "#FFF",
    fontSize: 20,
  },
});

export default Header;
