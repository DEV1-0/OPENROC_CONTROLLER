**PROJET OPENROC :  ROUTEUR D'OBJETS CONNECTÉS**
==

RÉSUMÉ
-


- Le projet **OPENROC**  a pour objectif de réaliser un framework javascript  (automate) coté serveur permettant l'affichage temps réel et le routage de données provenant d'un réseaux de capteurs environnementaux sans fils vers un cluster Big Data.
- Le framework écrit en javascript s'exécute sur un serveur NODE.JS embarqué sur une carte PC (Olimex A20). 
- Le réseau de capteurs est réalisé à partir de carte compatible **Arduino** (à réaliser soi même), vous trouverez le code source sur <https://github.com/DEV1-0/OPENROC_ARDUINO> 
- Les informations envoyées par le réseau de capteurs sont **affichées en temps réel** sur Page Web fourni par le contrôleur en mode Intranet et envoyées dans un **cluster Big Data (HDFS/HBASE)** dans un format **TIMES SERIES**.
- À partir d'Internet (mode Extranet), les informations stockées dans le cluster Big Data sont visualisables, comme dans un tableur, sous forme de graphe ou de tableau à partir d'un **DASH BOARD** réalisé avec le générateur d'interface web GRAFANA.


LES COMPOSANTS
-


-   **Le Contrôleur**                   :   "Mini PC Linux" embarquant un ** AUTOMATE NODE.JS** qui est responsable de la communication par sortie **SÉRIE** ou par **"TCP/IP"** avec un réseaux de capteurs sans fils, de l'affichage temps réel des données et l'envoie sous forme de **METRIC** des données provenant des capteurs dans un cluster **BIG-DATA** sous un format **TIMES SERIES**.
-   **La Passerelle**                   :   C'est la **GateWay** du réseau de capteurs sans fil, c'est un microcontrôleur qui possède 2 pattes, une vers le contrôleur, et une autre, par **radio fréquences**, vers les capteurs.
-   **Le réseau de  Capteurs sans fil** :   C'est un ensemble de capteurs environnementaux (Température, Pression atmosphérique, présence, distance, détection de gaz etc ..) portée par des microcontrôleurs et communicant par radio fréquences.
-   **Le cluster Big Data**             :   Composé d'un service Web **OPENTSDB**, d'un système de fichier **HDFS**, d'une base **Nosql HBASE** et d'un générateur d'interface **GRAFANA**.


INSTALLATION DES COMPOSANTS BIG DATA
-

L'installation est réalisée à partir d'une machine virtuel **HADOOP CLOUDERA**. La "VM" permet de mettre en place un démonstrateur qui fonctionne à partir d'un "laptop" de type "i7" (processeur) avec 16 Go de RAM

-   Machine Virtuel **CLOUDERA** version Express 5.7  :  <http://www.cloudera.com/documentation/enterprise/5-6-x/topics/cloudera_quickstart_vm.html>
-   Serveur **OpenTsDb** version 2.2 à installer sur la machine virtuelle CLOUDERA   :   <http://opentsdb.net/docs/build/html/installation.html#id1>
-   Service  **GRAFANA** à installer sur le "laptop" : http://grafana.org/


INSTALLATION DU SERVEUR NODE.JS ET DE LA BASE NOSQL REDIS SUR UNE OLIMEX A20 4Go
-

-   L'installation de node.js et de la base redis ainsi que l'application peut ce faire soit à partir d'un laptop ou sur carte Olimex A20
-   Après avoir installer la sd card debian et branché le câble internet à votre box ADSL ou à votre routeur internet vous êtes pré à installer le contrôleur.

###MATÉRIELS

-   Carte **OlimexXimo A20 Nand 4 Go** : <https://www.olimex.com/Products/OLinuXino/A20/A20-OLinuXino-MICRO-4GB/open-source-hardware>
-   Son **alimentation** : <https://www.olimex.com/Products/Power/SY0612E/>
-   **SD card Debian** pré installée : <https://www.olimex.com/Products/OLinuXino/A20/A20-Debian-SD/> ou télécharger <https://www.olimex.com/wiki/A20-OLinuXino-MICRO#Linux> ou sur <https://docs.google.com/open?id=0B-bAEPML8fwlX2tYS2FmNXV5OUU> puis flasher une **SD card 4Go de "class" 10 minimum**.


