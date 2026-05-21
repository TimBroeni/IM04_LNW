/*
Das hier ist das Betriebssystem für sortino.
Dieses Projekt wurde im Rahmen vom Modul Interaktive Medien 4 von Tim Brönimann, Tim Eberhard, Luc Guerraz und Carlo Pierotto realisiert.
Benutzt wird ein ESP32c6
Der OLED Display wird SCL an pin 7 und SCA an pin 6 angeschlossen
Die Waage wird SCK an pin 5 und DT an pin 4 angeschlossen
Der NeoPixel Ring ist an Pin 10 angeschlossen
*/

//Verwendete Bibliotheken
#include "HX711.h" //Waage
#include <Adafruit_GFX.h> //OLED
#include <Adafruit_SSD1306.h> //OLED
#include <WiFi.h> //WIFI
#include <Wire.h> //WIFI
#include "time.h" //Zeit
#include <HTTPClient.h> //HTTP
#include <Arduino_JSON.h> //JSON
#include <Adafruit_NeoPixel.h> //LED Ring
#include "audioplayer.h" // <--- NEU: Audio Player einbinden

// WLAN Zugangsdaten
const char* ssid     = "tinkergarden";
const char* password = "strenggeheim";

const String serialNumber = "xy-xy-xy";
const String baseURL = "https://im04.tim-broenimann.ch/api/physical/";

// API Endpunkte
const String eventServerURL = baseURL + serialNumber + "/event";
const String statusServerURL = baseURL + serialNumber + "/status";
const String addServerURL = baseURL + serialNumber + "/add";

// Variablen für die Zeitsteuerung des Aufräum-Reminders
int letzteGepruefteMinute = -1;
bool tagesFazitGezogen = false;

// Variablen für den Add-Modus
unsigned long letzterAddCheck = 0;
const unsigned long ADD_CHECK_INTERVALL = 3000; // Alle 3 Sekunden abfragen
bool isAddMode = false;

// Zeit (NTP Server)
const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = 3600;      // UTC +1 (Winterzeit) = 3600 Sek.
const int   daylightOffset_sec = 3600; // Sommerzeit-Offset

// Pins der Waage
const int LOADCELL_DOUT_PIN = 4;
const int LOADCELL_SCK_PIN = 5;

//OLED definieren
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

//Waage initiieren
HX711 scale;

// NeoPixel Ring definieren
#define PIN_NEOPIXEL 10 
#define NUMPIXELS 12 
Adafruit_NeoPixel pixels(NUMPIXELS, PIN_NEOPIXEL, NEO_GRB + NEO_KHZ800);

// Variablen für die LED-Animation
bool showGreenLight = false;
unsigned long greenLightStart = 0;
const unsigned long GREEN_LIGHT_DURATION = 3000; // 3 Sekunden grün leuchten synchron zum Display

// Variablen für die "Lade-Animation" (Blauer Kreis im Add-Modus)
int currentPixel = 0;
unsigned long lastPixelUpdate = 0;
const unsigned long PIXEL_SPEED = 80; // Geschwindigkeit des blauen Punktes

// --- Variablen für die automatische Gewichtserkennung ---
float letztesGesendetesGewicht = 0.0;
float letzterMesswert = 0.0;
unsigned long stabilisierungsTimer = 0;

// Einstellungen für die Auslösung 
const float MIN_GEWICHTS_AENDERUNG = 5.0; // Ab 5g Unterschied wird gesendet
const float RAUSCH_TOLERANZ = 2.0;        // Schwankungen unter 2g beim Hantieren ignorieren
const unsigned long STABILISIERUNGS_ZEIT = 1500; // 1500 Millisekunden muss das Gewicht ruhig liegen

// Funktionsprototypen
void sendWeightToAPI(float weight);
void zeigeReminder(String zeile1, String zeile2, String zeile3);
bool checkAufraeumStatus();
bool checkAddMode();
void sendNewToyToAPI(float weight);
void fillRing(uint8_t r, uint8_t g, uint8_t b);
void triggerGreenLight();

