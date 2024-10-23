import { useState, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";
import { Device } from "react-native-ble-plx";
import { useMutation } from "@apollo/client";

import useBLE from "./useBLE";
import DevicesModal from "./DevicesModal";
import { CreateTemperatureSamplesDocument } from "../src/__generated__/graphql";

export enum Status {
  IDLE = "Connect to a device to start the synchronization process",
  CONNECTING_BLE = "Connecting to device. Please wait...",
  SYNCING_BLE = "Getting data from device...",
  SYNCING_ERROR = "Error while getting data from device",
  MUTATION_LOADING = "Sending data to the Cloud...",
  MUTATION_ERROR = "Error while sending data to the Cloud",
  DONE = "Sync completed!",
}

export default function Home() {
  const [
    createTemperatureSamples,
    { data: mutationData, error: mutationError, loading: mutationLoading },
  ] = useMutation(CreateTemperatureSamplesDocument);

  const onDeviceDisconnected = () => {
    console.log("Device Disconneted");
  };

  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    disconnectFromDevice,
    readSample,
    syncTime,
  } = useBLE({
    onDeviceDisconnected: onDeviceDisconnected,
  });

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [status, setStatus] = useState<Status>(Status.IDLE);

  if (mutationData && status !== Status.DONE) setStatus(Status.DONE);
  if (mutationError && status !== Status.MUTATION_ERROR) {
    // TODO: Improve error handling, what to do on error? Save the samples locally and try to send again later?
    setStatus(Status.MUTATION_ERROR);
  }
  if (mutationLoading && status !== Status.MUTATION_LOADING)
    setStatus(Status.MUTATION_LOADING);

  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      scanForPeripherals();
    }
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const openModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
  };

  const syncWithCloud = useCallback(
    (samples: any[]) => {
      // TODO: batch inserts
      createTemperatureSamples({ variables: { samples: samples } });
    },
    [createTemperatureSamples],
  );

  const syncWithDevice = useCallback(async () => {
    try {
      setStatus(Status.SYNCING_BLE);
      await syncTime();

      let samples = [];
      // get all samples
      while (true) {
        const sample = await readSample();
        if (sample === "") break;

        const sampleData = sample.split(",");
        const sampleTime = new Date(Number(sampleData[0]) * 1000);
        const sampleTemp = Number(sampleData[1]);

        samples.push({
          eventTimestamp: sampleTime.toISOString(),
          value: sampleTemp,
        });
      }

      disconnectFromDevice();

      // send to rails
      if (samples.length > 0) {
        syncWithCloud(samples);
      } else {
        setStatus(Status.DONE);
      }
    } catch (e) {
      setStatus(Status.SYNCING_ERROR);
      console.error(e);
    }
  }, [readSample, syncTime, disconnectFromDevice, syncWithCloud]);

  const connectToPeripheral = async (device: Device) => {
    try {
      setStatus(Status.CONNECTING_BLE);
      await connectToDevice(device);
      syncWithDevice();
    } catch (e) {
      // TODO: Improve error handling
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text>{status}</Text>
      {[
        Status.IDLE,
        Status.DONE,
        Status.MUTATION_ERROR,
        Status.SYNCING_ERROR,
      ].includes(status) && (
        <Button onPress={openModal} title="Scan devices"></Button>
      )}
      <DevicesModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={connectToPeripheral}
        devices={allDevices}
      />
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