###OPTIMISATION et INSTALLATION NODE.JS V0.10.29 SUR UNE OLIMEX A20 4Go
Voir <http://www.guiguishow.info/2013/09/07/auto-hebergement-sur-olinuxino/> pour les **images Debian de 2013**

Nous avons choisi la **Olimex** par ce que l'ensemble de ces composants logiciel et hardware sont **Open Source** contrairement à la RasperryPi <https://olimex.wordpress.com/2014/10/23/olinuxino-and-raspberry-pi-compare/>

-   Activation de l'internet : `ifconfig -a dhclient eth0`
-   Connexion : `ssh root@[ip de la carte sur votre réseau]` mot de passe: olimex
-   Modification du fichier `/etc/network/interfaces` ajouter : `auto eth0 iface eth0 inet dhcp`
-   Optimisation des paquets `apt-get autoremove --purge gnome-* xserver-* desktop-*`
-   Installation du serveur **Node.js version V0.10.29**
    - `apt-get install build-essential`
    - `wget http://nodejs.org/dist/v0.10.29/node-v0.10.29.tar.gz`
    - ` tar -xzf node-v0.10.29.tar.gz`
    - `cd node-v0.10.29`
    - `./configure`
    - `make install`
    - `node -v npm -v`

###INSTALLATION DE LA BASE NOSQL REDIS VERSION 2.8.13

-   sudo apt-get install tcl8.5 wget http://download.redis.io/releases/redis-2.8.13.tar.gz
-   tar xzf redis-2.8.13.tar.gz
-   cd redis-2.8.13
-   make
-   sudo make install
-   cd utils
-   sudo ./install_server.sh
-   sudo service redis_6379 start
-   sudo service redis_6379 stop
-   sudo update-rc.d redis_6379 defaults


###INSTALLATION DE L'AUTOMATE OPENROC SUR NODE.JS
- `ssh olimex@[ip de la carte sur votre réseau]`
- `mkdir OPENROC`
- 'cd OPENROC`
- `git clone https://github.com/DEV1-0/OPENROC_CONTROLLER.git`
- `npm prune && npm install `

###FICHIERS DE CONFIGURATION OPENROC
Tous les fichiers de configurations sont modifiables à chaud

- Configuration de l'application : "conf/openroc_conf.json"

- Configuration des types de capteurs :" conf/openroc_sensors_predentation.json"

- Configuration des METRICs : "conf/openroc_metric.json"

- Configuration des logs : "conf/log4js.json"

###AUTOMATISATION DU LANCEMENT DE L'APPLICATION AVEC PM2
**PM2** est un module de node.js qui premet le monitoring des application node.js
- `cd /home/olimex`
- `sudo npm instal pm2 -g`
- `pm2 starup`
- `sudo su -c "env PATH=$PATH:/usr/local/bin pm2 startup linux -u olimex --hp /home/olimex"`
- `sudo su -c "chmod +x /etc/init.d/pm2-init.sh && update-rc.d pm2-init.sh defaults"`
- `pm2 start OPENROC/bin/www`
- `pm2 save`
- `pm2 stop OPENROC/bin/www`
- Changer le PATH des logs dans conf/log4js.json' avec "filename": "/home/olimex/OpenRocV2/logs/openroc_core.log" et "/home/olimex/OpenRocV2/logs/openroc_error.log"
- Ajouter le groupe secondaire "dialout" pour l'accès à l'interface série **ttyACM0** `sudo usermod -a -G dialout olimex`
- Reboot `sudo reboot'
- Attendez 30 seconde puis ouvrez votre navigateur à l'URL **http://ip_olimex:4000** et branchez votre Gateway à la sortie série de l'olimex.


###PENSE BÊTE

  ####OpenTSDB/HBASE* 
  - sur quickstart.cloudera 
    -  cd /home/cloudera/opentsdb
    - ./build/tsdb tsd --port=4242 --staticroot=build/staticroot/ --cachedir=/tmp/tsd/  --auto-metric
    - http://quickstart.cloudera:442
  
  ####Grafana
   - sudo service grafana-server start --config /etc/grafana/grafana.ini
   - http://localhost:3000
   - https://github.com/grafana/grafana
     *REDIS*
 
