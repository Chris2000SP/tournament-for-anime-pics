---
title: "Hifi Audiophile Sound Und Linux"
date: 2025-12-17T03:40:57+01:00
draft: false
tags: ["posts", "neu", "linux", "audio", "hifi", "audiophile"]
categories: ["Audio"]
layout: "posts"  # Verweis auf ein Layout (falls du mehrere Layouts hast)
---
# Hifi Audiophile Sound und Linux
## Zunächst Linux, weil pipewire mist gemacht hat, etwas gefixt werden.
### Pipewire Fixen für Audiophile Audio ausgabe:
Code Blöcke  

```    $ mkdir -p ~/.config/pipewire  
$ cp /usr/share/pipewire/pipewire.conf ~/.config/pipewire  
$ cd ~/.config/pipewire  
$ nano pipewire.conf  
```  

### Datei pipewire.conf bearbeiten
Dann muss aber bei folgender Stelle auskommentiert und die Reihenfolge geändert werden:
```
default.clock.rate = 192000
default.clock.allowed-rates = [ 192000 176400 96000 88200 48000 44100 ]
```
Jetzt **Strg + X** dann **Enter** und auf **Y** oder **J** (je nach Spracheinstellung) um nano speichern und beenden zu lassen.  

*Das die Reihenfolge wichtig ist, muss ich betonen, weil wenn diese nicht Korrekt ist,  
Nimmt Pipewire immer das Erst Beste und macht damit weiter.*
## Fertig
Dann pipewire neustarten oder, wer nicht weiß wie das geht, einmal neu Anmelden oder Reboot.  
Jetzt sollte Standardmäßig das Höchste verwendet werden.  
  
## Werde noch etwas zu meinem Qudelix Posten und noch was zu EasyEffects
Post kommt.