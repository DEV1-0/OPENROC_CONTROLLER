**PROJET OPENROC :  ROUTEUR D'OBJETS CONNECTÉS**
==

RÉSUMÉ
-


- Le projet OPENROC  a pour objectif de réaliser un framework javascript  (automate) coté serveur permettant l'affichage temps réel et le routage de données provenant d'un réseaux de capteurs environementaux sans fils vers un cluster Big Data.
- Le framework écrit en javascript s'éxécute sur un serveur NODE.JS embarqué sur une carte PC (Olimex A20). 
- Le réseau de capteurs est réalisé à partir de carte compatible Arduino (à réaliser soi même), vous trouverez le code source sur <https://github.com/DEV1-0/OPENROC_ARDUINO> 
- Les informations envoyées par le réseau de capteurs sont affichées en temps réel sur Page Web fourni par le controlleur en mode Intranet et envoyées dans un cluster Big Data (HDFS/HBASE) dans un format TIMES SERIES.
- À partir d'Internet (mode EXtranet), les informations stockées dans le cluster Big Data sont visualisablent, comme dans un tableur, sous forme de graphe ou de tableau à partir d'un tableau de bord réalisé avec le générateur d'interface web GRAFANA.

LES COMPOSANTS
-


-   Le Contrôleur       :   Serveur Node.js responsable de la communication  par sortie serie ou par TCP/IP avec le réseaux de capteurs sans fils, de l'affichage temps réel des données et l'envoie sous forme de metric des données capteur dans un cluster Big-Data sous format TIMES SERIES.
-   La Passerelle       :   C'est la GateWay du réseau de capteurs sans fil, c'est un microcontrôleur qui communique avec le contrôleur et les capteurs.
-   Les Capteurs        :   C'est un ensemble de capteurs environemantaux (Température, Préseion, présence etc ..) portée par des microcontrôleurs
-   Le cluster Big Data :   Composé d'un service Web OPENTSDB, d'un sytème de fichier HDFS, d'une base Nosql HBASE et d'un généarteur d'interface GRAFANA

INSTALLATION DES COMPOSANTS BIG DATA
-
L'installation est réalisée à partir d'une machine virtuel hadoop cloudera permet de mettre en place un démonstarteur qui fonctionne à partir d'un laptop de type i7 (processeur) avec 16 Go de RAM
-   Machine Virtuel cloudera version Express 5.7  :  <http://www.cloudera.com/documentation/enterprise/5-6-x/topics/cloudera_quickstart_vm.html>
-   Serveur OpenTsDb version 2.2 à installé à partir de la machine vituelle cloudera   :   <http://opentsdb.net/docs/build/html/installation.html#id1>
-   Service  GRAFANA à installer sur le laptop : http://grafana.org/

INSTALLATION DU SERVEUR NODE.JS ET DE LA BASE NOSQL REDIS SUR UNE OLIMEX A20 4Go
-


-   L'installation de node.js et de la base redis ainsi que l'application peut ce faire soit à partir d'un laptop ou sur carte Olimex A20
-   Aprés avoir installer la sd card debian et braché le cable internet à votre box ADSL ou votre routeur internet vous ête près à installer le contrôleur.

###MATÉRIELS

-   Carte OlimexXimo A20 Nand 4 go <https://www.olimex.com/Products/OLinuXino/A20/A20-OLinuXino-MICRO-4GB/open-source-hardware>
-   Son alimentation <https://www.olimex.com/Products/Power/SY0612E/>
-   SD card Debian pré installée <https://www.olimex.com/Products/OLinuXino/A20/A20-Debian-SD/> ou télécharger <https://docs.google.com/open?id=0B-bAEPML8fwlX2tYS2FmNXV5OUU> puis flasher une SD car 4Go de class 10 minimum


###OPTIMISATION et INSTALLATION NODE.JS V0.10.29
-


-   activation de l'internet : `ifconfig -a dhclient eth0`
-   connexion : `ssh root@[ip de la carte sur votre réseau]`



  port : 4000
  http://localhost:4000
  
  *OpenTSDB/HBASE* 
  sur quickstart.cloudera :
   cd /home/cloudera/opentsdb
   ./build/tsdb tsd --port=4242 --staticroot=build/staticroot/ --cachedir=/tmp/tsd/  --auto-metric
  http://quickstart.cloudera:442
  
  *Grafana*
   sudo service grafana-server start --config /etc/grafana/grafana.ini
   http://localhost:3000
   https://github.com/grafana/grafana
   
   *REDIS*
 
