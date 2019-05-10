// maps =  Google maps and markers
var Maps = {
    lat : 45.7579341,
    long : 4.8552300, 
    iconBase : "./img/marqueurs/default_marqueur.png",
    tableauMarqueur : [], // Array where the markers will be add gather (marker Clusterer)

    // Map initialization
    initMap : function() {
        map = new google.maps.Map(document.getElementById('carte'), {
            center : { lat: this.lat, lng: this.long},
            zoom : 13,
            scrollwheel: false
        });
    },

    // Define which station is open or closed
    iconMarqueur : function(statusStation) {
        if(statusStation === "OPEN") {
            this.iconBase = "./img/marqueurs/vert.png"; // Green marker for each available station
        } else if(statusStation === "CLOSED") {
            this.iconBase = "./img/marqueurs/rouge.png"; // Red marker for each unavailable station
        }
        if (localStorage) {
            document.getElementById('nom').value = localStorage.getItem('nom');
            document.getElementById('prenom').value = localStorage.getItem('prenom');
            }
    },

    // Intégration of the markers on the map
    initMarqueur : function(positionStation) {
        marqueur = new google.maps.Marker({
            map : map,
            icon: this.iconBase,
            position : positionStation // Markers position
        });
        this.tableauMarqueur.push(marqueur); // Collect the markers in the array
    },

    // Gathering markers
    regroupementMarqueurs : function() {
        marqueurCluster = new MarkerClusterer(map, this.tableauMarqueur,
        {
            imagePath : "./img/marqueurs/m", // markerClusterer icone
        });
    },

    // Street View
    vueRue : function(positionStation) {
        streetView = new google.maps.StreetViewPanorama(document.getElementById("streetView"),{
            position: positionStation,
            linksControl: false,
            panControl: false
        });
    }
};

// Objet Station
var Station = {
    // Attributs
    nom : null, // Station name
    etat : null, // State name (OPEN or CLOSED)
    nbVelo : null, // Numbers of bicyle
    nbAttache : null, // Numbers of fixation for bicycle
    emplacementDonnees : document.getElementById("listeInfo").querySelectorAll("span"), // Where data will be display (HTML)
    autorisation : null, // Allowed or not to make a reservation

    // Ajax to get the list of Velo'v stations
    ajaxGet : function(url, callback) {
        req = new XMLHttpRequest(); // HTTP request creation
        req.open("GET", url); // HTTP request GET asynchrone
        req.addEventListener("load", function() {
            if (req.status >= 200 && req.status < 400) {
                // callback
                callback(req.responseText);
            } else {
                console.error(req.status + " " + req.statusText + " " + url);
            }
        });
        req.addEventListener("error", function() {
            console.error("Erreur réseau avec l'URL " + url);
        });
        req.send(null); // Sending request
    },

    // Getting station datas
    traitementDonneesStation : function(donneesStation) {
        
        this.nom = donneesStation.name;
        
        this.etat = donneesStation.status;
        
        if((sessionStorage.getItem("minutes")) && (Compteur.nomStation === this.nom)) { // If booking at station
            this.nbVelo = donneesStation.available_bikes - 1; // -1 bicyle at the station
        } else {
            this.nbVelo = donneesStation.available_bikes; // Displaying the real number of bicyle preent at the station
        }
        // Fixation number
        this.nbAttache = donneesStation.available_bike_stands;
    },

    // Putting the datas in the HTML
    insertionDonneesStation : function() {
        
        document.getElementById("nomStation").innerHTML = this.nom;
        document.getElementById("etatStation").innerHTML = this.etat;
        document.getElementById("veloDispo").innerHTML = this.nbVelo;
        document.getElementById("attacheDispo").innerHTML = this.nbAttache;
    },

    // Permission or not to make a reservation
    autorisationReservation : function() {
        if(this.etat === "CLOSED") {

            // Translation in french
            this.etat = "FERMÉ";
            // State field red
            document.getElementById("etatStation").style.color = "red";
            // Bicycle number red
            document.getElementById("veloDispo").style.color = "red";
            // Booking not allowed
            this.autorisation = false;

        } else if(this.etat === "OPEN") {
            
            this.etat = "OUVERT";
            document.getElementById("etatStation").style.color = "";
            this.autorisation = true;

            if(this.nbVelo === 0) { // If bicycle number = 0

                // State field red
                document.getElementById("veloDispo").style.color = "red";
                // Booking not allowed
                this.autorisation = false;

            } else if(this.nbVelo > 0) {

                // Field original color
                document.getElementById("veloDispo").style.color = "";

            }
        }
    }
};

// Ajax call and getting station names
Station.ajaxGet("https://api.jcdecaux.com/vls/v1/stations?contract=Lyon&apiKey=5ac8dcb545650319f8b2dd57ee3b76c83f23db6c", function(reponse) {
    listeStations = JSON.parse(reponse);

    // Reading datas stations
    listeStations.forEach(function(reponseInfoStation) {

        // Calling method for icone attribution
        Maps.iconMarqueur(reponseInfoStation.status);

        // Calling initMarqueur method to put the markers on the map
        Maps.initMarqueur(reponseInfoStation.position);

        // Adding event while a marker is pressed
        google.maps.event.addListener(marqueur, "click", function() {

            // Insertion of datas into the object "station"
            Station.traitementDonneesStation(reponseInfoStation);

            // Hidding elements
            document.getElementById("messageErreur").style.display = "none"; // error message
            document.getElementById("containerCanvas").style.display = "none"; // canvas

            // Displaying modal with informations of the selectionned station
            document.getElementById("infoStation").style.display = "block";

            // Insertion of Street View
            Maps.vueRue(reponseInfoStation.position);

            // Checking authorization
            Station.autorisationReservation();

            // Insertion of the datas in hte modal
            Station.insertionDonneesStation();

        }); // End of clic marker event
    }); // End of reading datas stations

    // Events on booking button
    document.getElementById("bouttonReservation").querySelector("button").addEventListener("click", function(){

        if(Station.autorisation) { // If authorization

            // Insertion of station name
            document.getElementById("containerCanvas").querySelector("strong").innerHTML = Station.nom;
            // Displaying canvas
            document.getElementById("containerCanvas").style.display = "block";
            // Showing canvas
            window.scrollTo(0,900);

        } else { // If no authorization

            // Error message
            document.getElementById("messageErreur").style.display = "block";
            // Error message disappear after 5 seconds
            setTimeout(function() {
                document.getElementById("messageErreur").style.display = "none";
            },5000);
        }

    });

    // Calling "marker Clusterer" method
    Maps.regroupementMarqueurs();
});