void setup() {
  //Serial Monitor initiieren
  Serial.begin(115200);

  // <--- NEU: Audio Player starten --->
  initAudioPlayer();

  // LEDs starten
  pixels.begin(); 
  pixels.setBrightness(20); 
  pixels.clear();
  pixels.show();
  
  //Display starten (I2C Pins 6 und 7 für ESP32)
  Wire.begin(6, 7);
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("Display Fehler!");
    while(true);
  }
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.display();

  // WLAN verbinden
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 35);
    display.print("WIFI nicht verbunden!");
    display.display();
  }
  
  //Waage starten
  Serial.println("Waage wird initialisiert...");
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 10);
  display.print("sortino wird tariert");
  display.setCursor(0, 35);
  display.print("Nichts auflegen!");
  display.display();
  delay(100);
    
  Serial.println("Waage wird tariert. Bitte nichts auflegen!");
  scale.tare();
  Serial.println("Tarieren abgeschlossen.");
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 10);
  display.print("sortino");
  display.setCursor(0, 35);
  display.print("Tarierung beendet");
  display.display();
  delay(1000);
    
  //Zeit-Einstellungen laden
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
}

void loop() {

  // ---------------- LED Steuerung (ohne delay) ----------------
  // 1. Wenn das grüne Licht aktiv ist, abwarten bis die Zeit abgelaufen ist
  if (showGreenLight) {
    if (millis() - greenLightStart >= GREEN_LIGHT_DURATION) {
      showGreenLight = false;
      pixels.clear();
      pixels.show();
    }
  } 
  // 2. Ansonsten: Wenn wir im Add-Modus sind, blauen Kreis animieren
  else if (isAddMode) {
    if (millis() - lastPixelUpdate >= PIXEL_SPEED) {
      lastPixelUpdate = millis();
      
      pixels.clear();
      pixels.setPixelColor(currentPixel, pixels.Color(0, 150, 255)); // Blau
      pixels.show();
      
      currentPixel++;
      if (currentPixel >= NUMPIXELS) {
        currentPixel = 0;
      }
    }
  } 
  // 3. Ansonsten: LEDs einfach ausschalten (Normalzustand)
  else {
    pixels.clear();
    pixels.show();
  }
  // -------------------------------------------------------------

  //------------------------------------------------Zeit auf Display--------------------------------------------------
  static unsigned long letzteDisplayZeit = 0;
  if (millis() - letzteDisplayZeit >= 1000) {
    letzteDisplayZeit = millis();
    struct tm timeinfo;
    if(getLocalTime(&timeinfo)) {
      
      // Nur die normale Uhrzeit zeichnen, wenn wir nicht im Add-Modus sind
      if (!isAddMode) {
        display.clearDisplay();
        display.setTextSize(1);
        display.setCursor(0, 10);
        display.printf("%02d.%02d.%04d", timeinfo.tm_mday, timeinfo.tm_mon + 1, timeinfo.tm_year + 1900);

        display.setTextSize(2);
        display.setCursor(0, 35);
        display.printf("%02d:%02d:%02d", timeinfo.tm_hour, timeinfo.tm_min, timeinfo.tm_sec);
        display.display();
      }

      // ---------------- Aufräum-Kontrolle ----------------
      int stunde = timeinfo.tm_hour;
      int minute = timeinfo.tm_min;

      // Um Mitternacht die Variablen für den nächsten Tag zurücksetzen
      if (stunde == 0) {
        tagesFazitGezogen = false;
        letzteGepruefteMinute = -1;
      }

      // 1. Zuerst prüfen: Ist es genau 19:00 Uhr? (Finales Fazit)
      if (stunde == 19 && minute == 00) {
        if (!tagesFazitGezogen) { 
          tagesFazitGezogen = true; 
          if (checkAufraeumStatus()) {
            playTrack(3); // <--- NEU: Erfolgs-Sound abspielen
            zeigeReminder("Bravo,", "du hast", "aufgeraeumt!");
          } else {
            playTrack(1); // <--- NEU: Schade-Sound abspielen
            zeigeReminder("Schade,", "du hast heute", "nicht aufgeraeumt.");
          }
        }
      } 
      // 2. Ansonsten: Ist es zwischen 18:30 und 18:55? (Normale Erinnerung)
      else if (stunde == 18 && minute >= 30) {
        if (minute % 5 == 0 && minute != letzteGepruefteMinute) {
          letzteGepruefteMinute = minute; 
          if (!checkAufraeumStatus()) {
            playTrack(2); // <--- NEU: Erinnerungs-Sound abspielen
            zeigeReminder("Bitte", "raeume deine", "Spielsachen auf!");
          }
        }
      }
      // ---------------------------------------------------------
    } 
  } 

  //------------------------------------------------Add-Mode Abfrage--------------------------------------------------
  if (millis() - letzterAddCheck >= ADD_CHECK_INTERVALL) {
    letzterAddCheck = millis();
    isAddMode = checkAddMode();
    
    // Wenn der Modus aktiv ist, auf dem Display anzeigen
    if (isAddMode) {
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 10);
      display.print("Lern-Modus aktiv!");
      display.setCursor(0, 35);
      display.print("Neues Spielzeug");
      display.setCursor(0, 50);
      display.print("jetzt auflegen...");
      display.display();
    }
  }

  //------------------------------------------------Automatische Gewichtserkennung--------------------------------------------------
  if (scale.is_ready()) {
    // Nur 3 Messungen abfragen, damit der Loop schnell bleibt
    long reading = scale.get_value(3);
    float aktuellesGewicht = reading / 426.0;

    // 1. Prüfen, ob sich das Gewicht gerade stark bewegt
    if (abs(aktuellesGewicht - letzterMesswert) > RAUSCH_TOLERANZ) {
      stabilisierungsTimer = millis(); // Objekt wird gerade bewegt, Timer neu starten
      letzterMesswert = aktuellesGewicht;
    } 
    // 2. Das Gewicht bewegt sich nicht mehr
    else {
      // Ist es schon lange genug ruhig?
      if ((millis() - stabilisierungsTimer) > STABILISIERUNGS_ZEIT) {
        
        // Differenz zum zuletzt gesendeten Zustand berechnen
        float differenz = aktuellesGewicht - letztesGesendetesGewicht;

        // 3. Prüfen, ob die Differenz gross genug für einen API-Call ist
        if (abs(differenz) >= MIN_GEWICHTS_AENDERUNG) {
          
          Serial.print("Differenz erkannt: ");
          Serial.println(differenz);

          // ------ Unterscheidung zwischen Add-Modus und Normal-Modus ------
          if (isAddMode && differenz > 0) { 
            // Es wurde etwas aufgelegt und Add-Modus ist an
            sendNewToyToAPI(differenz);
            isAddMode = false; // Nach dem Erfassen lokal wieder ausschalten
          } else {
            // Normaler Modus
            sendWeightToAPI(differenz);
          }
          
          // Das neue Gewicht als Grundwert für die nächste Messung speichern
          letztesGesendetesGewicht = aktuellesGewicht;
          
          // 3 Sekunden warten, damit man das Display ablesen kann
          // Das friert auch das grüne Licht für exakt 3 Sekunden ein, was super aussieht!
          delay(3000);
          
          // Danach den Timer resetten, um Doppelauslösungen zu verhindern
          stabilisierungsTimer = millis(); 
        }
      }
    }
  }
}

