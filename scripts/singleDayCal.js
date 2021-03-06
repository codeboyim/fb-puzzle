/*singleDayCal.js*/

var SingleDayCal = (function(exports) {
    'use strict';

    var minStart = 0,
        maxEnd = 720,
        maxWidth = 600,
        startHour = 9,
        endHour = 21,
        timeInterval = 30,
        eventIEOffset = !GLOBAL_VARS.isLtIE8 ? null : {
            // offset for width/height in IE 6/7
            x: 4,
            y: 2
        },
        eventTemplate = '<div class="singleDayCal-event"><article><header><h1>Sample Item</h1><p>Sample Location</p></header><section></section></article></div>';


    //validate numeric input

    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    //validate and correct 'event' object

    function rectifyEvent(event) {
        var tmp;

        if (!isNumeric(event.start) || !isNumeric(event.end)) {
            throw new Error('rectifyEvent: argument \'event\' must have numeric start and end values.');
        }

        if (event.start > event.end) {
            tmp = event.end;
            event.end = event.start;
            event.start = tmp;
        }

        if (event.start < minStart) {
            event.start = minStart;
        }

        if (event.end > maxEnd) {
            event.end = maxEnd;
        }

    }

    //define compare function for sorting

    function compareEvents(event1, event2) {

        if (event1.start !== event2.start) {
            return event1.start - event2.start;
        } else {
            return event1.end - event2.end;
        }

    }

    //define why event2 (later) collides event1 (earlier)

    function collidingEvents(event1, event2) {
        return event2.start < event1.end;
    }

    //sort events by starting time and group colliding events

    function sortAndGroupEvents(events) {
        var groups = [];

        if (!Array.isArray(events) || !events.length) {
            return groups;
        }

        events.sort(compareEvents);

        events.forEach(function(event, i) {
            var eventAdded = false,
                collideCount = 1,
                group;

            rectifyEvent(event);

            if (i === 0) {
                //create a new group
                group = {
                    //store all the indexes of colliding events
                    events: [event],
                    //store the max number of colliding events of the group. default to 1
                    maxCollidingCount: 1
                };

                groups.push(group);

            } else {
                //find last added group
                group = groups[groups.length - 1];

                group.events.forEach(function(groupEvent) {

                    if (collidingEvents(groupEvent, event)) {

                        if (!eventAdded) {
                            group.events.push(event);
                            eventAdded = true;
                        }

                        collideCount++;
                    }

                })

                if (collideCount === 1) {
                    //no collding happens, create a new group
                    group = {
                        events: [event],
                        maxCollidingCount: 1
                    };

                    groups.push(group);

                } else if (collideCount > group.maxCollidingCount) {
                    group.maxCollidingCount = collideCount;
                }

            }

        });

        return groups;
    }

    //create and return a html dom element for 'event' object

    function createEventElement(event, width, left) {
        var eventElm,
            tmpElm,
            height = event.end - event.start - (eventIEOffset ? eventIEOffset.y : 0),
            width = width - (eventIEOffset ? eventIEOffset.x : 0);

        tmpElm = document.createElement('div');
        tmpElm.innerHTML = eventTemplate;

        eventElm = tmpElm.firstChild;
        eventElm.style.top = event.start + 'px';
        eventElm.style.left = left + 'px';
        eventElm.style.width = width + 'px';
        eventElm.firstChild.style.height = height > 0 ? (height + 'px') : 0;

        return eventElm;
    }

    //render all grouped events

    function renderEvents(events, parentElm, dayElm) {
        var groups = sortAndGroupEvents(events);

        if (!dayElm) {
            dayElm = document.createElement('div');
            dayElm.className = 'singleDayCal-day';
        } else {
            dayElm.innerHTML = '';
        }

        groups.forEach(function(group) {
            var eventWidth = Math.round(maxWidth / group.maxCollidingCount),
                eventStacks = new Array(group.maxCollidingCount),
                groupElm = document.createDocumentFragment();

            group.events.forEach(function(event, i) {
                var j,
                    left,
                    colIndex = i % (group.maxCollidingCount);

                if (eventStacks[colIndex] && collidingEvents(eventStacks[colIndex], event)) {
                    //only to seek another stack when current stack doesn't fit
                    //events scatter better and there are less loops.

                    for (j = 0; j < group.maxCollidingCount; j++) {

                        if (!collidingEvents(eventStacks[j], event)) {
                            eventStacks[j] = event;
                            left = j * eventWidth;
                            break;
                        }

                    }

                } else {
                    eventStacks[colIndex] = event;
                    left = colIndex * eventWidth;
                }

                dayElm.appendChild(createEventElement(event, eventWidth, left));
            });

        });

        parentElm.appendChild(dayElm);

        return dayElm;
    }

    //display times - axis y

    function renderTimeIntervals(parentElm) {
        var timeTicksElm = document.createElement('ul'),
            ticksCount = Math.ceil((endHour - startHour) * 60 / timeInterval) + 1,
            i,
            tickHtml = '',
            tm = moment(),
            mins,
            top;

        timeTicksElm.className = 'singleDayCal-times';
        tm.hour(startHour);
        tm.minute(0);

        for (i = 0; i < ticksCount; i++) {
            mins = i * timeInterval;
            top = mins;

            if (mins % 60 === 0) {
                tickHtml += '<li style="top: ' + top + 'px"><em>' + tm.format('h:mm') + '</em>' + tm.format('A') + '</li>';
            } else {
                tickHtml += '<li style="top: ' + top + 'px">' + tm.format('h:mm') + '</li>';
            }

            tm.add('m', timeInterval);
        }

        timeTicksElm.innerHTML = tickHtml;
        parentElm.appendChild(timeTicksElm);

        return timeTicksElm;
    }


    //a public class to load and display a list of events in a single day calendar 

    var SingleDayCal = function(container, events) {

        if (!container || !container.tagName) {
            throw new Error('SingleDayCal(): argument \'container\' must be a html dom element.')
        }

        if (events && !Array.isArray(events)) {
            throw new Error('SingleDayCal(): argument \'events\' must be an array.')
        }

        this._events = events;
        this._wrapper = document.createElement('div');
        this._wrapper.className = 'singleDayCal';
        this._timeIntevalsWrapper = null;
        this._eventsWrapper = null;
        container.innerHTML = '';
        container.appendChild(this._wrapper);
    };

    SingleDayCal.prototype = {

        layOutDay: function(events) {

            if (events && !Array.isArray(events)) {
                throw new Error('SingleDayCal(): argument \'events\' must be an array.')
            }

            if (!this._timeIntevalsWrapper) {
                this._timeIntevalsWrapper = renderTimeIntervals(this._wrapper);
            }

            this._eventsWrapper = renderEvents(events || this._events, this._wrapper, this._eventsWrapper);

            return this;
        }

    }

    return SingleDayCal;
})(this);
