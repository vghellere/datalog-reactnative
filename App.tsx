import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
} from "@apollo/client";
import ApolloLinkTimeout from "apollo-link-timeout";
import Constants from "expo-constants";

import TemperatureHistory from "./src/TemperatureHistory";
import BLESync from "./src/BLESync";

const Stack = createNativeStackNavigator();
const cache = new InMemoryCache();

const graphqlHost =
  Constants.expoConfig?.hostUri?.split(":").shift()?.concat(":3001") ??
  "productionapi.com";

const timeoutLink = new ApolloLinkTimeout(5000);
const httpLink = new HttpLink({ uri: `http://${graphqlHost}/graphql` });
const timeoutHttpLink = timeoutLink.concat(httpLink);

const client = new ApolloClient({
  link: timeoutHttpLink,
  cache,
  defaultOptions: { watchQuery: { fetchPolicy: "cache-and-network" } },
});

export default function App() {
  return (
    <ApolloProvider client={client}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="BLESync">
          <Stack.Screen
            name="TemperatureHistory"
            component={TemperatureHistory}
            options={{ title: `📈 Temperature History` }}
          />
          <Stack.Screen
            name="BLESync"
            component={BLESync}
            options={{
              title: `🔄 Sync Data`,
            }}
          />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </ApolloProvider>
  );
}
