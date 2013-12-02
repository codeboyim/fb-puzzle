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


    //get live style of elm 

    function getComputedStyle(elm) {
        return window.getComputedStyle ? window.getComputedStyle(elm) : elm.currentStyle;
    }

    //varify numeric input

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

    //sort events by starting time and group colliding events and
    //return reversed groups with latest inserted group in the most front.

    function sortAndGroupEvents(events) {
        var groups = [];

        if (!Array.isArray(events) || !events.length) {
            return groups;
        }

        events.sort(compareEvents);

        events.forEach(function(event, i) {
            var eventAdded = false,
                collideCount = 1,
                groupEvent,
                groupEventsLen,
                group,
                j;

            rectifyEvent(event);

            if (i === 0) {
                //init a group
                group = {
                    //store all the indexes of colliding events
                    events: [event],
                    //store the max number of colliding events of the group. default to 1 if no other event in the same group
                    maxCollidingCount: 1
                };
                groups.unshift(group);

            } else {
                //find last added group
                group = groups[0];
                groupEventsLen = group.events.length;

                for (j = 0; j < groupEventsLen; j++) {

                    groupEvent = group.events[j];

                    if (collidingEvents(groupEvent, event)) {

                        if (!eventAdded) {

                            group.events.push(event);
                            eventAdded = true;

                        }

                        collideCount++;
                    }

                }

                if (collideCount === 1) {
                    //no collding happens, create a new group
                    group = {
                        events: [event],
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

    //render and return a 'day' wrapper including all group elements. 

    function renderEvents(reversedGroups, container) {
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

    //create and return a html domcument fragment holding group elements

    function createGroupElement(group, totalWidth, containerPaddingLeft) {

        var eventWidth = Math.round(totalWidth / group.maxCollidingCount),
            eventStacks = new Array(group.maxCollidingCount),
            groupElm = document.createDocumentFragment(),
            event,
            elm,
            colIndex = 0,
            i = 0,
            j = 0;

        group.events.forEach(function(event) {
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
            i++;

        });

        return groupElm;
    }

    //create and return a html dom element for 'event' object

    function createEventElement(event, width) {
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

        return eventElm;
    }

    //display times - axis y

    function renderTimeIntervals(container) {
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


    //a public class to load and display a list of events in a single day calendar 

    var SingleDayCal = function(events, container) {

        if (!Array.isArray(events)) {
            throw new Error('SingleDayCal(): argument \'events\' must be an array.')
        }

        if (container && !container.tagName) {
            throw new Error('SingleDayCal(): argument \'container\' must be a html dom element.')
        }

        this._events = events;
        this._container = container || defaultContainer;

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
