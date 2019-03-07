/*Megan Roessler, Geography 575*/

//Create basemap
function createMap(){
	var map = L.map('map', {
		center: [38, -97],
		zoom: 3.5
	});
	
	L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);
	
	getData(map);
};

//REDUNDANT
/* //Load geojson data to map
function getData(map){
	$.ajax("data/women-in-congress1.geojson", {
        dataType: "json",
        success: function(response){
			//create attributes array
			var attributes = processData(response);
			
			createPropSymbols(response, map, attributes);
			createSequenceControls(map, attributes);
			
			var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ffffff",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            //add leaflet GeoJSON to map
            L.geoJson(response, {
				pointToLayer: function (feature, latlng){
					return L.circleMarker(latlng, geojsonMarkerOptions);
				}
			}).addTo(map);
        }
    });
}; */


//Calculate prop symbol radius
function calcPropRadius(attValue) {
	var scaleFactor = 50;
	var area = attValue * scaleFactor;
	var radius = Math.sqrt(area/Math.PI);
	
	return radius;
};



//Popup content
function pointToLayer(feature, latlng, attributes){
	console.log(attributes);
	var attribute = attributes[1];
	
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ffffff",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
	};
	
	var attValue = feature.properties[attribute];
	geojsonMarkerOptions.radius = calcPropRadius(attValue);
	
	var layer = L.circleMarker(latlng, geojsonMarkerOptions);
	
	var popupContent = "<p><b>State: </b>" + feature.properties.State + "</p>";
	
	var year = attribute.split("_")[1];
	popupContent += "<p><b>Women in " + attribute + ": </b> " + feature.properties[attribute] + "</p>"
	layer.bindPopup(popupContent);
	    //event listeners to open popup on hover
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

//Create proportional symbols
//Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
	
	//var attribute = "116th_congress";
    //create marker options
/*     var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ffffff",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    }; */

    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

//Step 1: Create new sequence controls
function createSequenceControls(map, attributes){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
	//set range slider attributes
	$('.range-slider').attr({
		max: 55,
		min: 0,
		value: 0,
		step: 1
	});
		
	$('.skip').click(function(){
		//Sequence
		//updatePropSymbols(map, attributes);
	});
	
	//Update map based on range slider
	$('.range-slider').on('input', function(){
		var index = $(this).val();
		$('.range-slider').val(index);
		updatePropSymbols(map, attributes[index]);
	});
};

function updatePropSymbols(map, attribute){
	map.eachLayer(function(layer){
		if (layer.feature && layer.feature.properties[attribute]){
			var props = layer.feature.properties;
			
			var radius = calcPropRadius(props[attribute]);
			layer.setRadius(radius);
			
			var popupContent = "<p><b>State:</b>" + props.State + "</p>"
			
			var year = attribute.split("_")[1];
			popupContent += "<p><b>Women in " + attribute + ": </b> " + props[attribute] + "</p>";
			
			layer.bindPopup(popupContent, {
			offset: new L.Point(0,-radius)
			});
		};
	});
};

function processData(data){
	var attributes = [];
	
	var properties = data.features[0].properties;
	
	for (var attribute in properties){
		if (attribute.indexOf("congress") > -1){
			attributes.push(attribute);
		};
	};
	
	return attributes;
};
//Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/women-in-congress1.geojson", {
        dataType: "json",
        success: function(response){
			
			var attributes = processData(response);
			
            //call function to create proportional symbols
			createPropSymbols(response, map, attributes);
			createSequenceControls(map, attributes);
        }
    });
};

//call function
$(document).ready(createMap);
