+++
date = '2025-12-25T13:28:50+01:00' # 2025-12-17T04:45:18+01:00
draft = false
title = 'Lokal Vibecoding und LLMs Laufen lassen'
tags = ["posts", "neu", "LLM", "KI", "AI", "Lokal", "local"]
categories = ["Linux"]
layout = "posts"
[sitemap]
  changefreq = 'daily'
  disable = false
  priority = 0.8
+++
# Echtes und Gutes Lokales LLM laufen lassen
## Vibecoding Lokal
### devstral-small-2:latest
Mein erstes LLM das ich **Lokal Laufen lassen** kann, das wirklich ernst zu nehmend Coden Kann und
in meiner **AMD Radeon RX 6800 XT** (Powercolor) in den VRAM Rein Passt, ist **devstral-small-2:latest**.

### Installieren der Software
Wie habe ich das gemacht? Naja, einfach Ollama installiert. Naja, die Vulkan Variante davon aus der Arch Linux Packetverwaltung. Damit läuft alles an LLMs auf GPU, was in den VRAM Rein passt.

Man benötigt für ein Webinterface dazu noch ein Open-WebUI, das man auch aus der Packetverwaltung speziell im AUR: aur/open-webui bekommen kann. Damit läuft es praktisch Sofort, nach dem man sich darum bemüht hat, die Service zum Laufen zu bringen.

Wichtig ist, das ```ollama.service``` läuft. Dann läuft dieser auf ```localhost:11434``` das man bei **Open-WebUI** eintragen muss. In Administration -> Einstellungen -> Verbindungen und dort bei Ollama-API eintragen. Schon läuft eine Lokale KI, sobald man eines Heruntergeladen hat, das man auch in diesem Webinterface direkt laden Kann.

### Herunterladen des Modells
Da wir ja schon in den Einstellungen waren, unter **Verbindungen** befindet sich das **Modelle** Menü, in dem wir genau das tun können. Da ist ein Download Knopf, ganz Rechts neben dem Zahnrad, wo wir drauf klicken. Da können wir jetzt in **Modell von Ollama.com beziehen** ```devstral-small-2:latest``` eingeben und drücken rechts daneben den Downlaod Knopf. Das Backend Service ollama.service übernimmt den Download und Open-WebUI macht einfach so weiter. Wenn du schon ein Modell hast, kannst du wärend des Downloads noch andere  Modelle verwenden. Es informiert dich wenn es fertig geladen ist und du kannst solange weiter Prompten wie du möchtest.

### Empfehlungen
Ich empfehle noch **Ministral-3** Herunterzuladen.  
Es gibt ```ministral-3:latest```, ```ministral-3:8b``` und ```ministral-3:14b```, welches der Größe nach geordnet sind (Klein nach Groß). Alle Passen in eine normale Gaming GPU Rein. Vorrausgesetzt es Läuft kein Spiel oder andere 3D Anwendungen, die viel VRAM belegen im Hintergrund.

### Sinnvolle Tools
Ich empfehle außerdem noch ```amdgpu_top``` vom AUR zu installieren, wenn es nicht schon mit pacman installierbar ist. Es ist ein in **Rust** geschriebenes AMD GPU Monitoring Tool, welches ich gerne verwende. Generell bin ich fan von in **Rust** geschriebene Software.

## Vibecoding Testen
Äh ja, einfach mal deses Devstarl fragen und auf Antwort warten würde ich mal sagen. Da kann ich dann auch nicht mehr viel zu erzählen, außer das du dich dann selbst informierst.