// ===================================================================================================
// HILFSFUNKTIONEN FÜR LEDS
// ===================================================================================================

// Füllt den ganzen Ring in einer bestimmten Farbe
void fillRing(uint8_t r, uint8_t g, uint8_t b) {
  for(int i=0; i<NUMPIXELS; i++) {
    pixels.setPixelColor(i, pixels.Color(r, g, b));
  }
  pixels.show();
}

// Löst das grüne Leuchten aus
void triggerGreenLight() {
  showGreenLight = true;
  greenLightStart = millis();
  fillRing(0, 255, 0); // Grün
}


// ===================================================================================================
// HILFSFUNKTIONEN FÜR APIS UND DISPLAY
// ===================================================================================================

// Funktion zum Senden des Gewichts an die API und Auswerten der Antwort (Normaler Modus)
void sendWeightToAPI(float weight) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(eventServerURL);
    
    http.addHeader("Content-Type", "application/json");

    JSONVar dataObject;
    dataObject["weight"] = weight; 
    String jsonString = JSON.stringify(dataObject);

    Serial.print("Sende JSON an API: ");
    Serial.println(jsonString);

    int httpResponseCode = http.POST(jsonString);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.printf("Erfolgreich! Code: %d\n", httpResponseCode);
      Serial.println("Antwort der API: " + response);

      JSONVar responseObject = JSON.parse(response);

      if (JSON.typeof(responseObject) == "undefined") {
        Serial.println("Fehler beim Parsen der API-Antwort!");
      } else {
        String itemName = (const char*) responseObject["data"]["name"];
        int movement = (int) responseObject["data"]["movement"];

        // Prüfen, ob der Artikel erkannt wurde (Name nicht leer und nicht "null")
        if (itemName != "" && itemName != "null") {
          String aktion = (movement == 0) ? "herausgenommen" : "hereingelegt";

          // Wenn der Artikel HEREINGELEGT (movement == 1) wurde, grün leuchten lassen
          if (movement == 1) {
            triggerGreenLight();
          }

          display.clearDisplay();
          display.setTextSize(1);
          display.setCursor(0, 5);
          display.print("Du hast:");
          
          display.setTextSize(1);
          display.setCursor(0, 20);
          display.print(itemName);
          
          display.setTextSize(1);
          display.setCursor(0, 45);
          display.print(aktion);
          
          display.display();
        } else {
          Serial.println("Artikel nicht erkannt. OLED bleibt unverändert.");
        }
      }
    } else {
      Serial.printf("Fehler beim Senden. Code: %d\n", httpResponseCode);
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 25);
      display.print("API Fehler!");
      display.display();
    }
    http.end();
  } else {
    Serial.println("Senden fehlgeschlagen: WLAN nicht verbunden!");
  }
}

