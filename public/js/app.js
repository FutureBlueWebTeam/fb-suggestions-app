//Data
var places = [];

//GMaps categories with all non-entertainment entries removed
var categories = ["library", "meal_delivery", "meal_takeaway", "movie_rental", "movie_theater", "museum", "night_club", "park", "pet_store", "restaurant", "shoe_store", "shopping_mall", "spa", "stadium", "store", "university", "amusement_park", "aquarium", "art_gallery", "bakery", "bar", "beauty_salon", "book_store", "bowling_alley", "cafe", "campground", "casino", "city_hall", "clothing_store", "convenience_store", "department_store", "electronics_store", "gym"];
var active_categories = ["movie_theater"];

var GOOGLE_API_KEY = "AIzaSyBhy9XlaP1zIdzVMPbJanvr9wLqFxT3r-U";


window.onload = function () {
    var mapOptions = {
        zoom: 12,
        center: new google.maps.LatLng(43.84886, -79.33838),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
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
    }, {
            featureType: 'road',
            elementType: 'all',
            stylers: [
                {
                    color: '#4178BE'
                }
              ]
            }, {
            featureType: 'all',
            elementType: 'all',
            stylers: [
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

    //Request user's location on load
    getUserLocation(function (lat, lng) {
        map.panTo({
            lat: lat,
            lng: lng
        });
        this.marker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(lat, lng),
            title: "You are here!",
            icon: "img/guy.png"
        });
    });

    var markers = []; //Contains all active map markers
    var infoWindow = new google.maps.InfoWindow();

    /* 
    Place object. Contains all information needed to make both markers and info window 
        lat, lng : Location of marker
        placeId : GMaps identifier
        name : Name of place
        desc : Description (we just use top review)
        address : Formatted address string
        categories : All GMaps types describing this place.
    */
    function PlaceObject(arg) {
        this.lat = arg.lat;
        this.lng = arg.lng;
        this.placeId = arg.placeId;
        this.name = arg.name || "Loading...";
        this.desc = arg.desc || "Loading...";
        this.address = arg.address || "Loading...";
        this.categories = arg.categories || [];
        this.isGooglePlace = arg.isGooglePlace;
        this.isLoaded = false;
        this.isDestroyed = false;
        this.imageURL = "";

        this.marker = null; //References the marker

        /*
        Load place-specific details. Is only called on the first mouse event with the marker.
        */
        this.loadDetails = function () {
            if (this.isLoaded || this.isDestroyed) return;
            placeService.getDetails({ //Call details api
                placeId: this.placeId
            }, (placeDetails, status) => { //Arrow function into callback
                if (status === google.maps.places.PlacesServiceStatus.OK) { //Check status
                    this.name = placeDetails.name; //Update details
                    if (placeDetails.reviews) {
                        //Use top review as description
                        this.desc = placeDetails.reviews.reduce(function (last, cur) {
                            if (last.rating < cur.rating) {
                                return cur
                            } else {
                                return last
                            }
                        }).text;
                    } else {
                        this.desc = "No review available."
                    }
                    this.categories = placeDetails.types;
                    this.address = placeDetails.formatted_address;
                    this.rating = placeDetails.rating;
                    this.phone = placeDetails.formatted_phone_number;
                    if (placeDetails.photos) {
                        this.imageURL = placeDetails.photos[0].getUrl({
                            maxWidth: 500
                        });
                    }
                    this.marker.setMap(null); //Destroy existing marker
                    this.createMarker();
                    this.isLoaded = true;
                } else {
                    console.warn(status)
                }
            });
        }

        /*
        Create a new marker if one does not exist
        */
        this.createMarker = function () {
            if (this.isLoaded || this.isDestroyed) return;
            this.marker = new google.maps.Marker({
                map: map,
                position: new google.maps.LatLng(this.lat, this.lng),
                title: this.name,
                icon: "img/pin.png"
            });

            function intToStars(x) {
                var result = "";
                for (var i = 0; i < x; i++) {
                    result += "&#9733;"
                }
                return result;
            }
            var imgHTML;
            if (this.imageURL) {
                imgHTML = '<div class="img-wrapper"><img src="' + this.imageURL + '" alt="Porcelain Factory of Vista Alegre"></div>'
            } else {
                imgHTML = "";
            }
            this.marker.content = `<div class="infoWindowContent">
                                        <h2 class="iw-title">` + this.name + `</h2>
                                        <p class="iw-rating">` + intToStars(this.rating) + `</p>
                                        ` + imgHTML + `
                                        <p class="iw-desc">` + this.desc + `</p>
                                        <p class="iw-phone">` + this.phone + `</p>
                                    </div>`
            markers.push(this.marker);

            google.maps.event.addListener(this.marker, 'mouseover', () => {
                this.loadDetails();
            });

            google.maps.event.addListener(this.marker, 'click', () => {
                infoWindow.setContent(this.marker.content);
                window.setTimeout(() => {
                    infoWindow.open(map, this.marker);
                }, 300);

            });
        }

        this.destroy = function () {
            this.isDestroyed = true;
            this.marker.setMap(null);
        }
    }

    /*
    Wrapper for the radar search
        keyword : A query string that will search name, description, type, etc
        callback : Function that will receive the partially-loaded place objects
    */
    placeService.easyRadarSearch = function (keyword, callback) {
        var request = {
            bounds: map.getBounds(),
            keyword: keyword,
            openNow: false,
            type: active_categories
        };

        //Processes the returned results for just the information we need
        function processResults(results, status) {
            var parsedResults = [];
            if (status == google.maps.places.PlacesServiceStatus.OK) { //Check for OK status
                newResults = [];
                for (var i = 0; i < results.length; i++) {
                    var place = results[i];
                    //Create the object
                    var newPlace = new PlaceObject({
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                        placeId: place.place_id,
                        isGooglePlace: true
                    });
                    newPlace.createMarker();
                    newResults.push(newPlace);
                }
                callback(newResults); //We can continue with the callback as the details will reload later
            } else {
                callback([]);
            }
        }

        placeService.radarSearch(request, processResults); //Call the api
    };


    //On bounds change, do a radar search
    var MAX_PLACES_LOADED = 100;
    var searchQuery = null;

    /*
     * Loads new markers.
     */
    function loadNewPlaces(query) {
        placeService.easyRadarSearch(query, function (data) {
            if (places.length > MAX_PLACES_LOADED) {
                markers = [];
                for (var i = 0; i < places.length; i++) {
                    places[i].destroy();
                }
                places = data;
            } else {
                places = removeDuplicatePlaces(places.concat(data));
            }
        });
    }
    google.maps.event.addListener(map, 'bounds_changed', function () {
        loadNewPlaces(searchQuery, loadNewPlaces);
    });


    // -----------------------------------------Search Functionality-------------------------------------------------//


    /**
     * Reloads the places with the query and selected category filters
     */
    function submitSearch() {
        console.log("submitSearch: " + getSearchValue());
        var matches = [];
        // This isn't working must change this to a normal for loop or figure out for each properly
        var searchQuery = document.getElementById("search-bar").value;
        loadNewPlaces(searchQuery, true, loadNewPlaces);
    }
    document.getElementById("search-button").onclick = submitSearch;

    /*
     TODO: Content assist and client-side place filtering.
     */
    document.getElementById("search-bar").onkeyup = function () {
        var ENTER = 13;
        if (event.keyCode == ENTER) {
            submitSearch();
            return;
        }
    }


    /*
     Removes duplicate PlaceObjects from array, preferring older entries
     */
    function removeDuplicatePlaces(array) {
        var a = array.concat();
        for (var i = 0; i < a.length; ++i) {
            for (var j = i + 1; j < a.length; ++j) {
                if (a[i].placeId === a[j].placeId) {
                    a[j].destroy();
                    a.splice(j--, 1);
                }
            }
        }
        return a;
    }

    /*
    HTML5 Geolocation
    */
    function getUserLocation(callback) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) { //Ask for user's location
                    callback(position.coords.latitude, position.coords.longitude);
                },
                function (error) { //If permission is denied...
                    callback(43.848855, -79.338380);
                }
            );
        } else { //If geolocation is not supported...
            callback(43.848855, -79.338380);
        }
    }

    //Slider code
    var menuHidden = true;
    if (menuHidden) {
        document.getElementById("hamburger").onclick = function () {
            menuHidden = !menuHidden;
            if (menuHidden) {
                document.getElementById("menu").className = "slide-menu-left";
            } else {
                document.getElementById("menu").className = "slide-menu-right";
            }
        }
    }

}