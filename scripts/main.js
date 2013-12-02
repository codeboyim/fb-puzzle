/*main.js*/

(function(exports) {

    // layOutDay: a public interface to invoke SingleDayCal class and display events
    exports.layOutDay = function(events) {

        var cal = new SingleDayCal(events);

        cal.layOutDay();

        return events.length;
    }

    var samples = [{
        start: 90,
        end: 150
    }, {
        start: 260,
        end: 280
    }, {
        start: 80,
        end: 140
    }, {
        start: 210,
        end: 250
    }, {
        start: 210,
        end: 220
    }, {
        start: 165,
        end: 450
    }, {
        start: 160,
        end: 300
    }, {
        start: 180,
        end: 220
    }, {
        start: 175,
        end: 270
    }, {
        start: 240,
        end: 242
    }, {
        start: 180,
        end: 200
    }, {
        start: 350,
        end: 500
    }, {
        start: 400,
        end: 500
    }, {
        start: 540,
        end: 600
    }, {
        start: 580,
        end: 650
    }, {
        start: 600,
        end: 720
    }];

    layOutDay(samples);

})(this);
