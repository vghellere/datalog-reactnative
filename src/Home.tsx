import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Button } from "react-native";

import { RootStackParamList } from "../App";

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

export default function Home({ navigation }: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <Button
        title="View Temperature History"
        onPress={() => navigation.navigate("TemperatureHistory")}
      ></Button>
      <Button
        title="Sync device data"
        onPress={() => navigation.navigate("BLESync")}
      ></Button>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
  },
});
