/** @jsx React.DOM */

(function(exports){

    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

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

        if (event.start < 0) {
            event.start = 0;
        }

        if (event.end > 720) {
            event.end = 720;
        }

    }

    function compareEvents(event1, event2) {

        if (event1.start !== event2.start) {
            return event1.start - event2.start;
        } else {
            return event1.end - event2.end;
        }

    }

    function collidingEvents(event1, event2) {
        return event2.start < event1.end;
    }

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
                
                group = {
                    events: [event],
                    maxCollidingCount: 1
                };

                groups.unshift(group);
            } else {
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


    var CalendarDayBlock = React.createClass({displayName: 'CalendarDayBlock',

        render:function(){
            var totalWidth = 600,
                paddingLeft = 10,            
                groups = this.props.groups ||[],
                groupsLen = groups.length,
                eventBlocks = []; //<EventBlock width:, left:, event:/>
                

            groups.forEach(function(group){
                var eventWidth = Math.round(totalWidth / group.maxCollidingCount),
                    eventStacks = new Array(group.maxCollidingCount);                    

                    group.events.forEach(function(event, i){
                        var colIndex = i % group.maxCollidingCount,
                            j = 0,
                            eventProps = {width:eventWidth, event:event};
                    
                        if (eventStacks[colIndex] && collidingEvents(eventStacks[colIndex], event)) {

                            for (j = 0; j < group.maxCollidingCount; j++) {

                                if (!collidingEvents(eventStacks[j], event)) {
                                    eventStacks[j] = event;
                                    eventProps.left = (paddingLeft + j * eventWidth);
                                    break;
                                }

                            }

                        } else {
                            eventStacks[colIndex] = event;
                            eventProps.left = paddingLeft + colIndex * eventWidth;
                        }

                        eventBlocks.push(eventProps);
                    });
                    
            });
            
            return (
                React.DOM.div( {className:"singleDayCal-day"}, 
                    eventBlocks.map(function(eventProp){
                        return EventBlock( {event:eventProp.event, left:eventProp.left, width:eventProp.width} )
                    })
                )
            );
                
        }

    });

    var EventBlock = React.createClass({displayName: 'EventBlock',

        render: function(){
            
            var event = this.props.event,
                width= this.props.width,
                left = this.props.left,
                eventStyle = {top: event.start, width: width-(GLOBAL_VARS.isLtIE8?4:0), left: left},
                contentStyle={height:event.end-event.start-(GLOBAL_VARS.isLtIE8?2:0)};

            return (
                //since it seems React is struggling to render the HTML5 elements properly in IE8 and below
                //divs is used instead.
                React.DOM.div( {className:"singleDayCal-event", style:eventStyle}, 
                    React.DOM.div( {className:"article", style:contentStyle}, 
                        React.DOM.div( {className:"header"}, 
                            React.DOM.h1(null, "Sample Item"),
                            React.DOM.p(null, "Sample Location")
                        ),
                        React.DOM.div( {className:"section"})
                    )
                )
            );
        }

    });

    var TimeAxis = React.createClass({displayName: 'TimeAxis',
        
        render:function(){

            var tm = moment(),
                ticksCount = Math.ceil((12 * 60) / 30) + 1,
                i = 0,
                timeTicks = [];

            tm.hour(9);
            tm.minute(0);

            for(i=0;i<ticksCount;i++){
                
                timeTicks.push({time:tm.clone(), top:i*30});
                tm.add('m', 30);
            }

            return (
                React.DOM.ul( {className:"singleDayCal-times"}, 
                    timeTicks.map(function(tt){ 
                        var ttStyle= {top: tt.top};
                        return TimeTick( {time:tt.time, style:ttStyle} );
                    })
                )
            );
        }

    });

    var TimeTick = React.createClass({displayName: 'TimeTick',

        render: function() {

            var tm = this.props.time;

            return (
                React.DOM.li( {style:this.props.style}, 
                    tm.minute()===0?React.DOM.em(null, tm.format('h:mm')):tm.format('h:mm'), tm.minute()===0?tm.format('A'):''
                ));     

        }

    });

    var SingleDayCal=React.createClass({displayName: 'SingleDayCal',

        render:function(){

            var events = this.props.events;

            return (
                React.DOM.div( {className:"singleDayCal clearfix"}, 
                    TimeAxis(null ),
                    CalendarDayBlock( {groups:sortAndGroupEvents(events)} )
                )
            );

        }

    });

    exports.layOutDay = function(events) {

        React.renderComponent(
            SingleDayCal( {events:events} ),
            document.getElementById('container')
        );

    }
})(this);