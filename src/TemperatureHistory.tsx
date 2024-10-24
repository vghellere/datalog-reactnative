import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, FlatList, Button } from "react-native";
import { useQuery } from "@apollo/client";

import {
  GetTemperatureSamplesDocument,
  GetTemperatureSamplesQuery,
} from "../src/__generated__/graphql";

const optionsFormatDate: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

const optionsFormatTime: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "numeric",
};

type FormattedResponse = {
  id: string;
  dateTime: string;
  temperature: string;
}[];

const formattedResponse = (
  responseData: GetTemperatureSamplesQuery,
): FormattedResponse => {
  const dateFormat = new Intl.DateTimeFormat("en-US", optionsFormatDate);
  const timeFormat = new Intl.DateTimeFormat("en-US", optionsFormatTime);

  let lastDateString = "";

  const formattedData = responseData.temperatureSamples.map((sample) => {
    const sampleDateTime = new Date(sample.eventTimestamp);
    const dateString = dateFormat.format(sampleDateTime);

    let dateTime = "";
    if (lastDateString !== dateString) {
      lastDateString = dateString;
      dateTime = `${dateString} `;
    }

    dateTime += timeFormat.format(sampleDateTime);
    const temperature = `${sample.value.toFixed(1)} °C`;
    return { id: String(sample.id), dateTime, temperature };
  });

  return formattedData;
};

type ItemProps = { dateTime: string; temperature: string };

const Item = ({ dateTime, temperature }: ItemProps) => (
  <View style={styles.item}>
    <Text style={styles.dateTime}>{dateTime}</Text>
    <Text style={styles.temperature}>{temperature}</Text>
  </View>
);

export default function TemperatureHistory() {
  const { data, loading, error, refetch } = useQuery(
    GetTemperatureSamplesDocument,
    {
      variables: { nSamples: 300 },
    },
  );

  const renderData = () => {
    const parsedData = formattedResponse(data!);

    return (
      <FlatList
        data={parsedData}
        renderItem={({ item }) => (
          <Item dateTime={item.dateTime} temperature={item.temperature} />
        )}
        keyExtractor={(item) => item.id}
      />
    );
  };

  return (
    <View style={styles.container}>
      {error && <Text>{error?.message}</Text>}
      {loading && <Text>Loading data...</Text>}
      {!!!loading && !!!error && data && renderData()}
      {!!!loading && (
        <Button
          title="Refresh Data"
          onPress={() => {
            refetch();
          }}
        ></Button>
      )}
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
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  dateTime: { textAlign: "right", minWidth: 250, marginHorizontal: 4 },
  temperature: { marginHorizontal: 5 },
});