// Funktion, um das NEUE Spielzeug an die API zu senden (Lern-Modus)
void sendNewToyToAPI(float weight) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(addServerURL); 
    
    http.addHeader("Content-Type", "application/json");

    JSONVar dataObject;
    dataObject["weight"] = weight; 
    String jsonString = JSON.stringify(dataObject);

    Serial.print("Sende NEUES Spielzeug an API: ");
    Serial.println(jsonString);

    int httpResponseCode = http.POST(jsonString);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.printf("Erfolgreich! Code: %d\n", httpResponseCode);
      Serial.println("Antwort der API: " + response);

      // JSON Antwort parsen
      JSONVar responseObject = JSON.parse(response);

      if (JSON.typeof(responseObject) == "undefined") {
        Serial.println("Fehler beim Parsen der API-Antwort!");
        
        // Fallback, falls das JSON nicht gelesen werden konnte
        triggerGreenLight();
        
        display.clearDisplay();
        display.setTextSize(1);
        display.setCursor(0, 20);
        display.print("Spielzeug");
        display.setCursor(0, 40);
        display.print("gespeichert!");
        display.display();
      } else {
        // Name aus dem JSON lesen 
        String itemName = (const char*) responseObject["data"]["name"];
        
        triggerGreenLight();
        
        // Auf dem Display anzeigen
        display.clearDisplay();
        display.setTextSize(1);
        display.setCursor(0, 5);
        display.print("Neu erfasst:");
        
        display.setTextSize(1);
        display.setCursor(0, 25);
        display.print(itemName); 
        
        display.setTextSize(1);
        display.setCursor(0, 50);
        display.print("gespeichert!");
        display.display();
      }
    } else {
      Serial.printf("Fehler beim Erfassen. Code: %d\n", httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("Senden fehlgeschlagen: WLAN nicht verbunden!");
  }
}

// Funktion, um eine Nachricht kurz auf dem OLED anzuzeigen
void zeigeReminder(String zeile1, String zeile2, String zeile3) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 10);
  display.print(zeile1);
  display.setCursor(0, 30);
  display.print(zeile2);
  display.setCursor(0, 50);
  display.print(zeile3);
  display.display();
  delay(5000); 
}

// Funktion, um den Status abzufragen (GET - Aufräumkontrolle)
bool checkAufraeumStatus() {
  bool istAufgeraeumt = false;
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(statusServerURL);
    int httpResponseCode = http.GET();

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Status API Antwort: " + response);
      JSONVar responseObject = JSON.parse(response);

      if (JSON.typeof(responseObject) != "undefined") {
        istAufgeraeumt = (bool) responseObject["data"]["all_in_box"]; 
      }
    } else {
      Serial.printf("Fehler beim Status-Abruf. Code: %d\n", httpResponseCode);
    }
    http.end();
  }
  return istAufgeraeumt;
}

// Funktion, um zu prüfen, ob ein neues Spielzeug hinzugefügt werden soll (GET)
bool checkAddMode() {
  bool mode = false;
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(addServerURL);
    int httpResponseCode = http.GET();

    if (httpResponseCode > 0) {
      String response = http.getString();
      JSONVar responseObject = JSON.parse(response);

      if (JSON.typeof(responseObject) != "undefined") {
        mode = (bool) responseObject["data"]["add_mode"]; 
      }
    }
    http.end();
  }
  return mode;
}