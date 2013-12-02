/*singleDayCal.js*/

var SingleDayCal = (function(exports) {
    'use strict';

    var minStart = 0,
        maxEnd = 720,
        startHour = 9,
        endHour = 21,
        timeInterval = 30,
        isLtIE8 = !! GLOBAL_VARS.isLtIE8,
        eventIEOffset = !isLtIE8 ? null : {
            // offset for width/height in IE 6/7
            x: 4,
            y: 2
        },
        defaultContainer = document.getElementById('container'),
        eventTemplate = '<div class="singleDayCal-event"><div class="content"><h2 class="header">Sample Item</h2><p class="body">Sample Location</p></div></div>';

    /*
        helper functions
    */

    function getComputedStyle(elm) {
        return window.getComputedStyle ? window.getComputedStyle(elm) : elm.currentStyle;
    }

    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }


    var EventList = function(event) {
        //a data structure to persist events in the same colliding group

        if (typeof(event) !== 'undefined' && event !== null) {

            if (!isNumeric(event.start) || !isNumeric(event.end)) {
                throw new Error('EventList: argument \'event\' must have numeric start and end values.');
            }

            this.event = event;
            this.next = null;
        }

    }

    EventList.prototype = {

        add: function(event) {

            var current = this;

            if (typeof(event) === 'undefined' || event === null) {
                throw new Error('EventList.add(): argument \'event\' must not be undefined or null.');
            }

            if (!isNumeric(event.start) || !isNumeric(event.end)) {
                throw new Error('EventList.add(): argument \'event\ must have numeric start and end values.');
            }

            if (!current.event) {

                current.event = event;

            } else {

                while (current.next) {

                    current = current.next;
                }

                current.next = {
                    event: event,
                    next: null
                }

            }

            return event;
        }
    };

    function rectifyEvent(event) {
        //validates and corrects 'event' object

        var tmp;

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

    function compareEvents(event1, event2) {
        //defines compare function for sorting

        if (event1.start !== event2.start) {
            return event1.start - event2.start;
        } else {
            return event1.end - event2.end;
        }

    }

    function collidingEvents(event1, event2) {
        //defines why event2 (later) collides event1 (earlier)

        return event2.start < event1.end;

    }

    function sortAndGroupEvents(events) {
        //sorts events by starting time and group colliding events and
        //returns reversed groups with latest inserted group in the most front.

        var groups = [];

        if (!Array.isArray(events) || !events.length) {
            return groups;
        }

        events.sort(compareEvents);

        events.forEach(function(event, i) {

            var eventAdded = false,
                collideCount = 0,
                current,
                groupEvent,
                group;

            rectifyEvent(event);

            if (i === 0) {
                //init a group
                group = {
                    eventList: new EventList(event),
                    //store all the indexes of colliding events
                    maxCollidingCount: 1
                    //store the max number of colliding events of the group. default to 1 if no other event in the same group
                };

                groups.unshift(group);

            } else {
                
                group = groups[0];
                //find last added group

                current = group.eventList;
                groupEvent = current.event;
                collideCount = 1;

                while (groupEvent && event != groupEvent) {
                    //find if colliding with any events in the group

                    if (collidingEvents(groupEvent, event)) {

                        if (!eventAdded) {
                            group.eventList.add(event);
                            eventAdded = true;
                        }

                        collideCount++;
                    }

                    current = current ? current.next : null;
                    groupEvent = current ? current.event : null;

                }

                if (collideCount === 1) {
                    //no collding happens, create a new group

                    group = {
                        eventList: new EventList(event),
                        maxCollidingCount: 1
                    };

                    groups.unshift(group);

                } else if (collideCount > group.maxCollidingCount) {

                    group.maxCollidingCount = collideCount;

                }

            }
        });

        return groups;
    }

    function renderEvents(reversedGroups, container) {
        //creates and returns a 'day' wrapper including all group elements. 

        var containerComputedCss,
            totalWidth,
            containerPaddingLeft,
            groupsLen = 0,
            i = 0,
            groupWrapper,
            elmDay = document.createElement('div');


        elmDay.className = 'singleDayCal-day';
        container.appendChild(elmDay);

        containerComputedCss = getComputedStyle(elmDay);
        totalWidth = parseInt(containerComputedCss.width) || 0;
        containerPaddingLeft = parseInt(containerComputedCss.paddingLeft) || 0;
        reversedGroups = !Array.isArray(reversedGroups) ? [] : reversedGroups;
        groupsLen = reversedGroups.length;

        for (i = groupsLen - 1; i >= 0; i--) {

            elmDay.appendChild(createGroupElement(reversedGroups[i], totalWidth, containerPaddingLeft));
        }

        return elmDay;
    }

    function createGroupElement(group, totalWidth, containerPaddingLeft) {
        //creates and returns a html domcument fragment holding group elements

        var eventWidth = Math.round(totalWidth / group.maxCollidingCount),
            //all events in the same colliding group will have same width according to 2)
            eventStacks = new Array(group.maxCollidingCount),
            //store the latest end value of each stack
            current = group.eventList,
            groupElm = document.createDocumentFragment(),
            event,
            elm,
            colIndex = 0,
            i = 0,
            j = 0;


        while (current) {

            event = current.event;
            elm = createEventElement(event, eventWidth);
            colIndex = i % (group.maxCollidingCount);

            if (eventStacks[colIndex] && collidingEvents(eventStacks[colIndex], event)) {
                //only to seek another stack when current stack doesn't fit
                //events scatter better and there are less loops.

                for (j = 0; j < group.maxCollidingCount; j++) {

                    if (!collidingEvents(eventStacks[j], event)) {
                        eventStacks[j] = event;
                        elm.style.left = (containerPaddingLeft + j * eventWidth) + 'px';
                        break;
                    }

                }

            } else {

                eventStacks[colIndex] = event;
                elm.style.left = (containerPaddingLeft + colIndex * eventWidth) + 'px';
            }

            groupElm.appendChild(elm);
            current = current.next;
            i++;
        }

        return groupElm;
    }

    function createEventElement(event, width) {
        //creates and returns a html dom element for 'event' object

        var eventElm,
            tmpElm,
            height = event.end - event.start - (eventIEOffset ? eventIEOffset.y : 0),
            width = width - (eventIEOffset ? eventIEOffset.x : 0);

        tmpElm = document.createElement('div');
        tmpElm.innerHTML = eventTemplate;
        eventElm = tmpElm.firstChild;
        eventElm.style.top = event.start + 'px';
        eventElm.style.width = width + 'px';
        eventElm.firstChild.style.height = height > 0 ? (height + 'px') : 0;

        //TO REMOVE
        eventElm.setAttribute('title', event.start + ' - ' + event.end);

        return eventElm;
    }

    function renderTimeIntervals(container) {
        //displays times - axis y

        var elmTimeTicks = document.createElement('ul'),
            ticksCount = Math.ceil((endHour - startHour) * 60 / timeInterval) + 1,
            i,
            tickHtml = '',
            tm = moment(),
            mins,
            top;


        elmTimeTicks.className = 'singleDayCal-times';
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

        elmTimeTicks.innerHTML = tickHtml;
        container.appendChild(elmTimeTicks);


        return elmTimeTicks;
    }

    var SingleDayCal = function(events, container) {
        //a public class to load and display a list of events in a single day calendar 

        this._events = events;
        this._container = container || defaultContainer;

        if (!Array.isArray(this._events)) {
            throw new Error('SingleDayCal(): argument \'events\' must be an array.')
        }

        if (!this._container || !this._container.tagName) {
            throw new Error('SingleDayCal(): argument \'container\' must be a html dom element.')
        }

    };

    SingleDayCal.prototype = {

        layOutDay: function() {

            var wrapper = document.createElement('div');

            wrapper.className = 'singleDayCal';
            this._container.innerHTML = '';
            this._container.appendChild(wrapper);

            renderTimeIntervals(wrapper)
            renderEvents(sortAndGroupEvents(this._events), wrapper);

            return this;
        }

    }

    return SingleDayCal;

})(this);
