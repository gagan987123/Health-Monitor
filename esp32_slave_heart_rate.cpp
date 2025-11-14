#include <Wire.h>
#include "MAX30100_PulseOximeter.h"

// Pin Definitions
#define MAX30100_SDA 21
#define MAX30100_SCL 22

// Serial Communication Pins (UART2)
#define RXD2 32  // Connect to ESP32 #1 TX (GPIO 33)
#define TXD2 33  // Connect to ESP32 #1 RX (GPIO 32)

// PulseOximeter object
PulseOximeter pox;

// Variables
float heartRate = 0;
float spO2 = 0;
bool fingerDetected = false;
unsigned long lastBeat = 0;

// Timing
unsigned long lastRead = 0;
unsigned long lastSend = 0;
const long readInterval = 1000;  // 1 second
const long sendInterval = 1000;  // Send every 1 second

// Callback for when a heartbeat is detected
void onBeatDetected() {
  lastBeat = millis();
  Serial.print("💓");
}

void setup() {
  Serial.begin(115200);   // USB Serial for debugging
  Serial2.begin(9600, SERIAL_8N1, RXD2, TXD2);  // UART2 to send to ESP32 #1
  delay(1000);
  
  Serial.println("🚀 ESP32 #2 (Slave) - Heart Rate Sensor");
  Serial.println("========================================");
  
  // Initialize I2C for MAX30100
  Wire.begin(MAX30100_SDA, MAX30100_SCL);
  
  // Initialize MAX30100
  if (!pox.begin()) {
    Serial.println("❌ Failed to initialize MAX30100");
    while (1) delay(10);
  }
  
  // Configure MAX30100
  pox.setIRLedCurrent(MAX30100_LED_CURR_50MA);
  pox.setOnBeatDetectedCallback(onBeatDetected);
  
  Serial.println("✅ MAX30100 initialized");
  Serial.println("========================================");
  Serial.println("Place your finger on the sensor...\n");
}

void loop() {
  pox.update();
  unsigned long currentMillis = millis();
  
  // Check for finger placement
  bool newFingerDetected = (pox.getHeartRate() > 0 || pox.getSpO2() > 0);
  
  if (newFingerDetected != fingerDetected) {
    fingerDetected = newFingerDetected;
    if (fingerDetected) {
      Serial.println("👆 Finger detected! Hold still...");
    } else {
      Serial.println("👋 Finger removed!");
      heartRate = 0;
      spO2 = 0;
    }
  }
  
  // Read data every second
  if (currentMillis - lastRead >= readInterval) {
    heartRate = pox.getHeartRate();
    spO2 = pox.getSpO2();
    
    // Validate readings
    if (heartRate < 30 || heartRate > 250) heartRate = 0;
    if (spO2 < 70 || spO2 > 100) spO2 = 0;
    
    lastRead = currentMillis;
    
    // Display on local serial
    if (fingerDetected) {
      Serial.print("❤️  BPM: ");
      Serial.print(heartRate, 0);
      Serial.print("  |  🩸 SpO2: ");
      Serial.print(spO2, 0);
      Serial.println("%");
    }
  }
  
  // Send data to ESP32 #1 every second
  if (currentMillis - lastSend >= sendInterval) {
    sendToMaster();
    lastSend = currentMillis;
  }
  
  delay(10);
}

void sendToMaster() {
  // Send data in format: "HR:75,SPO2:98\n"
  String data = "HR:" + String(heartRate, 0) + ",SPO2:" + String(spO2, 0) + "\n";
  Serial2.print(data);
  
  // Debug: show what we're sending
  Serial.print("📤 Sent to Master: ");
  Serial.print(data);
}
