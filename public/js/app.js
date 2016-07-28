//Data
var places = [{
    name: 'EventName',
    desc: 'This is the description',
    lat: 40.84886,
    long: 40.84886,
    category: 'event'
}];

var cities = [{
    city: '8200 Warden Avenue',
    desc: 'IBM Canada Software Lab - Toronto, 8200 Warden Avenue, Markham, ON L6G 1C7',
    lat: 43.84886,
    long: -79.33838
}, {
    city: '3600 Steeles Avenue East',
    desc: 'IBM Canada Ltd., 3600 Steeles Avenue East, Markham, ON L3R 9Z7',
    lat: 43.81838,
    long: -79.33421
}, {
    city: '120 Bloor Street East',
    desc: 'IBM, 120 Bloor Street East, Toronto, ON M4W 1B7',
    lat: 43.67128,
    long: -79.38389
}, {
    city: '3755 Riverside Drive',
    desc: 'IBM Canada Inc., 3755 Riverside Drive, Ottawa, ON K1V 1B8',
    lat: 45.34053,
    long: -75.69045
}, {
    city: '770 Palladium Drive',
    desc: 'IBM, 770 Palladium Drive, Ottawa, ON K2V',
    lat: 45.29837,
    long: -75.92174
}];

// Placeholder until the checkbox is implemented to retrieve what categories are being searched for
var categories = [
    'event',
    'food'
];

var GOOGLE_API_KEY = "AIzaSyBhy9XlaP1zIdzVMPbJanvr9wLqFxT3r-U";

window.onload = function() {
    var mapOptions = {
        zoom: 12,
        center: new google.maps.LatLng(43.84886, -79.33838),
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        mapTypeControl: false,
        styles: [{
            stylers: [{
                visibility: 'simplified'
            }]
        }, {
            elementType: 'labels',
            stylers: [{
                visibility: 'off'
            }]
        }]
    }

    var map = new google.maps.Map(document.getElementById('map'), mapOptions);
    var placeService = new google.maps.places.PlacesService(map);

    var markers = [];

    var infoWindow = new google.maps.InfoWindow();

    map.getViewRadius = function() {
        var bounds = map.getBounds();

        var center = bounds.getCenter();
        var ne = bounds.getNorthEast();

        // r = radius of the earth in metres
        var r = 6371000;

        // Convert lat or lng from decimal degrees into radians (divide by 57.2958)
        var lat1 = center.lat() / 57.2958;
        var lon1 = center.lng() / 57.2958;
        var lat2 = ne.lat() / 57.2958;
        var lon2 = ne.lng() / 57.2958;

        // distance = circle radius from center to Northeast corner of bounds
        var dis = r * Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1));

        return Math.floor(dis);
    }

    placeService.easyNearbySearch = function(keyword, type, openNow, callback) {
        var request = {
            bounds: map.getBounds(),
            keyword: keyword,
            openNow: openNow,
            type: type
        };

        placeService.radarSearch(request, function(results, status) {
            var parsedResults = [];
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                callback(results.map(function(place) {
                    return {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    };
                }));
            } else {
                callback([]);
            }
        });
    };

    function createMarker(info) {
        var marker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(info.lat, info.long),
            title: info.city
        });
        marker.content = '<div class="infoWindowContent">' + info.desc + '<img class="image-reponsive center center-block" src="http://33xlkmrogb473k7z1dknkdmx.wpengine.netdna-cdn.com/wp-content/uploads/2016/05/sushi7.jpg"/>' + '</div>';

        google.maps.event.addListener(marker, 'click', function() {
            infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
            infoWindow.open(map, marker);
        });

        markers.push(marker);
    }
    for (i = 0; i < cities.length; i++) {
        createMarker(cities[i]);
    }
    google.maps.event.addListener(map, 'bounds_changed', function() {
        placeService.easyNearbySearch("Test", function(data) {
            console.log(data)
        });
    });


    function openInfoWindow(e, selectedMarker) {
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
    }

    // -----------------------------------------Search Functionality-------------------------------------------------//

    // When search button pressed call search
    document.getElementById("search-button").onclick = submitSearch;

    // When search input submitted call search
    document.getElementById("search-bar").onkeyup = onChangeSearch;


    /**
     * Search the data in app.js for names matching the search term falling in the appropriate categories specified by the checkbox under the search bar
     * @return {void} void
     */
    function submitSearch() {
        console.log("submitSearch: " + getSearchValue());
        var matches = [];
        // This isn't working must change this to a normal for loop or figure out for each properly
        for (var i = 0; i < places.length; i++) {
            if (categories.indexOf(places[i].category) >= 0 &&
                (places[i].name.toLowerCase().indexOf(getSearchValue().toLowerCase()) != -1)) {
                console.log("Found the entry:\nName:" + places[i].name + "\nCategory:" + places[i].category);
            }
        }
    }

    /**
     * When enter is pressed submit the input, leaves room to also perform searches during a users typing to provide content assist in the future
     * @return {void} void
     */
    function onChangeSearch() {
        var ENTER = 13;
        if (event.keyCode == ENTER) {
            submitSearch();
            return;
        }
    }

    /**
     * Get the value in the search bar
     * @return {String} value in search bar
     */
    function getSearchValue() {
        return document.getElementById("search-bar").value;
    }
}
