import { Image, StyleSheet, type ImageStyle, type StyleProp } from "react-native";

type Props = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export function BrandLogo({ size = 44, style }: Props) {
  return (
    <Image
      accessibilityIgnoresInvertColors
      accessibilityLabel="e-Lawyer logo"
      resizeMode="cover"
      source={require("../../public/IMG_1294.jpg")}
      style={[styles.logo, { width: size, height: size, borderRadius: size / 4 }, style]}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    backgroundColor: "#031632"
  }
});
