#ifndef AUDIOPLAYER_H
#define AUDIOPLAYER_H

#include <Arduino.h>

// Neue Verkabelung:
// ESP GPIO21 (gelb)  -> MP3 RX
// ESP GPIO22 (grün)  -> MP3 TX
// ESP GPIO23 (türkis)-> Transistor-Basis für MP3-GND
HardwareSerial myMP3(1);

#define RX_PIN 21
#define TX_PIN 22
#define MP3_GND_CONTROL_PIN 23
#define PLAYER_BAUD 9600

#define PLAY_W_INDEX 0x41
#define SET_VOLUME   0x31
#define SEL_DEV      0x35
#define DEV_TF       0x01

// 5-Byte-Befehl: 7E 03 CMD DATA EF
void sendMP3Command5(uint8_t command, uint8_t data) {
  uint8_t sendBuf[5] = {
    0x7e,
    0x03,
    command,
    data,
    0xef
  };

  myMP3.write(sendBuf, 5);
  delay(100);
}

// 6-Byte-Befehl: 7E 04 CMD DATA_H DATA_L EF
void sendMP3Command6(uint8_t command, uint16_t data) {
  uint8_t sendBuf[6] = {
    0x7e,
    0x04,
    command,
    (uint8_t)(data >> 8),
    (uint8_t)(data & 0xff),
    0xef
  };

  myMP3.write(sendBuf, 6);
  delay(100);
}

void initAudioPlayer() {
  pinMode(MP3_GND_CONTROL_PIN, OUTPUT);

  // Player zuerst sauber einschalten
  digitalWrite(MP3_GND_CONTROL_PIN, HIGH);
  delay(1000);

  myMP3.begin(PLAYER_BAUD, SERIAL_8N1, RX_PIN, TX_PIN);

  Serial.println("audio player starting...");

  // SD-Karte auswählen
  sendMP3Command5(SEL_DEV, DEV_TF);
  delay(300);

  // Lautstärke 0 bis 30
  sendMP3Command5(SET_VOLUME, 30);
  delay(300);

  Serial.println("audio player ready");
}

void playTrack(int trackNumber) {
  if (trackNumber < 1) return;

  sendMP3Command6(PLAY_W_INDEX, (uint16_t)trackNumber);
}

#endif