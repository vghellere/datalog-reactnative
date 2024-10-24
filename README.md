# Datalogger

This project is made of three parts:

* A Rails `back-end` [project](https://github.com/vghellere/datalog-rails) with `GraphQL` that stores temperature data
* A [ESP32 Logging](https://github.com/vghellere/datalogger-esp32) board with a temperature sensor that stores temperature data
* A ReactNative (Expo) project (this repo) that reads the temperature data from the ESP32 via Bluetooth and sends it to the `back-end`

For more info about the project go to the Rails app [repo](https://github.com/vghellere/datalog-rails)
