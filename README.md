>OPENROC
>Routeur d'Objets Connectés

    @TODO :
            - Ordenacement du lancement (Serveur Web, Websocket Server [REDIS[SERIAL]])**
            - OpenTSDB/HBASE distant pour stockage/analyse**
            - OpenTSDB Visualisatuer**
    
  *NODE-HTTP*
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
  
  
  https://github.com/openenergymonitor/emonTH/tree/master/emonTH_DHT22_DS18B20
            