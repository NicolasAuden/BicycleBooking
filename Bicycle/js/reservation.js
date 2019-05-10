var Compteur = {
    minutes : 20,
    secondes : 00,
    minutesElt : null,
    secondesElt : null,
    nomStation : null,
    etatStation : null,
    compteARebour : null, // Chrono attributs
    compteARebourTerminer : null, // Chrono attributs when finished
    annulationReservation : false,

    // Init of a booking
    lancementReservation : function() {

        //sessionStorage
        sessionStorage.setItem("minutes", this.minutes);
        sessionStorage.setItem("secondes", this.secondes);
        sessionStorage.setItem("nomStation", Station.nom);
        sessionStorage.setItem("etatStation", Station.etat);

        // Saving sessionStorage of station name and state in attribut
        this.nomStation = sessionStorage.getItem("nomStation");
        this.etatStation = sessionStorage.getItem("etatStation");

        // Hidding elements except location section
        document.getElementById("infoStation").style.display = "none"; // Information modal
        document.getElementById("containerCanvas").style.display = "none"; // Canvas
        document.getElementById("sectionLocation").style.display = "block"; // Location section

        // Confirmation message
        document.getElementById("messageConfirmationLocation").style.display = "block";
        // Extinction of confirm message
        setTimeout(function() {
            document.getElementById("messageConfirmationLocation").style.display = "none";
        }, 3000);

        // Insertion of name station
        document.getElementById("messageLocation").querySelector("strong").innerHTML = this.nomStation;

        // Launching of chrono
        this.compteARebour = setInterval("Compteur.initCompteur()", 1000);
    },

    // Re-initialisation of chrono
    initCompteur : function() {
        if(this.minutes < 10) {
            // Adding 0 before minutes
            this.minutesElt = "0" + this.minutes;
        } else {
            // Or minutes display normally
            this.minutesElt = this.minutes;
        }

        if(this.secondes < 10) {
            this.secondesElt = "0" + this.secondes;
        } else {
            this.secondesElt = this.secondes;
        }

        // Insertion of chrono HTML
        document.getElementById("compteur").innerHTML = this.minutesElt + " : " + this.secondesElt;

        // Launching chrono method
        this.compteurStart();
    },

    // Chrono method
    compteurStart : function() {
        if((this.minutes >= 0) && (this.secondes > 0)) { // While more than 0 second

            // minus seconds
            this.secondes--;
            // SessionStorage set
            sessionStorage.setItem("secondes", this.secondes);

        } else if((this.minutes > 0) && (this.secondes <= 0)) { // If minutes more than 0 and seconds less or equal to 0

            this.secondes = 59;
            this.minutes--;

            // SessionStorage set
            sessionStorage.setItem("minutes", this.minutes);
            sessionStorage.setItem("secondes", this.secondes);

        } else if((this.minutes == 0) && (this.secondes == 0)) { // If minutes and seconds are equal to 0

            // Displaying message for end of booking
            document.getElementById("messageFinLocation").style.display = "block";

            // Hidding booking message
            document.getElementById("messageLocation").style.display = "none";

            // Calling method "compteARebourTerminer"
            this.compteARebourTerminer = setTimeout("Compteur.reservationTerminer()", 4000);
        }
    },

    // Method called at the end of reservation
    reservationTerminer : function() {
        // Stop chrono
        clearInterval(this.compteARebour);

        // Reset chrono attributs
        this.minutes = 20;
        this.secondes = 00;
        this.minutesElt = null;
        this.secondesElt = null;

        // Deleting sessionStorage
        sessionStorage.clear();

        // Stopping method
        clearTimeout(this.compteARebourTerminer);

        // Displaying original elements
        document.getElementById("sectionLocation").style.display = "none";
        document.getElementById("messageFinLocation").style.display = "none";
        document.getElementById("messageLocation").style.display = "block";
    },

    // Cancelling reservation method
    annulerReservation : function() {

        // Displaying confirmation
        document.getElementById("annulationReservation").style.display = "block";
        // Message delete after 3 seconds
        setTimeout(function() {
            document.getElementById("annulationReservation").style.display = "none";
        }, 3000);

        // End of reservation method : erase sessionStorage and stop the chrono
        this.reservationTerminer();
    },

    // Check if a reservation in on when the page is launch or refresh
    verificationSessionStorage : function() {
        if (sessionStorage.getItem("minutes")) { // If there is a booking
            // Getting and saving sessionStorage in the attributs
            this.minutes = sessionStorage.getItem("minutes");
            this.secondes = sessionStorage.getItem("secondes");
            this.nomStation = sessionStorage.getItem("nomStation");
            this.etatStation = sessionStorage.getItem("etatStation");

            // Chrono start at the position it was (setInterval)
            this.compteARebour = setInterval("Compteur.initCompteur()", 1000);

            // Insert station name
            document.getElementById("messageLocation").querySelector("strong").innerHTML = this.nomStation;
            document.getElementById("sectionLocation").style.display = "block";
        } else { // If no booking
            // Hidding booking modal
            document.getElementById("sectionLocation").style.display = "none";
        }
    },

    // Cancelling reservation
    resetReservation : function() {
        if(this.nomStation != Station.nom) { // If booked name station is != of selected name station
            // Display confirmation
            this.annulationReservation = window.confirm("Cette nouvelle réservation annulera la réservation sur la station : " + this.nomStation +
            "\net enregistrera une nouvelle réservation sur la station " + Station.nom);
        } else { // If both names are the same
            // Display confirmation
            this.annulationReservation = window.confirm("Cette nouvelle réservation remplacera la réservation déja existante sur la station : \n" + this.nomStation);
        }

        if (this.annulationReservation) { // If user confirm to cancell present reservation
            // Delete sessionStorage
            sessionStorage.clear();

            // Stop chrono
            clearInterval(this.compteARebour);

            // Reset chrono attributs
            this.minutes = 20;
            this.secondes = 00;
            this.minutesElt = null;
            this.secondesElt = null;

            // Lauching method of new reservation
            this.lancementReservation();
        }
    }
}

// Checking of existing reservation
Compteur.verificationSessionStorage();

// Events on validation of the canvas
document.getElementById("boutonValider").addEventListener("click", function() {

    if (document.getElementById('signature').toDataURL()){
    sessionStorage.setItem("signature", Signature.canvas.toDataURL());
    }
    Signature.clearCanvas(); // Delete canvas
    

    // Checking of existing reservation
    if(sessionStorage.getItem("minutes")) { // If there is a booking
        // Delete existing reservation
        Compteur.resetReservation();
    } else { // No booking
        // Launching method for new reservation
        Compteur.lancementReservation();
    }
    

});

// Event on click on button for cancelling reservation 
document.getElementById("annulation").addEventListener("click", function() {
    // Launching cancel method
    Compteur.annulerReservation();
});
