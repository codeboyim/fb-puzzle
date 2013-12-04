/*main.js*/

(function(exports) {
    var cal = new SingleDayCal(document.getElementById('container'));
    //a public interface to invoke SingleDayCal class and display events
    exports.layOutDay = function(events) {
        events = events || [];
        cal.layOutDay(events);

        return events.length;
    }

    //load init events
    var initEvents = [{
        start: 30,
        end: 150
    }, {
        start: 540,
        end: 600
    }, {
        start: 560,
        end: 620
    }, {
        start: 610,
        end: 670
    }];

    layOutDay(initEvents);

})(this);
