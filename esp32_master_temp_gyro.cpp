#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFi.h>
#include <HTTPClient.h>

// WiFi Configuration
const char* WIFI_SSID = "GinnyHifi";
const char* WIFI_PASSWORD = "ginny1singh";
const char* API_ENDPOINT = "https://health-monitor-uyt6.onrender.com/vitals";

// Pin Definitions
#define MPU6050_SDA 21
#define MPU6050_SCL 22
#define ONE_WIRE_BUS 4

// Serial Communication Pins (UART2)
#define RXD2 32  // Connect to ESP32 #2 TX (GPIO 33)
#define TXD2 33  // Connect to ESP32 #2 RX (GPIO 32)

// I2C Bus
TwoWire I2C_MPU = TwoWire(1);

// Sensor Objects
Adafruit_MPU6050 mpu;
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensor(&oneWire);

// Sensor Data
struct SensorData {
  float temperature = 0;
  float accelX = 0;
  float accelY = 0;
  float accelZ = 0;
  float accelTotal = 0;
  float gyroX = 0;
  float gyroY = 0;
  float gyroZ = 0;
  bool fallAlert = false;
  
  // From ESP32 #2
  float heartRate = 0;
  float spo2 = 0;
} sensorData;

// Timing
unsigned long lastTempRead = 0;
unsigned long lastMPURead = 0;
unsigned long lastAPICall = 0;
unsigned long lastSerialCheck = 0;

const long tempInterval = 2000;    // 2 seconds
const long mpuInterval = 100;      // 100ms
const long apiInterval = 2000;     // 2 seconds
const long serialInterval = 500;   // 500ms

// Fall Detection
#define MOVEMENT_THRESHOLD 1.5
#define FALL_COOLDOWN 5000
unsigned long lastFallTime = 0;

void setup() {
  Serial.begin(115200);   // USB Serial for debugging
  Serial2.begin(9600, SERIAL_8N1, RXD2, TXD2);  // UART2 for ESP32 #2
  delay(1000);
  
  Serial.println("🚀 ESP32 #1 (Master) - Temp & Gyro");
  Serial.println("====================================");
  
  // Connect to WiFi
  Serial.print("📶 Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi Failed");
  }
  
  // Initialize I2C for MPU6050
  I2C_MPU.begin(MPU6050_SDA, MPU6050_SCL, 400000);
  
  // Initialize MPU6050
  if (!mpu.begin(0x68, &I2C_MPU)) {
    Serial.println("❌ Failed to find MPU6050");
    while (1) delay(10);
  }
  Serial.println("✅ MPU6050 initialized");
  
  // Initialize DS18B20
  tempSensor.begin();
  int deviceCount = tempSensor.getDeviceCount();
  Serial.print("✅ DS18B20 initialized. Devices found: ");
  Serial.println(deviceCount);
  if (deviceCount == 0) {
    Serial.println("⚠️  WARNING: No DS18B20 sensor detected! Check wiring.");
  }
  
  // Configure MPU6050
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  
  Serial.println("====================================");
  Serial.println("Waiting for heart rate data from ESP32 #2...\n");
}

void loop() {
  unsigned long currentMillis = millis();
  
  // Read temperature every 2 seconds
  if (currentMillis - lastTempRead >= tempInterval) {
    tempSensor.requestTemperatures();
    float temp = tempSensor.getTempCByIndex(0);
    
    // Check if temperature is valid (-127 means sensor not connected)
    if (temp != -127.0 && temp > -55.0 && temp < 125.0) {
      sensorData.temperature = temp;
    } else {
      sensorData.temperature = 0;  // Set to 0 if invalid
      static unsigned long lastWarning = 0;
      if (currentMillis - lastWarning > 10000) {  // Warn every 10 seconds
        Serial.println("⚠️  DS18B20 not detected! Check wiring:");
        Serial.println("   DATA → GPIO 4");
        Serial.println("   VCC → 3.3V");
        Serial.println("   GND → GND");
        lastWarning = currentMillis;
      }
    }
    lastTempRead = currentMillis;
  }
  
  // Read MPU6050 every 100ms
  if (currentMillis - lastMPURead >= mpuInterval) {
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);
    
    sensorData.accelX = a.acceleration.x;
    sensorData.accelY = a.acceleration.y;
    sensorData.accelZ = a.acceleration.z;
    sensorData.gyroX = g.gyro.x;
    sensorData.gyroY = g.gyro.y;
    sensorData.gyroZ = g.gyro.z;
    
    // Calculate total acceleration
    sensorData.accelTotal = sqrt(sensorData.accelX * sensorData.accelX + 
                                  sensorData.accelY * sensorData.accelY + 
                                  sensorData.accelZ * sensorData.accelZ);
    
    // Fall detection
    if (sensorData.accelTotal > MOVEMENT_THRESHOLD) {
      if (currentMillis - lastFallTime > FALL_COOLDOWN) {
        sensorData.fallAlert = true;
        lastFallTime = currentMillis;
        Serial.println("🚨 FALL DETECTED!");
      }
    }
    
    // Auto-clear fall alert after 3 seconds
    if (sensorData.fallAlert && (currentMillis - lastFallTime > 3000)) {
      sensorData.fallAlert = false;
    }
    
    lastMPURead = currentMillis;
  }
  
  // Check for data from ESP32 #2 every 500ms
  if (currentMillis - lastSerialCheck >= serialInterval) {
    readHeartRateData();
    lastSerialCheck = currentMillis;
  }
  
  // Send combined data to API every 2 seconds
  if (currentMillis - lastAPICall >= apiInterval) {
    printSensorData();
    sendToAPI();
    lastAPICall = currentMillis;
  }
}

