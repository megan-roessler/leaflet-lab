/*Megan Roessler, Geography 575*/

//Step 1. Create basemap, import tiles from OSM
function createMap(){
	var map = L.map('map', {
		center: [38, -97],
		zoom: 3.5
	});
	
	L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);
	
	getData(map);
	createOverlay(map);
};

//Step 4. Calculate proportional symbol radii
function calcPropRadius(attValue) {
	var scaleFactor = 50;
	var area = attValue * scaleFactor;
	var radius = Math.sqrt(area/Math.PI)*1.5;
	
	return radius;
};

//Step 5. Create point to layer function to create prop symbol markers 
function pointToLayer(feature, latlng, attributes){
	//console.log(attributes);
	var attribute = attributes[1];
	
	//Style GeoJSON markers
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ffffff",
        color: "#A4123F",
        weight: 0.5,
        opacity: 1,
        fillOpacity: 0.6
	};
	
	var attValue = feature.properties[attribute];
	geojsonMarkerOptions.radius = calcPropRadius(attValue);
	
	var layer = L.circleMarker(latlng, geojsonMarkerOptions);
	//Style popup content
	var popupContent = "<p><b>State: </b>" + feature.properties.State + "</p>";
	
	var year = attribute.split("_")[1];
	popupContent += "<p><b>Women in " + attribute + ": </b> " + feature.properties[attribute] + "</p>"
	layer.bindPopup(popupContent);
	//Open popup on mouseover
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        }
    });
	
	return layer;
};


//Step 6. Implement proportional symbols
function createPropSymbols(data, map, attributes){
	
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};


//Step 7. Create sequence controls that update map based on user input
function createSequenceControls(map, attributes){
	//Moves sequence control bar to lower left corner of map div
	var sequenceControl = L.Control.extend({
		options: {
			position: 'bottomleft'
		},
		onAdd: function(map) {
			var container = L.DomUtil.create('div', 'sequence-control-container');
			$(container).append('<input class = "range-slider" type = "range">');
			$(container).append('<button class="skip" id="reverse">Reverse</button>');
			$(container).append('<button class="skip" id="forward">Skip</button>');
			L.DomEvent.disableClickPropagation(container);
			return container;
		}
	});
	
	map.addControl(new sequenceControl());

	$('.range-slider').attr({
		max: 55,
		min: 0,
		value: 0,
		step: 1
	});
	//Style ff/rw buttons
	$('#reverse').html('<img src="img/rw.png">');
	$('#forward').html('<img src="img/ff.png">');
	//Update slider and map based on user interaction with buttons
	$('.skip').click(function(){
		var index = $('.range-slider').val();
		if($(this).attr('id') == 'forward'){
			index++;
			index = index > 55 ? 0 : index;
		} else if ($(this).attr('id') == 'reverse'){
			index--;
			index = index  < 0 ? 55 : index;
		};
		$('.range-slider').val(index);
		updatePropSymbols(map, attributes[index]);
	});
	//Update map based on range slider
	$('.range-slider').on('input', function(){
		var index = $(this).val();
		
		updatePropSymbols(map, attributes[index]);
	});
};

//Step 8. Update prop symbols based on user input
function updatePropSymbols(map, attribute){
	
	map.eachLayer(function(layer){
		if (layer.feature){
			var props = layer.feature.properties;
			
			var radius = calcPropRadius(props[attribute]);
			layer.setRadius(radius);
			
			var popupContent = "<p><b>State: </b>" + props.State + "</p>"
			
			var year = attribute.split("_")[1];
			
			popupContent += "<p><b>Women in " + attribute + ": </b> " + props[attribute] + "</p>";
			
			layer.bindPopup(popupContent, {
			offset: new L.Point(0,-radius)
			});
		};
	});
	updateLegend(map, attribute);
};

//Step 3. Process data
function processData(data){
	var attributes = [];
	
	var properties = data.features[0].properties;
	
	for (var attribute in properties){
		if (attribute.indexOf("congress") > -16){
			attributes.push(attribute);
			
		};
	};
	
	return attributes;
};

//Step 2. Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/women-in-congress2.geojson", {
        dataType: "json",
        success: function(response){
			
			var attributes = processData(response);
			
            //call function to create proportional symbols
			createPropSymbols(response, map, attributes);
			createSequenceControls(map, attributes);
			createLegend(map, attributes);
        }
    });
};

