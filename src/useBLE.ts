import { useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
  Subscription,
} from "react-native-ble-plx";

import * as ExpoDevice from "expo-device";

const TEMPERATURE_SERVICE_UUID = "fa7770c3-712f-488f-8eff-6ca4661be914";
const TEMPERATURE_CHARACTERISTIC_UUID = "c707fa4f-c906-4878-bf7e-649cb06b461d";
const DATETIME_SERVICE_UUID = "19966f5f-0de7-41fb-96e2-38e8e37949ff";
const DATETIME_CHARACTERISTIC_UUID = "728fa1b3-9af7-4eba-b05a-471f594191e9";

interface BluetoothLowEnergyApi {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): void;
  connectToDevice: (deviceId: Device) => Promise<void>;
  disconnectFromDevice: () => void;
  allDevices: Device[];
  readSample: () => Promise<string>;
  syncTime: () => Promise<void>;
}

type useBLEProps = {
  onDeviceDisconnected: () => void;
};

function useBLE(props: useBLEProps): BluetoothLowEnergyApi {
  const bleManager = useMemo(() => new BleManager(), []);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  let connectedDevice: Device | null = null;
  let disconnectedListener: Subscription | null = null;

  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      },
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      },
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      },
    );

    return (
      bluetoothScanPermission === "granted" &&
      bluetoothConnectPermission === "granted" &&
      fineLocationPermission === "granted"
    );
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonPositive: "OK",
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const isAndroid31PermissionsGranted =
          await requestAndroid31Permissions();

        return isAndroid31PermissionsGranted;
      }
    } else {
      return true;
    }
  };

  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const onDeviceDisconnected = (
    error: BleError | null,
    device: Device | null,
  ) => {
    connectedDevice = null;
    disconnectedListener?.remove();
    props.onDeviceDisconnected();
  };

  const scanForPeripherals = () =>
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error(error);
      }
      if (device && device.name?.includes("ESP32 Datalogger")) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicteDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });

  const connectToDevice = async (device: Device) => {
    bleManager.stopDeviceScan();
    const deviceConnection = await bleManager.connectToDevice(device.id);
    disconnectedListener = bleManager.onDeviceDisconnected(
      device.id,
      onDeviceDisconnected,
    );
    await deviceConnection.discoverAllServicesAndCharacteristics();
    connectedDevice = deviceConnection;
  };

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      connectedDevice = null;
    }
  };

  const readSample = async (): Promise<string> => {
    if (!connectedDevice) return "";

    const serviceCharacteristic: Characteristic =
      await connectedDevice.readCharacteristicForService(
        TEMPERATURE_SERVICE_UUID,
        TEMPERATURE_CHARACTERISTIC_UUID,
      );

    const decodedSample = atob(serviceCharacteristic?.value || "");
    return decodedSample;
  };

  const syncTime = async (): Promise<void> => {
    if (!connectedDevice) return;

    // write the current timestamp to the device so that it can sync it's internal RTC
    const epoch = `${Math.round(Date.now() / 1000)}`;
    await connectedDevice.writeCharacteristicWithResponseForService(
      DATETIME_SERVICE_UUID,
      DATETIME_CHARACTERISTIC_UUID,
      btoa(epoch),
    );
  };

  return {
    scanForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    disconnectFromDevice,
    readSample,
    syncTime,
  };
}

export default useBLE;
