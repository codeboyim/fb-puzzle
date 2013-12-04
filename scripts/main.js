/*main.js*/

(function(exports) {

    //a public interface to invoke SingleDayCal class and display events
    exports.layOutDay = function(events) {
        var cal = new SingleDayCal(events, document.getElementById('container'));

        cal.layOutDay();

        return events.length;
    }

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
