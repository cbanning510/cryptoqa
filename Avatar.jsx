import React from "react";
import { View, Image, StyleSheet } from "react-native";

const Avatar = ({ uri, size = 50 }) => {
  const styles = StyleSheet.create({
    avatar: {
      width: size,
      height: size,
      borderRadius: size / 2,
    },
  });

  return (
    <View style={styles.avatar}>
      {uri && (
        <View
          style={{
            width: "100%",
            height: "100%",
            borderRadius: size / 2,
          }}
        >
          <Image
            source={{ uri }}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: size / 2,
            }}
          />
        </View>
      )}
    </View>
  );
};

export default Avatar;
