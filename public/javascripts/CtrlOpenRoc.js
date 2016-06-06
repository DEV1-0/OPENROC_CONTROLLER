/*******************************************************************************
 * PROJET : OpenROC
 * @author 2015-2016 Eric Papet <e.papet@dev1-0.com.com> and Charles Varnier <c.varnier@dev1-0.com>
 * @see The GNU Public License (GPL)
 * Description : MVC GUI Controller
 *
 *******************************************************************************
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
 * for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
 *******************************************************************************/
var dataSet = [];
var nodesTab;
moment.locale('fr');
//
$(document).ready(function () {
    //nodes array
    nodesTab = $('#nodes').DataTable({
        data: dataSet,
        rowId: 'NodeID',
        columns: [
            {title: "<i class=\"fa fa-tag\"></i> Id"},
            {title: "<i class=\"fa fa-folder\"></i> Microcontrôleur"},
            {title: "<i class=\"fa fa-plug\"></i> État"},
            {title: "<i class=\"fa fa-tag\"></i> Version"},
            {title: "<i class=\"fa fa-clock-o\"></i> Mise à jour"},
            {title: "<i class=\"fa fa-battery-half\"></i> Niveau de batterie"}
        ],
        "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
            if (aData[2] == "CONNECTED") {
                $('td:eq(2)', nRow).addClass('status').addClass('connected').removeClass('disconnected');
                //$('td', nRow).css('background-color', '#22FF77');
            } else {
                //$('td:eq(2)', nRow).css('background-color', '#FF2277');
                $('td:eq(2)', nRow).addClass('status').removeClass('connected').addClass('disconnected');
            }
        },
        "fnCreatedRow": function (nRow, aData, iDataIndex) {
            $(nRow).attr('id', aData[0]);
        }
    });

	//services array
    var servicesTab = $('#tab-services').DataTable();

});


function displayServiceDatas(trService, json) {

	// console.log("displayServiceDatas : "+trService.id);

	if (json != null || json != undefined) {

		// Informations
		var content;
		if (json.host != undefined) {
			content = json.host + ":" + json.port;
		} else {
			content = json.port + " at " + json.baud + " Baud";
		}
		$(trService).find(".info-service").html(content);

		// État
		var status = (json.status == true) ? "CONNECTED" : "DISCONNECTED";
		var classNameEtat = (json.status) ? "connected" : "disconnected";
		$(trService).find(".status")
			.removeClass("connected").removeClass("disconnected") //reset de l'ancien état
			.addClass(classNameEtat) // set du nouvel état
			.html(status);

		// Mise à jour
		if (json.timestamp != undefined) {
			//	var time = moment(json.timestamp, 'X').format('dddd Do MMMM YYYY, hh:mm:ss');
			$(trService).find(".time").html(json.timestamp);
		} else {
			$(trService).find(".time").html("non définie");
		}

	}
	
}

