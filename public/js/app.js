//Data
var places = [{
    city: '8200 Warden Avenue'
    , desc: 'IBM Canada Software Lab - Toronto, 8200 Warden Avenue, Markham, ON L6G 1C7'
    , lat: 43.84886
    , long: -79.33838
}, {
    city: '3600 Steeles Avenue East'
    , desc: 'IBM Canada Ltd., 3600 Steeles Avenue East, Markham, ON L3R 9Z7'
    , lat: 43.81838
    , long: -79.33421
}, {
    city: '120 Bloor Street East'
    , desc: 'IBM, 120 Bloor Street East, Toronto, ON M4W 1B7'
    , lat: 43.67128
    , long: -79.38389
}, {
    city: '3755 Riverside Drive'
    , desc: 'IBM Canada Inc., 3755 Riverside Drive, Ottawa, ON K1V 1B8'
    , lat: 45.34053
    , long: -75.69045
}, {
    city: '770 Palladium Drive'
    , desc: 'IBM, 770 Palladium Drive, Ottawa, ON K2V'
    , lat: 45.29837
    , long: -75.92174
}];



var GOOGLE_API_KEY = "AIzaSyBhy9XlaP1zIdzVMPbJanvr9wLqFxT3r-U";


window.onload = function () {
    var mapOptions = {
        zoom: 12
        , center: new google.maps.LatLng(43.84886, -79.33838)
        , mapTypeId: google.maps.MapTypeId.ROADMAP
        , mapTypeControl: false
        , styles: [{
            stylers: [{
                visibility: 'simplified'
            }]
    }, {
            elementType: 'labels'
            , stylers: [{
                visibility: 'off'
            }]
    }, {
            featureType: 'road'
            , elementType: 'all'
            , stylers: [
                {
                    color: '#4178BE'
                }
              ]
            }, {
            featureType: 'all'
            , elementType: 'all'
            , stylers: [
                {
                    hue: '#162F39'
                }
                
                , {
                    saturation: -2
                }
                
                , {
                    lightness: -80
                }
                
                , ]
            }]
    }

    var map = new google.maps.Map(document.getElementById('map'), mapOptions);
    var placeService = new google.maps.places.PlacesService(map);

    var markers = [];

    var infoWindow = new google.maps.InfoWindow();

    placeService.easyNearbySearch = function (keyword, type, openNow, callback) {
        var request = {
            bounds: map.getBounds()
            , keyword: keyword
            , openNow: openNow
            , type: type
        };

        function newCallback(results, status) {
            var parsedResults = [];
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                callback(results.map(function (place) {
                    return {
                        lat: place.geometry.location.lat()
                        , lng: place.geometry.location.lng()
                        , desc: "Test"
                        , city: "Test"
                    };
                }));
            } else {
                callback([]);
            }
        }


        placeService.radarSearch(request, newCallback);
    };

    function createMarker(info) {
        var marker = new google.maps.Marker({
            map: map
            , position: new google.maps.LatLng(info.lat, info.lng)
            , title: info.city
        });
        marker.content = '<div class="infoWindowContent">' + info.desc + '<img class="image-reponsive center center-block" src="http://33xlkmrogb473k7z1dknkdmx.wpengine.netdna-cdn.com/wp-content/uploads/2016/05/sushi7.jpg"/>' + '</div>';

        google.maps.event.addListener(marker, 'click', function () {
            infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
            infoWindow.open(map, marker);
        });

        markers.push(marker);
    }

    function reloadMarkers() {
        chunkMarkerUpdate(0, 5);
    }

    var REMOVAL_DELAY = 10; //Only remove every 10 iterations
    var iterationCount = 0;

    function chunkMarkerUpdate(chunk_x, chunk_size) {
        var i;
        for (i = chunk_x; i < chunk_x + chunk_size && (i < places.length || i < markers.length); i++) {
            if (iterationCount == REMOVAL_DELAY && i < markers.length) {
                markers[i].setMap(null);
            } else {
                markers = [];
            }
            if (i < places.length) {
                createMarker(places[i]);
            }
        }
        if (i > 0) {
            window.setTimeout(function () {
                chunkMarkerUpdate(chunk_x + chunk_size, chunk_size)
                iterationCount = (iterationCount + 1) % (REMOVAL_DELAY + 1);
            }, 0);
        }
    }


    google.maps.event.addListener(map, 'bounds_changed', function () {
        placeService.easyNearbySearch("Test", null, null, function (data) {
            for (var i = 0; i < data.length; i++) {
                places = data;
                reloadMarkers();
            }
        });
    });


    function openInfoWindow(e, selectedMarker) {
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
    }
}