// Signature = canvas
var Signature = {
    // Attributs
    ecriture : false, // Activation of the writing
    canvas : document.getElementById("signature"), // Selecting canvas in the DOM
    context : null, // Canvas use context
    signatureImg : null,

    // Method translating event touch into an event for smartphone screen
    convertTouchEvent : function(ev) {
        var touch, ev_type, mouse_ev;
        touch = ev.targetTouches[0];
        ev.preventDefault();
        switch (ev.type) {
            case 'touchstart':
                // Track if finger is on the target
                if (ev.targetTouches.length != 1) {
                    return;
                }
                touch = ev.targetTouches[0];
                ev_type = 'mousedown';
                break;
            case 'touchmove':
                // Keep tracking
                if (ev.targetTouches.length != 1) {
                    return;
                }
                touch = ev.targetTouches[0];
                ev_type = 'mousemove';
                break;
            case 'touchend':
                // Track while it is released
                if (ev.changedTouches.length != 1) {
                    return;
                }
                touch = ev.changedTouches[0];
                ev_type = 'mouseup';
                break;
            default:
                return;
        }

        mouse_ev = document.createEvent("MouseEvents");
        mouse_ev.initMouseEvent(
            ev_type, // Define events type
            true,
            true,
            window, // view
            0, // Number of mouse clics
            touch.screenX, // Coordinates X of the screen
            touch.screenY, // 
            touch.clientX, // Coordinates X of user
            touch.clientY, // 
            ev.ctrlKey, // Check if "control" has been pressed
            ev.altKey, // Check if "alt" has been pressed
            ev.shiftKey, // Check if "maj" has been pressed
            ev.metaKey, // Check if "meta" has been pressed
            0, // Mouse button
            null // Target
        );
        this.dispatchEvent(mouse_ev);
    },

    // Get the coordinates of the mouse/finger
    getMousePos : function(event) {
        rect = this.canvas.getBoundingClientRect(); // Get the size of the mouse/finger and it's position

        return{
            x:event.clientX - rect.left,
            y:event.clientY - rect.top
        };
    },

    // Get the current mouse/finger position
    deplacementSouris : function(event) {
        sourisPosition = this.getMousePos(event);
        positionX = sourisPosition.x;
        positionY = sourisPosition.y;
        this.dessin(positionX, positionY);
    },

    // Method for drawing in the canvas
    dessin : function(positionX, positionY) {
        this.context = this.canvas.getContext("2d"); // Calling canvas context
        this.context.lineWidth = 5; // Fill style

        if(this.ecriture){
            this.context.lineTo(positionX, positionY); // Check the position of the end of the fill
            this.context.stroke(); // Draw
        }
    },

    // Desactivation of writing
    desactivationDessin : function() {
        this.ecriture = false; // Stop writing
    },

    // Active and start the writing
    activationDessin : function() {
        this.ecriture = true; // Activation of the writing
        this.context.beginPath(); // Start a new path
        this.context.moveTo(positionX, positionY); // Chack the beggining of the drawing
    },

    // Deleting the canvas
    clearCanvas : function() {
        this.context.clearRect(0, 0, 800, 200); // Re-initialisation of the canvas
    }
}

// Calling methods on touch screen
Signature.canvas.addEventListener("touchstart", Signature.convertTouchEvent);
Signature.canvas.addEventListener("touchmove", Signature.convertTouchEvent);
Signature.canvas.addEventListener("touchend", Signature.convertTouchEvent);

// Calling methods for computer
Signature.canvas.addEventListener("mousedown", Signature.activationDessin.bind(Signature));
Signature.canvas.addEventListener("mousemove", Signature.deplacementSouris.bind(Signature));
Signature.canvas.addEventListener("mouseup", Signature.desactivationDessin.bind(Signature));

// Calling delete method of canvas when button "effacer" is pressed
document.getElementById("boutonEffacer").addEventListener("click", function() {
    Signature.clearCanvas();
});
