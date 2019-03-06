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

/* //Load geojson data to map
function getData(map){
	$.ajax("data/women-in-congress1.geojson", {
        dataType: "json",
        success: function(response){
			//create attributes array
			var attributes = processData(response);
			
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


//Calculate proportional symbol radius
function calcPropRadius(attValue) {
	var scaleFactor = 50;
	var area = attValue * scaleFactor;
	var radius = Math.sqrt(area/Math.PI);
	
	return radius;
};

//build array from attribute data
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("congress") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};

//Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/women-in-congress1.geojson", {
        dataType: "json",
        success: function(response){
			//create attributes array
			var attributes = processData(response);
			
            //call function to create proportional symbols
            createPropSymbols(response, map, attributes);
			createSequenceControls(map, attributes);
        }
    });
};

//Create pop-up content
function pointToLayer(feature, latlng){

	var attribute = attributes[0];
	
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
	console.log(feature.properties);
	
	var layer = L.circleMarker(latlng, geojsonMarkerOptions);
	
	var popupContent = "<p><b>State: </b>" + feature.properties.State + "</p>";
	console.log(popupContent)
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
function createPropSymbols(data, map){
	var attribute = attributes[0];
    //create marker options
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ffffff",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //Create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: pointToLayer
    }).addTo(map);
};

//Step 1: Create new sequence controls
function createSequenceControls(map){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
	//set range slider attributes
	$('.range-slider').attr({
		max: 6,
		min: 0,
		value: 0,
		step: 1
	});
};

function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

//Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/women-in-congress1.geojson", {
        dataType: "json",
        success: function(response){
			
            createPropSymbols(response, map);
            createSequenceControls(map);
        }
    });
};

//call function
$(document).ready(createMap);