void readHeartRateData() {
  if (Serial2.available()) {
    String data = Serial2.readStringUntil('\n');
    data.trim();
    
    // Expected format: "HR:75,SPO2:98"
    if (data.startsWith("HR:")) {
      int hrIndex = data.indexOf("HR:");
      int commaIndex = data.indexOf(",");
      int spo2Index = data.indexOf("SPO2:");
      
      if (hrIndex != -1 && commaIndex != -1 && spo2Index != -1) {
        String hrStr = data.substring(hrIndex + 3, commaIndex);
        String spo2Str = data.substring(spo2Index + 5);
        
        sensorData.heartRate = hrStr.toFloat();
        sensorData.spo2 = spo2Str.toFloat();
        
        Serial.print("💓 Received from ESP32 #2 -> HR: ");
        Serial.print(sensorData.heartRate, 0);
        Serial.print(" BPM, SpO2: ");
        Serial.print(sensorData.spo2, 0);
        Serial.println("%");
      }
    }
  }
}

void printSensorData() {
  Serial.println("\n📊 COMBINED SENSOR DATA");
  Serial.println("========================");
  
  Serial.print("🌡️  Temperature: ");
  Serial.print(sensorData.temperature, 1);
  Serial.println("°C");
  
  Serial.print("❤️  Heart Rate: ");
  Serial.print(sensorData.heartRate, 0);
  Serial.println(" BPM");
  
  Serial.print("🩸 SpO2: ");
  Serial.print(sensorData.spo2, 0);
  Serial.println("%");
  
  Serial.print("📈 Accel Total: ");
  Serial.print(sensorData.accelTotal, 2);
  Serial.println(" m/s²");
  
  Serial.print("🚨 Fall Alert: ");
  Serial.println(sensorData.fallAlert ? "YES ⚠️" : "No");
  
  Serial.println("========================\n");
}

void sendToAPI() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected");
    return;
  }
  
  // Build JSON
  String json = "{";
  json += "\"timestamp\":" + String(millis()) + ",";
  json += "\"temperature\":" + String(sensorData.temperature, 2) + ",";
  json += "\"heartRate\":" + String(sensorData.heartRate, 0) + ",";
  json += "\"spo2\":" + String(sensorData.spo2, 0) + ",";
  json += "\"accelerometer\":{";
  json += "\"x\":" + String(sensorData.accelX, 2) + ",";
  json += "\"y\":" + String(sensorData.accelY, 2) + ",";
  json += "\"z\":" + String(sensorData.accelZ, 2) + ",";
  json += "\"total\":" + String(sensorData.accelTotal, 2);
  json += "},";
  json += "\"gyroscope\":{";
  json += "\"x\":" + String(sensorData.gyroX, 2) + ",";
  json += "\"y\":" + String(sensorData.gyroY, 2) + ",";
  json += "\"z\":" + String(sensorData.gyroZ, 2);
  json += "},";
  json += "\"fallAlert\":" + String(sensorData.fallAlert ? "true" : "false");
  json += "}";
  
  Serial.println("📤 Sending to API...");
  
  HTTPClient http;
  http.begin(API_ENDPOINT);
  http.addHeader("Content-Type", "application/json");
  
  int httpCode = http.POST(json);
  
  if (httpCode > 0) {
    Serial.print("✅ API Response: ");
    Serial.println(httpCode);
  } else {
    Serial.print("❌ API Error: ");
    Serial.println(http.errorToString(httpCode));
  }
  
  http.end();
}