//Step 10. Create legend and legend container
function createLegend(map, attributes, attribute, properties){
	var LegendControl = L.Control.extend({
		options: {
			position: 'bottomright'
		},
		onAdd: function (map) {
			var container = L.DomUtil.create('div', 'legend-control-container');
			//$(container).append('<p><b>Women in Government</b></p>');
	
			$(container).append('<div id="temporal-legend">')
			var svg = '<svg id="attribute-legend" width="160px" height="60px">';
			
			var circles = {
				max: 20,
				mean: 40,
				min: 60
			};
			
			//Create dynamic legend
			for(var circle in circles){
				svg += '<circle class="legend-circle" id="' + circle + '"fill="#ffffff" fill-opacity="1.0" stroke="#A4123F" cx="30"/>';
				svg += '<text id="' + circle + '-text" x="65" y="' + circles[circle] + '"></text>';
				//svg += '<text id="' + circles[i] + '-text" x="65" y="60"></text>';
			};
			
			svg += "</svg>";
			
			$(container).append(svg);
			
			L.DomEvent.disableClickPropagation(container);
			return container;
		}
	});
	
	map.addControl(new LegendControl());
	updateLegend(map, attributes[1]);
	getCircleValues(map, attribute);
};

//Step 11(a). Calculate circle values for legend
function getCircleValues(map, attribute){
	var min = Infinity,
		max = -Infinity;
		
	map.eachLayer(function(layer){
		if (layer.feature){
			var attributeValue = Number(layer.feature.properties[attribute]);
			if (attributeValue < min){
				min = attributeValue;
			};
			if (attributeValue > max){
				max = attributeValue;
			};
		};
	});
	var mean = ((max + min) / 2);
	return {
		max: max,
		mean: mean,
		min: min
	};

};

//Step 11(b). Update legend with circle values
function updateLegend(map, attribute){
	var year = attribute.split("_")[1];
	var content = "Women in the " + attribute;
	
	$('#temporal-legend').html(content);
	
	var circleValues = getCircleValues(map, attribute);
		for (var key in circleValues){
			var radius = calcPropRadius(circleValues[key]);
		
			$('#'+key).attr({
				cy: 59 - radius,
				r: radius
			});
			
			$('#'+key+'-text').text(Math.round(circleValues[key]*100)/100);
		};
};

//Step 12. Create overlay function
function createOverlay(map){
	var firstWomen = new L.LayerGroup();
	//Define markers to overlay/popup content
	L.marker([36.1162, -119.682])
		.bindPopup('<b>Nancy Pelosi (D):</b> First female Speaker of the House.').addTo(firstWomen),
	L.marker([33.04062, -83.6431])
		.bindPopup('<b>Rebecca Latimer Felton (D):</b> First woman to serve in the Senate.').addTo(firstWomen),
	L.marker([21.09432, -157.498])
		.bindPopup('<b>Patsy Mink (D):</b> First Asian-American and first woman of color elected to Congress.').addTo(firstWomen),
	L.marker([40.34946, -88.9861])
		.bindPopup('<b>Carol Moseley Braun (D):</b> First woman of color elected to the Senate.').addTo(firstWomen),
	L.marker([38.52664, -96.7265])
		.bindPopup('<b>Nancy Landon Kassebaum (R):</b> First woman elected to the Senate without first serving in Congress.<br><b>Sharice Davids (D):</b> One of the first two Native American women elected to Congress.').addTo(firstWomen),
	L.marker([44.69395, -69.3819])
		.bindPopup('<b>Margaret Chase Smith (R):</b> First woman to serve in both the House and the Senate.').addTo(firstWomen),
	L.marker([43.32662, -84.5361])
		.bindPopup('<b>Rashida Tlaib (D):</b> One of the first two Islamic women elected to Congress.').addTo(firstWomen),
	L.marker([45.69445, -93.9002])
		.bindPopup('<b>Ilhan Omar (D):</b> First Somali-American, and one of the first two Islamic women elected to Congress.').addTo(firstWomen),
	L.marker([46.92193, -110.454])
		.bindPopup('<b>Jeannette Rankin (R):</b> First woman elected to national office.').addTo(firstWomen),
	L.marker([34.84052, -106.248])
		.bindPopup('<b>Deb Haaland (D):</b> One of the first two Native American women elected to Congress.').addTo(firstWomen),
	L.marker([42.16573, -74.9481])
		.bindPopup('<b>Shirley Chisholm (D):</b> First black woman elected to Congress.<br><b>Hillary Rodham Clinton (D):</b> First female presidential candidate nominated by a major party.<br><b>Alexandria Ocasio-Cortez (D):</b> Youngest woman ever elected to Congress.').addTo(firstWomen),
	L.marker([44.26854, -89.6165])
		.bindPopup('<b>Tammy Baldwin (D):</b> First openly LGBT+ woman elected to Congress, first openly LGBT+ person elected to the Senate.').addTo(firstWomen);
	
	var overlays = {
		"Famous Firsts": firstWomen
	};
	
	L.control.layers(overlays).addTo(map);
};


//Step 12. Call function to create map
$(document).ready(createMap);