var index = 0;
var socket = io.connect('http://localhost:4000');
socket.on('connect', function () {
    //
    socket.on('init_services', function (msg) {
//        var status;
//        var content;

		displayServiceDatas($("#service-serial")[0], msg.serial);
		//   localStorage.setItem("SERIAL", JSON.stringify(msg.serial));
        displayServiceDatas($("#service-http")[0], msg.http);
        displayServiceDatas($("#service-redis")[0], msg.redis);
        displayServiceDatas($("#service-tsdb")[0], msg.tsdb);
    });
	socket.on('serial_connected', function (msg) {
        displayServiceDatas($("#service-serial")[0], msg);
    });
    //
    socket.on('http_connected', function (msg) {
        //
        displayServiceDatas($("#service-http")[0], msg);
    });
    //
    socket.on('opentsdb_connected', function (msg) {
        //
        displayServiceDatas($("#service-tsdb")[0], msg);
	});
    //
    socket.on('redis_connected', function (msg) {
        //
        displayServiceDatas($("#service-redis")[0], msg);
	});

    //
    socket.on('update_node', function (msg) {
        //--
        //Formatage des data
		var presentation = (msg.presentation != null) ? msg.presentation : "En attente d'informations";
		var version = (msg.version != null) ? msg.version : "En attente d'informations";
        var status = (msg.status == true) ? "CONNECTED" : "DISCONNECTED";
        var battery_level = (msg.battery_level != null) ? msg.battery_level : "En attente d'informations";

		var content = makeNodeHeaderDiv(msg);

        // Mise à jour de la table des Nodes (MICROCONTROLEURS)
        var value = [];
        value.push('' + msg.node_id);
		value.push('' + presentation);
        value.push(status);
        value.push('' + version);
        value.push('' + moment(msg.last_update, 'X').format('dddd Do MMMM YYYY, hh:mm:ss'));
		value.push('' + battery_level);
        
        nodesTab.row('#' + msg.node_id).remove().draw(false);
        nodesTab.row.add(value).draw(false);

		// injecte le slider dans la derniere cellule de chaque ligne du tableau MICROCONTROLEURS
		$('#' + msg.node_id + ' td:eq(5)').html(makeBatteryLevelDiv(battery_level));

        //création de la structure HTML
		if ($('#node-' + msg.node_id).length == 0) {
			// $('#row-' + msg.node_id).remove();
			$('#nodes-panel').append('<div class="col-sm-12" id="node-' + msg.node_id + '"><div class="panel panel-default node"><div class="panel-heading" id="title-node-' + msg.node_id + '" > </div><div id="node' + msg.node_id + '" class="panel-body"></div></div></div>');
		}
		// Mise à jours des information du Node
		$('#title-node-' + msg.node_id).empty();
		$('#title-node-' + msg.node_id).append(content);
	});
    //
    socket.on('update_time', function (msg) {

		var i = $("<i/>").addClass("fa").addClass("fa-clock-o");

		$("#clock").empty().append(i).append(msg);

    });
	//
    
    socket.on('update_sensor', function (sensor) {
        //
        //console.log(msg);
		var presentation = (sensor.presentation != null) ? sensor.presentation : "En attente d'informations";
		var model = (sensor.model != null) ? sensor.model : "En attente d'informations";
		var content = "<h4>" + model + " <em>" + presentation + "</em></h4>"
        //Création de la structure de chaque sensor
		if ($('#sensor_' + sensor.node_id + '_' + sensor.sensor_id).length == 0) {
			$('#node' + sensor.node_id).append('<div class="panel panel-default col-lg-2 col-md-3 col-sm-4"><div class="panel-heading" id="title_' + sensor.node_id + '_' + sensor.sensor_id + '"></div><div id="sensor_' + sensor.node_id + '_' + sensor.sensor_id + '" class="panel-body node-body"></div></div>');
        }

		// Mise à jours des information des titres des sensor
		if (sensor.presentation != null) {
            $('#title_' + sensor.node_id + '_' + sensor.sensor_id).empty();
			$('#title_' + sensor.node_id + '_' + sensor.sensor_id).html(content);
            
        }


		//Mise à jours des données sensor
		if (sensor.type != null && sensor.type.metric != undefined && sensor.value != undefined) {

			var metric;

			if (sensor.type.metric == "temperature") {

				makeSensorTemperatureMetric(sensor);
				makeSyntheseTemperatureMetric(sensor);
				$('#title_' + sensor.node_id + '_' + sensor.sensor_id).addClass("temperature");

			} else if (sensor.type.metric == "level") {

				makeSensorLevelMetric(sensor);
				$('#title_' + sensor.node_id + '_' + sensor.sensor_id).addClass("level");

			} else if (sensor.type.metric == "humidity") {

				makeSensorHumidityMetric(sensor);
				$('#title_' + sensor.node_id + '_' + sensor.sensor_id).addClass("humidity");

			} else if (sensor.type.metric == "detection") {

				makeSensorDetectionMetric(sensor);
				$('#title_' + sensor.node_id + '_' + sensor.sensor_id).addClass("detection");

			} else if (sensor.type.metric == "ouverture") {

				//   console.log("sensor.type.metric "+ sensor.type.metric);
				makeSensorDetectionMetric(sensor);
				$('#title_' + sensor.node_id + '_' + sensor.sensor_id).addClass("ouverture");

			} else if (sensor.type.metric == "presence") {

				// console.log("sensor.type.metric "+ sensor.type.metric);
				makeSensorDetectionMetric(sensor);
				$('#title_' + sensor.node_id + '_' + sensor.sensor_id).addClass("presence");

			} else {
				//	console.log("sensor.type.metric "+ sensor.type.metric);

				$('#title_' + sensor.node_id + '_' + sensor.sensor_id).addClass(sensor.type.metric);

				var metric = " <p><strong>" + sensor.type.metric + " : " + sensor.value + " " + sensor.type.unite + "</strong></p><p> min : " + sensor.type.min + " max : " + sensor.type.max + " </p><p>" + moment(sensor.last_update, 'x').format('dddd Do MMMM YYYY, hh:mm:ss') + "</p>";
				$('#sensor_' + sensor.node_id + '_' + sensor.sensor_id).empty();
				$('#sensor_' + sensor.node_id + '_' + sensor.sensor_id).html(metric);
			}

        }


    });

	/*
	 *
	 * makeSensorLevelMetric
	 *
	 */

	function makeSensorLevelMetric(sensor) {

		var dDate = Date.now();

		var graphId = 'sensor_' + sensor.node_id + '_' + sensor.sensor_id + '_level';
		var graphLevel = $('#' + graphId)[0];

		if (graphLevel == null) {

			var gaugeOptions = {

				chart: {
					type: 'solidgauge'
				},

				title: null,

				pane: {
					center: ['50%', '85%'],
					size: '140%',
					startAngle: -90,
					endAngle: 90,
					background: {
						backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
						innerRadius: '60%',
						outerRadius: '100%',
						shape: 'arc'
					}
				},

				tooltip: {
					enabled: false
				},

				//   the value axis
				yAxis: {
					stops: [
						[0.1, '#55BF3B'], // green
						[0.5, '#DDDF0D'], // yellow
						[0.9, '#DF5353'] // red
					],
					lineWidth: 0,
					minorTickInterval: null,
					tickPixelInterval: 400,
					tickWidth: 0,
					title: {
						y: -70
					},
					labels: {
						y: 16
					}
				},

				plotOptions: {
					solidgauge: {
						dataLabels: {
							y: 5,
							borderWidth: 0,
							useHTML: true
						}
					}
				}
			};

			// creation de la structure
			graphLevel = $("<div/>").attr("id", graphId).css("height", "170px");
			// ajout dans le DOM
			$('#sensor_' + sensor.node_id + '_' + sensor.sensor_id).append(graphLevel);


			$(graphLevel).highcharts(Highcharts.merge(gaugeOptions, {
				yAxis: {
					min: 0,
					max: 10,
					title: {
						text: 'Niveau'
					}
				},

				credits: {
					enabled: false
				},

				series: [{
					name: 'Niveau',
					data: [1 * sensor.value],
					dataLabels: {
						format: '<div style="text-align:center"><span style="font-size:25px;color:' +
						((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
						'<span style="font-size:12px;color:silver">' + sensor.type.unite + '</span></div>'
					},
					tooltip: {
						valueSuffix: ' ' + sensor.type.unite
					}
				}]

			}));

		} else {

//    		// ajout d'une donnée
			var chart = $(graphLevel).highcharts();

			if (chart) {
				point = chart.series[0].points[0];
				point.update(1 * sensor.value);
			}
//	   		 //limite l'affichage de la courbe aux dernières valeurs
//	   		 var time = new Date().getTime();
//	   		 var limite1 = new Date(time - 1000*60*5); // 5 minutes
//	   		// var d1 = new Date(limite1);
//	   		 chart.xAxis[0].setExtremes(limite1, dDate);
//	
//	   		// console.log("addPoint temperature = " + sensor.value)
//	   	     chart.series[0].addPoint([dDate, 1 * sensor.value]);

		}
    
    }

	function makeSensorTemperatureMetric(sensor) {

		//var dDate = new Date(1*sensor.last_update);
		var dDate = Date.now();

		var graphId = 'sensor_' + sensor.node_id + '_' + sensor.sensor_id + '_temperature';
		var graphTemperature = $('#' + graphId)[0];
		if (graphTemperature == null) {
			// creation de la structure
			graphTemperature = $("<div/>").attr("id", graphId).css("width", "100%").css("height", "170px");
			// ajout dans le DOM
			$('#sensor_' + sensor.node_id + '_' + sensor.sensor_id).append(graphTemperature);

			$(graphTemperature).highcharts({

				chart: {
					type: 'areaspline'
				},
				title: {
					text: ''
				},
				credits: {
					enabled: false
				},
				xAxis: {
					type: 'datetime',
					labels: {
						overflow: 'justify'
					},
					dateTimeLabelFormats: { // don't display the dummy year
						month: '%e. %b',
						year: '%b'
					},
				},
				yAxis: {
					title: {
						text: 'Température ' + sensor.type.unite
					},
					min: sensor.type.min,
					//    floor: sensor.type.min,
					max: sensor.type.max,
					//    ceiling: sensor.type.max
					plotLines: [{
						color: '#333333', // Color value
						// dashStyle: 'longdashdot', // Style of the plot line. Default to solid
						value: 30, // Value of where the line will appear
						width: 1 //, // Width of the line

//	                    label: {
//	                        text: '30°C',
//	                        style: {
//	                            color: 'red'
//	                        }
//	                    }
					}]
				},
				plotOptions: {
					series: {
						color: '#ff6600',
						fillColor: {
							linearGradient: [0, 0, 0, 100],
							stops: [
								[0, "#ff0000"],
								[1, Highcharts.Color("#ffff00").setOpacity(0).get('rgba')]
							]
						}
					}
				},
				tooltip: {
					headerFormat: '<b>{series.name}</b><br>',
					pointFormat: '{point.x:%H:%M:%S}: {point.y:.1f} ' + sensor.type.unite
				},

				series: [{
					name: sensor.model,
					data: ([[dDate, 1 * sensor.value]])
				}]
			});
		} else {
			// ajout d'une donnée
			var chart = $(graphTemperature).highcharts();
			//limite l'affichage de la courbe aux dernières valeurs
			var time = new Date().getTime();
			var limite1 = new Date(time - 1000 * 60 * 5); // 5 minutes
			// var d1 = new Date(limite1);
			chart.xAxis[0].setExtremes(limite1, dDate);

			chart.series[0].addPoint([dDate, 1 * sensor.value]);
			chart.series[0].update({name: sensor.model + ' ' + Number(sensor.value).toFixed(2) + ' ' + sensor.type.unite});
		}
	}


	function makeSensorHumidityMetric(sensor) {

		//var dDate = new Date(1*sensor.last_update);
		var dDate = Date.now();

		var graphId = 'sensor_' + sensor.node_id + '_' + sensor.sensor_id + '_humidity';
		var graphHumidity = $('#' + graphId)[0];
		if (graphHumidity == null) {
			// creation de la structure
			graphHumidity = $("<div/>").attr("id", graphId).css("width", "100%").css("height", "170px");
			// ajout dans le DOM
			$('#sensor_' + sensor.node_id + '_' + sensor.sensor_id).append(graphHumidity);

			$(graphHumidity).highcharts({

				chart: {
					type: 'areaspline'
				},
				title: {
					text: ''
				},
				credits: {
					enabled: false
				},
				xAxis: {
					type: 'datetime',
					labels: {
						overflow: 'justify'
					},
					dateTimeLabelFormats: { // don't display the dummy year
						month: '%e. %b',
						year: '%b'
					},
				},
				yAxis: {
					title: {
						text: 'Humidité ' + sensor.type.unite
					},
					min: sensor.type.min,
					//  floor: sensor.type.min,
					max: sensor.type.max,
					//  ceiling: sensor.type.max
				},
				plotOptions: {
					series: {
						color: '#4a6eff',
						fillColor: {
							linearGradient: [0, 0, 0, 100],
							stops: [
								[0, "#0033ff"],
								[1, Highcharts.Color("#0000ff").setOpacity(0).get('rgba')]
							]
						}
					}
				},
				tooltip: {
					headerFormat: '<b>{series.name}</b><br>',
					pointFormat: '{point.x:%H:%M:%S}: {point.y:.1f} ' + sensor.type.unite
				},

				series: [{
					name: sensor.model,
					data: ([[dDate, 1 * sensor.value]])
				}]
			});
		} else {
			// ajout d'une donnée
			var chart = $(graphHumidity).highcharts();
			//limite l'affichage de la courbe aux dernières valeurs
			var time = new Date().getTime();
			var limite1 = new Date(time - 1000 * 60 * 5); // 5 minutes
			// var d1 = new Date(limite1);
			chart.xAxis[0].setExtremes(limite1, dDate);

			// console.log("addPoint temperature = " + sensor.value)


			chart.series[0].addPoint([dDate, 1 * sensor.value]);
			chart.series[0].update({name: sensor.model + ' ' + Number(sensor.value).toFixed(2) + ' ' + sensor.type.unite});
		}
	}


	function makeSensorDetectionMetric(sensor) {

		//var dDate = new Date(1*sensor.last_update);
		var dDate = Date.now();

		var typeDetection = 'detection';

// 	console.log((sensor.model).toString().toLowerCase());
// 	console.log((sensor.model).toString().toLowerCase().split('porte').length );
// 	
		if ((sensor.model).toString().toLowerCase().split('porte').length > 1) {
			typeDetection = 'porte';
		}

		var graphId = 'sensor_' + sensor.node_id + '_' + sensor.sensor_id + '_detection';
		var graphDetection = $('#' + graphId)[0];
		if (graphDetection == null) {
			// creation de la structure
			graphDetection = $("<div/>").attr("id", graphId).css("width", "100%").css("height", "170px");
			// ajout dans le DOM
			$('#sensor_' + sensor.node_id + '_' + sensor.sensor_id).append(graphDetection);

			var series = [{
				name: sensor.model,
				data: ([])
			}]

			if (typeDetection == 'porte') {
				series = [{
					name: 'Ouverture',
					data: ([]),
					color: '#ff6600'
				},
					{
						name: 'Fermeture',
						data: ([]),
						color: '#666666'
					}
				]
			}


			$(graphDetection).highcharts({

				chart: {
					type: 'column'
				},
				title: {
					text: ''
				},
				credits: {
					enabled: false
				},
				xAxis: {
					type: 'datetime',
					labels: {
						overflow: 'justify'
					},
					dateTimeLabelFormats: { // don't display the dummy year
						month: '%e. %b',
						year: '%b'
					},
				},
				yAxis: {
					visible: false,
					title: {
						text: ''
					},
					min: 0,
					// floor: sensor.type.min,
					max: 1,
					//   ceiling: sensor.type.max
				},
				plotOptions: {
					series: {
						color: '#ff2200'
					}
				},
				tooltip: {
					headerFormat: '<b>{series.name}</b>',
					pointFormat: ''
				},

				series: series
			});
		}

		// ajout d'une donnée
		var chart = $(graphDetection).highcharts();
		//limite l'affichage de la courbe aux dernières valeurs
		var time = new Date().getTime();
		var limite1 = new Date(time - 1000 * 60 * 5); // 5 minutes
		// var d1 = new Date(limite1);
		chart.xAxis[0].setExtremes(limite1, dDate);


		var timeAff = moment(dDate, 'X').format('hh:mm:ss');
		// chart.series[0].update({name : (sensor.model+' '+ timeAff + ' ' + (sensor.value==1?'<b>OUI</b>':'<em>NON</em>'))});

		var date = new Date(dDate);
		var hh = date.getUTCHours();
		var mm = date.getUTCMinutes();
		var ss = date.getSeconds();
		// If you were building a timestamp instead of a duration, you would uncomment the following line to get 12-hour (not 24) time
		// if (hh > 12) {hh = hh % 12;}
		// These lines ensure you have two-digits
		if (hh < 10) {
			hh = "0" + hh;
		}
		if (mm < 10) {
			mm = "0" + mm;
		}
		if (ss < 10) {
			ss = "0" + ss;
		}
		// This formats your string to HH:MM:SS
		var t = hh + ":" + mm + ":" + ss;

		if (typeDetection == 'porte') {

			if (sensor.value == 0) {
				chart.series[0].addPoint([dDate, 1]);
				chart.series[0].update({name: ('Porte ouverte à ' + t)});
				chart.series[1].update({name: 'Fermetures'});
			} else {
				chart.series[1].addPoint([dDate, 1]);
				chart.series[0].update({name: 'Ouvertures'});
				chart.series[1].update({name: ('Porte fermée à ' + t)});
			}

		} else {

			if (sensor.value == 1) {
				chart.series[0].addPoint([dDate, 1 * sensor.value]);
				chart.series[0].update({name: ('Dernière détection à ' + t)});
			}
		}


	}


	function makeSyntheseTemperatureMetric(sensor) {


		var graphId = 'synthese_temperature-graph';
		var graphTemperature = $('#' + graphId)[0];

		//var dDate = new Date(1*sensor.last_update);
		var dDate = Date.now();

		if (graphTemperature == null) {

			// creation de la structure
			graphTemperature = $("<div/>").attr("id", graphId).css("width", "80%").css("height", "170px");
			// ajout dans le DOM
			$('#syntheses-panel').append(graphTemperature);

			$(graphTemperature).highcharts({

				chart: {
					type: 'spline'
				},
				title: {
					text: ''
				},
				credits: {
					enabled: false
				},
				xAxis: {
					type: 'datetime',
					labels: {
						overflow: 'justify'
					}

				},
				yAxis: {
					title: {
						text: 'Température ' + sensor.type.unite
					}
//		        ,
//		            min: sensor.type.min,
//	                floor: sensor.type.min,
//	                max: sensor.type.max,
//		            ceiling: sensor.type.max
				},

				tooltip: {
					headerFormat: '<b>{series.name}</b><br>',
					pointFormat: '{point.x:%H:%M:%S}: {point.y:.1f} ' + sensor.type.unite
				},

				series: [{
					id: 'n' + sensor.node_id + 's' + sensor.sensor_id,
					name: sensor.model,
					data: ([[dDate, 1 * sensor.value]])
				}]
			});
		} else {
			// ajout d'une donnée
			var chart = $(graphTemperature).highcharts();
			//limite l'affichage de la courbe aux dernières valeurs
			var time = new Date().getTime();
			var limite1 = new Date(time - 1000 * 60 * 15); // 15 minutes
			// var d1 = new Date(limite1);
			chart.xAxis[0].setExtremes(limite1, dDate);
			// console.log("addPoint temperature = " + sensor.value)

			var serieConcernee;

			// recherche de la bonne serie de données
			$(chart.series).each(function (i, serie) {

				// console.log(serie.options.id);
				if (serie.options.id == 'n' + sensor.node_id + 's' + sensor.sensor_id) {
					serieConcernee = serie;
				}
			});

			// Ajout de la serie (série de données pour un capteur) si pas déjà fait
			if (serieConcernee == undefined) {

				serieConcernee = chart.addSeries({
					id: 'n' + sensor.node_id + 's' + sensor.sensor_id,
					name: sensor.model,
					data: ([])
				});

				// console.log('Ajout : '+serieConcernee.options.id);
			}

			serieConcernee.addPoint([dDate, 1 * sensor.value]);


		}
    }


	// construit une barre de progression pour l'état de la baterie
	function makeBatteryLevelDiv(prctLevel) {

		//	console.log("prctLevel" + prctLevel);

		if (isNaN(prctLevel)) {
			prctLevel = -1;
		}


		var classNameUrgence = 'progress-bar-info';
		if (prctLevel < 20) {
			classNameUrgence = 'progress-bar-danger';
		} else if (prctLevel >= 20 && prctLevel < 50) {
			classNameUrgence = 'progress-bar-warning';
		}

		var elDiv = $("<div/>").addClass("progress");
		var elPrgBar = $("<div/>").addClass("progress-bar").addClass(classNameUrgence).appendTo(elDiv);
		if (prctLevel > 0) {
			if (prctLevel > 10) {
				$(elPrgBar).css("width", prctLevel + "%");
			} else {
				$(elPrgBar).css("width", "10%");
			}

		}

		$(elPrgBar).attr("aria-valuenow", prctLevel);
		$(elPrgBar).attr("aria-valuemin", "0");
		$(elPrgBar).attr("aria-valuemax", "100");
		$(elPrgBar).html(prctLevel + "%");

		return elDiv;
    	
    }

	function makeNodeHeaderDiv(msg) {

		var presentation = (msg.presentation != null) ? msg.presentation : "En attente d'informations";
		var version = (msg.version != null) ? msg.version : "En attente d'informations";
		var status = (msg.status == true) ? "CONNECTED" : "DISCONNECTED";
		var battery_level = (msg.battery_level != null) ? msg.battery_level : "En attente d'informations";

		var elDiv = $("<div/>").addClass("presentation");
		$(elDiv).html(presentation);
//          var elDivName = $("<h3/>").html(presentation).appendTo(elDiv);
//          var elPVersion = $("<p/>").addClass("version").html("API Version : "+ version).appendTo(elDiv);
//          var elDivBattery = makeBatteryLevelDiv(msg.battery_level).appendTo(elDiv);
//          var elPTimeRefresh = $("<p/>").addClass("last-time-refresh").html(moment(msg.last_update, 'X').format('dddd Do MMMM YYYY, hh:mm:ss')).appendTo(elDiv);
		return elDiv;
    }


});


