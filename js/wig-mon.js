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

//Load geojson data to map
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
};


//Calculate prop symbol radius
function calcPropRadius(attValue) {
	var scaleFactor = 50;
	var area = attValue * scaleFactor;
	var radius = Math.sqrt(area/Math.PI);
	
	return radius;
};

//Import GeoJSON data
function getData(map){
    //Load geoJSON data
    $.ajax("data/women-in-congress1.geojson", {
        dataType: "json",
        success: function(response){
			var attribute = processData(response);
							
			createPropSymbols(response, map, attributes);
			createSequenceControls(map, attributes);
        }
    });
};

//Step 3. Create array of sequential attributes
function processData(data){
	var attributes = [];
	var properties = data.features[0].properties;
	
	for (var attribute in properties){
		if (attribute.indexOf("congress")> -1){
			attributes.push(attribute);
		};
	};
	
	return attributes;
};

//Create pop-up content
function pointToLayer(feature, latlng){
	//Step 4. Assign the current attribute based on index of attribute array
	var attribute = attributes[0];
	console.log(attribute);
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
function createPropSymbols(data, map, attributes){
	var attribute = "116th_congress";
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
		/* function(feature, latlng){
			return pointToLayer(feature, latlng, attributes);
		} */
    }).addTo(map);
};

//Step 1. Create sequence controls
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
	//Step 2. Create skip and reverse buttons
	$('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');
	
	$('#reverse').html('<img src="img/rewind.png">');
    $('#forward').html('<img src="img/ff.png">');
	
/* 	//Step 5. Listen for user input
	$('.range-slider').on('input', function(){
     //sequence
    }); */
};




//Step 5. Listen for user input
//Step 6. Increment attributes array for forward step, decrement for reverse
//Step 7. Wrap around at end of sequence
//Step 8. Update slider position
//Step 9. Reassign cuurent attribute based on new attribute array index
//Step 10. Resize prop sumbols according to each feature value

/* //Import GeoJSON data
function getData(map){
    //load data
    $.ajax("data/women-in-congress1.geojson", {
        dataType: "json",
        success: function(response){

            createPropSymbols(response, map);
            createSequenceControls(map);

        }
    });
	
}; */


//

//call function
$(document).ready(createMap);