## SearXNG Suchmaschienen Integration
### Was ist SearXNG
Es ist einfach eine Lokal ausführbare Meta Suchmaschiene, welches einfach wie google funktioniert, aber Lokal ausgeführt wird. Es sucht dabei ganz normal bei google, duckduckgo und andere Suchmaschienen Gleichzeitig und findet deutlich mehr suchergebnisse als google alleine. Diese werden wir verwenden um es in Open-WebUI einzubauen, da es die einzige Lokale Möglichkeit ist, um nicht eine Bestimmte Suchmaschiene zu verwenden.
### Installieren
Ich habe hier Podman verwendet.
Hier was ich gemacht habe:
```$HOME/.config/containers/systemd/searxng.service
[Unit]
Wants=podman-user-wait-network-online.service
After=podman-user-wait-network-online.service
Description=SearXNG container
SourcePath=/home/<user>/.config/containers/systemd/searxng.container
RequiresMountsFor=%t/containers

# Containers can depend on one another using systemd dependencies, but with a ".service" suffix.
# For example, to make another container wait until this one starts, add "After=syncthing-lsio.service"
# to its [Unit] section.
# Von <user>

[X-Container]
ContainerName=searxng
Image=docker.io/searxng/searxng

# Enable auto-update container
AutoUpdate=registry

# Volume=/path/to/searxng/config:/config
# Volume=/path/to/data1:/data1

HostName=searxng
PublishPort=0.0.0.0:4000:8080/tcp
# PublishPort=22000:22000/tcp

Environment=PUID=1000
Environment=PGID=1000
Environment=TZ=Etc/UTC

# UID mapping is needed to run linuxserver.io container as rootless podman.
# This will map UID=1000 inside the container to intermediate UID=0.
# For rootless podman intermediate UID=0 will be mapped to the UID of current user.
UIDMap=1000:0:1
UIDMap=0:1:1000
UIDMap=1001:1001:64536

[Service]
Restart=on-failure

# Extend Timeout to allow time to pull the image
TimeoutStartSec=300
Environment=PODMAN_SYSTEMD_UNIT=%n
KillMode=mixed
ExecStop=/usr/bin/podman rm -v -f -i --cidfile=%t/%N.cid
ExecStopPost=-/usr/bin/podman rm -v -f -i --cidfile=%t/%N.cid
Delegate=yes
Type=notify
NotifyAccess=all
SyslogIdentifier=%N
ExecStart=/usr/bin/podman run --name searxng --cidfile=%t/%N.cid --replace --rm --cgroups=split --hostname
 searxng --sdnotify=conmon -d --uidmap 1000:0:1 --uidmap 0:1:1000 --uidmap 1001:1001:64536 --label io.cont
ainers.autoupdate=registry --publish 0.0.0.0:4000:8080/tcp --env PGID=1000 --env PUID=1000 --env TZ=Etc/UT
C docker.io/searxng/searxng

# The [Install] section allows enabling the generated service.
[Install]
WantedBy=default.target
```

Dann macht man volgendes:

```'$HOME/.config/containers/systemd/searxng.container'
[Unit]
Description=SearXNG container

# Containers can depend on one another using systemd dependencies, but with a ".service" suffix.
# For example, to make another container wait until this one starts, add "After=syncthing-lsio.service"
# to its [Unit] section.
# Von <user>

[Container]
ContainerName=searxng
Image=docker.io/searxng/searxng

# Enable auto-update container
AutoUpdate=registry

# Volume=/etc/searxng/limiter.toml
# Volume=/etc/searxng/uwsgi.ini
# Volume=/path/to/data1:/data1
Volume=/etc/searxng:/etc/searxng

HostName=searxng
PublishPort=0.0.0.0:4000:8080/tcp
# PublishPort=22000:22000/tcp

Environment=PUID=1000
Environment=PGID=1000
Environment=TZ=Etc/UTC

# UID mapping is needed to run linuxserver.io container as rootless podman.
# This will map UID=1000 inside the container to intermediate UID=0.
# For rootless podman intermediate UID=0 will be mapped to the UID of current user.
UIDMap=1000:0:1
UIDMap=0:1:1000
UIDMap=1001:1001:64536

[Service]
Restart=on-failure

# Extend Timeout to allow time to pull the image
TimeoutStartSec=300

# The [Install] section allows enabling the generated service.
[Install]
WantedBy=default.target
```
wichtig ist, das man in der **settings.yml** unter ```search:```, ```formats:``` das hier einträgt, sonnst funktioniert das nicht. Hier: ```  - json```.

Damit dürfte es dann auch schon Konfiguriert sein.

### Podman
#### Podman Installieren
```sudo pacman -S podman```

#### SearXNG über Podman Installieren
Ich habe es als Docker bekommen. ```podman pull docker.io/searxng/searxng:latest```.  
Es geht aber auch ```podman pull ghcr.io/searxng/searxng:latest``` (laut devstral-small-2 mit searxng) (Ja ich hab mir auch hier helfen lassen.).

## Fazit
Ich bekomme jetzt auch nicht mehr alles auf die Kette, aber man kann es sehr gut mit dem LLM fixen, wenn du sie Fragst. Es kann sein, das sie falsch Antworten, aber sie zu Korrigieren, kann auch mal als Sinnvolle lernhilfe gedacht werden. Denn so kann man durchaus lernen, weil man ein besseres gefühl dafür bekommen kann, wie etwas funktioniert. Und man ist nicht mehr auf Profis angewiesen (wie mich), der nie Zeit oder Lust hat zu Antworten.

Danke fürs Lesen.