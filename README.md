# Sortino

## Inhaltsverzeichnis

- [Kurzbeschreibung des Projekts](#kurzbeschreibung-des-projekts)
- [UX & Konzeption](#ux--konzeption)
- [Setup](#setup)
- [Technische Details](#technische-details)
- [Known bugs](#known-bugs)
- [Umsetzungsprozess](#umsetzungsprozess)

## Kurzbeschreibung des Projekts

* **Modul:** Interaktive Medien 4 an der Fachhochschule Graubünden (FS26)  
* **Themenfeld:** IoT-Applikation zum Thema Eltern mit kleinen Kindern  
* **Name des Projekts:** Sortino   
* **Team Physical Computing:** Carlo Pierotto & Luc Guerraz
* **Team WebApp:** Tim Brönimann, Tim Eberbard

Kinder räumen ungerne ihr Zimmer auf und Eltern haben es gern wenn es am Abend aufgeräumt ist. 
Unsere Kiste motiviert Kinder zum aufräumen, sie erlässt jeden Abend um 18:30 einen Reminder zum aufräumen und um 19:00 einen Lob oder eine Ermahnung ja nach dem ob aufgeräumt worden ist oder nicht.
Die Kiste erkennt Spielzeuge anhand des Gewichts. 
Über die Web-App können die Eltern einsehen, welche Spielzeuge gerade ausserhalb der Kiste sind, und welches die beliebtesten Spielzeuge sind.

\[*Bilder / GIFs (optional)*\]

## UX & Konzeption

*In diesem Teil werden die gemeinsamen Schritte aus der UX-Abgabe dokumentiert, damit sich hier alles vollständig an einem Ort befindet (betrifft WebApp und Physical Computing)*

### Figma:
[Link zum Figma](https://www.figma.com/design/I6OaVpQoHoBlVxiTwrd5Yo/App-Konzeption?node-id=0-1&t=EXwHhpwK3AQBsHQe-1)
### User Flow \+ Screen Flow (Screenshot aus Figma)
![User Flow + Screen Flow](readme-assets/ScreenFlow.png)
### Weitere Ergänzungen

> WEBAPP //
> * *Welche Features waren angedacht?*
UMGESETZTE FEATURES
Die Aktuelle Webapp, so wie sie jetzt steht, enthält die Basis unserer geplanten Features. Die Webapp erlaubt es eine Spielzeugkiste zu haben, die jederzeit weiss, welche Spielzeuge akteull in der Spielzeugkiste sind und welche nicht. Anhand des Gewichts des Spielzeuges erkennt die Kiste, ob ein Speilzeug gerade in der Kiste ist oder nicht. Über die Spielzeug-Seite können die Spielzeuge verwaltet werden. Man kann neue Spielzeuge hinzufügen, ihnen neue Namen geben oder Spielzeuge wieder löschen (wenn man sie z.B. verkauft hat). Dort sieht man ebenfalls einen Überblick über die Nutzungshäufigkeit der Spielzeuge. In den Einstellungen kann ich mein Profil bearbeiten und meinen Haushalt verwalten. Das heisst, ich kann meinem Haushalt Kisten hinzufügen. Auf der Seite sehe ich meinen Haushaltscode mit welchem andere Erziehungsberechtigte meinem Haushalt beitreten können. Diese kann ich in den Einstellungen auch wieder entfernen (z.B. wenn sich die Eltern getrennt haben😢). Die Webapp wie sie jetzt entwickelt ist, ist für die Erziehungsberechtigten entwickelt. Somit kann die Bildschirmzeit der Kinder reduziert werden.

> * Folgende Features wurden nicht umgesetzt:

ERKENNUNG ÜBER RFID
In der ersten Konzeptionsphase war die Idee, die spielzeuge anhand eines RFID-Chips zu erkennen. Über mehrere Antennen hätte die Box das Spielzeug automatisch erkennen sollen, wenn das Spielzeug mit dem Chip in die Box gesetzt wird.

ROLLEN FÜR USER
Im Ursprünglichen System. Eltern erhalten Admin-Rechte für die Web-App. Kinder benötigen nicht zwingend Zugriff auf die Webapp, jedoch ist in der Webapp ersichtlich, welches Kind wie viele Punkte hat (also wie gut es aufträumt). Damit das System funktioniert, hätte die Box nicht einem Haushalt sondern einem User zugewiesen werden müssen. Die Punkte kann das Kind sammeln und gegen Belohnungen einlösen. Weil das Punktesystem wegfiel und Kisten direkt dem Haushalt hinzugefügt wurden, fiel das Rollensystem weg. Kinder können ohne Umstände die Box benutzen während die Eltern Kontrolle über die Box haben.

GAMIFICATION (WEBAPP)
Punkte sammeln:
Jeden Abend um eine vordefinierte Uhrzeit gibt die Box ein Signal, dass es bald Zeit ist, aufzuräumen. Nach ca. 30 Minuten kontrolliert die Webapp automatisch, ob heute Spielzeuge genutzt wurden und ob alle Spielzeuge in der Kiste sind. Wenn zu diesem Zeitpunkt alles aufgeräumt ist, erhält das Kind einen Punkt. Über die Webapp können die Eltern mit ihren Adminrechten im Punkteverlauf ebenfalls Punkte hinzufügen, wenn das Kind z.B. im Haushalt mal ausserordentlich mitgeholfen hat. Die Eltern können dort ebenfalls erhaltene Punkte wieder löschen. Sowohl auf der Webapp wie auch auf dem physischen Display an der Box ist ersichtlich, wie viele Punkte gesammelt wurden und wie nah man an den Belohnungen ist. Dieses Feature wurde gestrichen um den Rahmen des Projektes nicht zu sprengen, weil die Webapp schon genug Features hatte und der Aufwand zu gross geworden wäre.

Punkte einlösen:
Über die Belohnungsseite können die Eltern für einen Haushalt Belohnungen definieren und die Belohnung den Kindern zuweisen. Die Eltern können festlegen, wie viele Punkte eine Belohnung kosten soll. Hat das Kind eine Belohnung eingelöst, müssen es die Eltern über die Webapp einlösen. Die Punkte werden vom aktuellen Punktestand abgezogen. Weil die Gamification weg fiel wurde das Belohnungssystem ebenfalls gestrichen.

GAMIFICATION (BOX)
Lange war geplant, der Box ein Aufräum-Feature zu verpassen. Dabei schlägt die Box vor, welches Spielzueg als nächstes eingeräumt werden sollte. Schafft man es innerhalb einer gweissen Ziet, erhält das Kind zusätzliche Punkte. Z.B. steht "Bring mir als nächstes das Piratenschiff" und ein Countdown. Dabei priorisiert die Box schwere Spielzeuge zuerst (siehe nächstes Feature). Dieses Feature wurde gestrichen um den Rahmen des Projektes nicht zu sprengen, weil die Webapp schon genug Features hatte und der Aufwand zu gross geworden wäre.

KATHEGORIEN FÜR SPIELZEUGE
Ursprünglich war gedacht, dass man beim hinzufügen eines Spielzeuges klassifizierungen geben kann, z.B. ob ein Spielzeug schwer oder fragile ist. In der Aufräum-Gamification hätte die Box priorisieren sollen, zuerst schwere Spielzeuge einzuräumen und erst dann die leichten, welche schnell kaputt gehen können. Weil die Box-Gamification weg fiel, wurde diese Angabe bei den Speilzeugen entfernt. Das gewicht wird lediglich genutzt, weil anhand des Gewichts das jeweilige Spielzeug erkannt wird. Dieses Feature wurde nicht eingebaut, weil die Gamification weg fiel. Die Box musste nicht mehr zwingend wissen, welche Spielzeuge zuerst eingeräumt werden müssen. Deswegen wurde dieses Feature überflüssig.

KONTROLLE ÜBER GAMIFICATION
In der Webapp sollte es in einem Haushalt mehrere Rollen geben. Eltern hätten Admin-Rechte und könnten Einstellungen an der Gamification vornehmen z.B. wie viel Punkte das Kind fürs Aufräumen bekommt, wie viele Punkte eine Belohnung kostet, wann der Stichzeitpunkt wo die Kiste kontrolliert, ob alles versorgt ist und man hätte einstellen können, wie hoch die Toleranz ist, wie viele Spielzeuge über nach draussen bleiben dürfen. Das Kind hätte dann trotzdem einen Punkt erhalten, auch wenn z.B. zwei Spielzeuge nicht eingeräumt sind. Die Gamification hätte man auch vollkommen deaktivieren können. Dann würde das Punktesystem für den Entsprechenden Haushalt deaktiviert sein. Weil die Gamification weg fiel müssen die Game-Settings nicht mehr eingestellt werden.


Für die Spielzeugkiste (Microcontroller) hatten wir ein Gamification-Konzept entwickelt, um das Kind beim Aufräumen zu unterstützen. 
Es hätte das Kind instruiert, welches Spielzeug es als Nächstes in die Kiste legen soll. Dies haben wir nicht umgesetzt, da es den Scope gesprengt hätte.
Auch die Punkte, die man für pünktliches Aufräumen erhalten hätte, haben wir weggelassen, da wir die Belohnungen aus der Webapp aus Zeitgründen gestrichen haben.

## Setup //Luc ist für das Video und diesen Teil verantwortlich

* **WebApp:** [https://im04.tim-broenimann.ch](https://im04.tim-broenimann.ch)  
* **Video-Dokumentation:** [Link zum Video auf Youtube](http://link.zum.video) 

### Installationsanleitung WebApp //Bröner

***verständliche** Schritt-für-Schritt-Anleitung für Aussenstehende, um das Projekt zu klonen und auf einem eigenen Server zu installieren*

1. *Was benötige ich an Infrastruktur?* 
2. *Was muss ich auf meinem Webserver installieren?*  
3. *Wie kann ich die Datenbank importieren?*  
4. *Wo muss ich die DB-Credentials eintragen?*  
5. *…*  
6. *Wie nehme ich das physische Artefakt in Betrieb?*

### Bauanleitung Physical Computing

#### Komponenten //Carlo, Bröner (macht Webapp Teil vom Komponentenplan), Luc macht Server
- ESP32C6
- OLED Display
- MP3 Player mit Lautsprecher
- LED Ring (12 LEDs)
- Gewichtssensor

Der ESP32C6 ist das Kernstück, woran alle Physischen Komponenten verbunden werden.
Im Steckplan sieht man, an welche Pins, welche Komponenten angeschlossen werden.

* ***Was muss ich wie bauen, verbinden, installieren?***  
* *ergänze: **Komponentenplan** (betrifft Physical Computing, vgl. Slides Kapitel 15): Schaubild enthält*  
  * *die eingesetzten Komponenten*  //Carlo
  * *die verbundenen Sensoren und Aktoren*  //Carlo
  * *die Programme (mit Dateinamen)*  //Carlo, Luc
  * *die Kommunikationswege*  //Luc
* *ergänze: **Steckplan** (betrifft Physical Computing, vgl. Slides Kapitel 15): generiert z.B. mit Fritzing (empfohlen), Tinkercad, Wokwi*  
  * *beachtet die [Fritzing Parts](https://github.com/Interaktive-Medien/im_physical_computing/tree/main/15_Intro_Projektdoku) extra für euch*  
* *ggf. **Bildmaterial***

#### Kommunikationswege / API Schnittstellen

##### Kisten status abfragen (`api/physical/lib/get/add.php`)
Wird alle 3 Sekunden abgefragt, um zu wissen ob die Kiste neue Spielzeuge jetzt messen muss
```bash
curl -X GET 'https://im04.tim-broenimann.ch/api/physical/[seriennumer]/add'
```
```json
{
  "status": "success",
  "data": {
    "add_mode": false
  }
}
```

##### Spielzeug hinzufügen, gewicht erfassen (`api/physical/lib/post/add.php`)
Wird abgefragt, um das Gewicht eines neues Spielzeug zu erfassen
```bash
curl -X POST 'https://im04.tim-broenimann.ch/api/physical/[seriennumer]/add' \
  --header 'Content-Type: application/json' \
  --data '{"weight": 140}'
```
```json
{
  "status": "success",
  "data": {
    "name": "Neues Spielzeug Name"
  }
}
```

##### Spielzeug wird in kiste gelegt/herausgenommen (`api/physical/lib/post/event.php`)
Wird abgefragt, um eine Gewichtänderung in der Kiste zu erfassen.
```bash
curl -X POST 'https://im04.tim-broenimann.ch/api/physical/[seriennumer]/event' \
  --header 'Content-Type: application/json' \
  --data '{"weight": 87.0}'
```
```json
{
  "status": "success",
  "data": {
    "name": "Spielzeug Name",
    "movement": 1
  }
}
```

##### Sind alle Spielzeuge in der Kiste (`api/physical/lib/get/status.php`)
Wird abgefragt, um zu wissen ob alle Spielzeuge in der Kiste sind und zu wissen wieviele fehlen/da sind
```bash
curl -X GET 'https://im04.tim-broenimann.ch/api/physical/[seriennumer]/status'
```
```json
{
  "status": "success",
  "data": {
    "all_in_box": true,
    "in_box": 14,
    "out_box": 0
  }
}
```

## Technische Details //Luc

// Hier sollte das Verständnis ersichtlich sein / Wie stehen die Dateien in Beziehung zueinander, Wie reden Die Dateien miteinander, Wie ist der Weg der Daten

### Projektstruktur / Code-Struktur \[*Hinweis: Der Code selbst muss im Repository liegen und im Kopfbereich jeder Datei eine kurze Zusammenfassung enthalten.*\] 

TB: !!!!!!!! --> Kopfbereich
```
.
├── api                                         ← Alle Backend-Endpoints (geben JSON zurück)
│   ├── physical                                ← Microcontroller Endpoints
│   │   ├── lib                                 ← Programm Code
│   │   │   ├── get                             ← alle GET Methoden
│   │   │   │   ├── add.php                     ← Kisten "add_mode" Status laden
│   │   │   │   └── status.php                  ← Kisten Inhalt Status laden
│   │   │   ├── post                            ← alle POST Methoden
│   │   │   │   ├── add.php                     ← Spielzeug Gewicht erfassen
│   │   │   │   └── event.php                   ← Kiste Gewichtänderung verarbeiten
│   │   │   └── .htaccess                       ← verbeitet direkter Zugang zur lib
│   │   ├── .htaccess                           ← leitet alle Anfragen auf index.php
│   │   └── index.php                           ← vorsortiert Anfragen und führt Code der lib aus
│   ├── add_toy.php                             ← xy...
│   ├── auth.php                                ← xy...
│   ├── dashboard.php                           ← xy...
│   ├── household.php                           ← xy...
│   ├── login.php                               ← xy...
│   ├── logout.php                              ← xy...
│   ├── name_toy.php                            ← xy...
│   ├── new_box.php                             ← xy...
│   ├── newhousehold.php                        ← xy...
│   ├── profil.php                              ← xy...
│   ├── profilUpdate.php                        ← xy...
│   ├── register.php                            ← xy...
│   ├── settings.php                            ← xy...
│   ├── toy.php                                 ← xy...
│   └── toyUpdate.php                           ← xy...
├── css                                         ← xy...
│   ├── desktop.css                             ← xy...
│   ├── master.css                              ← xy...
│   └── mobile.css                              ← xy...
├── images                                      ← xy...
│   ├── nav                                     ← xy...
│   │   ├── nav_gifts.svg                       ← xy...
│   │   ├── nav_home.svg                        ← xy...
│   │   ├── nav_points.svg                      ← xy...
│   │   ├── nav_settings.svg                    ← xy...
│   │   └── nav_toys.svg                        ← xy...
│   ├── DEMO_toy_loeschen.png                   ← xy...
│   ├── DEMO_toy_update.png                     ← xy...
│   ├── sortino_bildmarke.png                   ← xy...
│   ├── sortino_favicon.png                     ← xy...
│   ├── sortino_marke.png                       ← xy...
│   └── sortino_textmarke.png                   ← xy...
├── js                                          ← xy...
│   ├── add_toy.js                              ← xy...
│   ├── auth.js                                 ← xy...
│   ├── dashboard.js                            ← xy...
│   ├── data.js                                 ← xy...
│   ├── join_household.js                       ← xy...
│   ├── login.js                                ← xy...
│   ├── logout.js                               ← xy...
│   ├── name_toy.js                             ← xy...
│   ├── new_box.js                              ← xy...
│   ├── new_household.js                        ← xy...
│   ├── profil.js                               ← xy...
│   ├── register.js                             ← xy...
│   ├── settings.js                             ← xy...
│   └── toy.js                                  ← xy...
├── pysical                                     ← Alles für das Microcontroller
│   ├── 3D Druck
│   │   └── 3d Druck.3mf                        ← 3D Model für die Kiste
│   ├── Audios                                  ← Audios für die SD Karte der Audio Interface
│   │   ├── 01.mp3
│   │   ├── 02.mp3
│   │   └── 03.mp3
│   └── sortino_OS                              ← Arduino Projekt
│       ├── cJSON                               ← Arduino Libraries
│       │   ├── cJSON.c                         ← Arduino Libraries
│       │   ├── cJSON.h                         ← Arduino Libraries
│       │   └── LICENSE                         ← Arduino Libraries
│       ├── Adafruit_BusIO_Register.cpp         ← Arduino Libraries
│       ├── Adafruit_BusIO_Register.h           ← Arduino Libraries
│       ├── Adafruit_GenericDevice.cpp          ← Arduino Libraries
│       ├── Adafruit_GenericDevice.h            ← Arduino Libraries
│       ├── Adafruit_GFX.cpp                    ← Arduino Libraries
│       ├── Adafruit_GFX.h                      ← Arduino Libraries
│       ├── Adafruit_I2CDevice.cpp              ← Arduino Libraries
│       ├── Adafruit_I2CDevice.h                ← Arduino Libraries
│       ├── Adafruit_I2CRegister.h              ← Arduino Libraries
│       ├── Adafruit_NeoPixel.cpp               ← Arduino Libraries
│       ├── Adafruit_NeoPixel.h                 ← Arduino Libraries
│       ├── Adafruit_SPIDevice.cpp              ← Arduino Libraries
│       ├── Adafruit_SPIDevice.h                ← Arduino Libraries
│       ├── Adafruit_SSD1306.cpp                ← Arduino Libraries
│       ├── Adafruit_SSD1306.h                  ← Arduino Libraries
│       ├── Arduino_JSON.h                      ← Arduino Libraries
│       ├── audioplayer.h                       ← Arduino Libraries
│       ├── esp.c                               ← Arduino Libraries
│       ├── gfxfont.h                           ← Arduino Libraries
│       ├── glcdfont.c                          ← Arduino Libraries
│       ├── HX711.cpp                           ← Arduino Libraries
│       ├── HX711.h                             ← Arduino Libraries
│       ├── JSON.cpp                            ← Arduino Libraries
│       ├── JSON.h                              ← Arduino Libraries
│       ├── JSONVar.cpp                         ← Arduino Libraries
│       ├── JSONVar.h                           ← Arduino Libraries
│       ├── sortino_OS.ino                      ← Microcontroller Code 
│       └── splash.h                            ← Arduino Libraries
├── readme-assets                               ← Bilder für das ReadMe
│   ├── ERM.png
│   ├── ScreenFlow.png
│   └── Steckplan.png
├── system                                      ← xy...
│   ├── config.php                              ← xy...
│   ├── config.php.blank                        ← xy...
│   └── db.sql                                  ← xy...
├── .gitattributes
├── .gitignore
├── add_toy.html                                ← xy...
├── household.html                              ← xy...
├── index.html                                  ← xy...
├── join_household.html                         ← xy...
├── login.html                                  ← xy...
├── name_toy.html                               ← xy...
├── new_box.html                                ← xy...
├── new_household.html                          ← xy...
├── profil.html                                 ← xy...
├── README.md                                   ← Github ReadMe
├── register.html                               ← xy...
├── settings.html                               ← xy...
└── toys.html                                   ← xy...
```

### Datenschnittstelle //Luc
Die `toy_events` und `boxes` Tabellen dienen zur Schnittstelle zwischen das Microcontroller und der Webapp.

Wenn ein Spielzeug aus der Kiste genommen wird, wird ein Eintrag in der `toy_events` Tabelle gemacht.

Wenn man in der App ein neues Spielzeug erfassen will, wird in der `boxes` Tabelle der `add_mode` auf `true` gesetzt, und ein neuer Eintrag in der `toys` Tabelle erstellt, mit einem `weight` von `0`. Wenn 15s nichts in die Box gelegt wird, bricht die App den Vorgang ab. 
Der MC fragt alle drei Sekunden dem Server nach ob die Kisten im add_mode ist, und wenn ja erfasst es das neue Gewicht im `toy` Eintrag von vorher.

### ERM //Luc
![ERM Diagramm](readme-assets/ERM.png) 
- **households**
  - Zentrale Tabelle für Haushalte/Familien
  - Attribute:
    - `id`
    - `name`
    - `code`
  - Beziehung:
    - Ein Haushalt kann mehrere Benutzer, Kisten und Belohnungen besitzen.

- **users**
  - Speichert Benutzer eines Haushalts
  - Attribute:
    - `id`
    - `email`
    - `password`
    - `firstname`
    - `lastname`
    - `household_id`
  - Beziehung:
    - Mehrere Benutzer gehören zu einem Haushalt.

- **boxes**
  - Speichert Spielzeugkisten eines Haushalts
  - Attribute:
    - `id`
    - `serialnumber`
    - `name`
    - `add_mode`
    - `household_id`
  - Beziehung:
    - Ein Haushalt kann mehrere Kisten besitzen.

- **toys**
  - Speichert Spielzeuge innerhalb einer Kiste
  - Attribute:
    - `id`
    - `name`
    - `weight`
    - `household_id`
  - Beziehung:
    - Ein Haushalt kann mehrere Spielzeuge enthalten.

- **toys_events**
  - Speichert Aktionen/Ereignisse zu Spielzeugen
  - Attribute:
    - `id`
    - `timestamp`
    - `movement`
    - `toy_id`
    - `box_id`
  - Beziehung:
    - Ein Spielzeug kann mehrere Events besitzen.

- **rewards**
  - Speichert Belohnungen eines Haushalts
  - Attribute:
    - `id`
    - `name`
    - `cost`
    - `pinned`
    - `used`
    - `household_id`
  - Beziehung:
    - Ein Haushalt kann mehrere Belohnungen besitzen.

- **reward_events**
  - Speichert ausgelöste Belohnungsereignisse und Punkte
  - Attribute:
    - `id`
    - `trigger`
    - `points`
    - `timestamp`
    - `household_id`
    - `reward_id`
  - Beziehung:
    - Verknüpft Boxen mit Belohnungen und dokumentiert Punkte/Ereignisse.
### Authentifizierung \[*Erklärung*\]

## Known bugs //Alle

--> Wenn User sich selber aus DB löscht, ist er immernoch in dem Haushalt und wird nicht ausgeloggt

!!!!!!!!!!!!!



* Was funktioniert noch nicht einwandfrei?  
* Was ist uns aufgefallen bei der Entwicklung?  
* Was könnte noch verbessert werden?

## Umsetzungsprozess //Alle

!!!!!!!!!!!!!!

* **Reflexion / Erfahrung / Lernfortschritt:** *Was haben wir gelernt? Würden wir es nochmal genauso machen? Was war gut, was war schlecht?*  
* **Herausforderungen & Lösungen:** \[*Verworfene Ansätze, Fehler, Umplanungen*\]  
* **KI-Einsatz:** *Dokumentation der verwendeten KI-Tools und deren Nutzen (KI ist nicht verboten)*  
* **Fazit:** …
