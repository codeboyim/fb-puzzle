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


    var CalendarDayBlock = React.createClass({

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
                <div className="singleDayCal-day">
                    {eventBlocks.map(function(eventProp){
                        return <EventBlock event={eventProp.event} left={eventProp.left} width={eventProp.width} />
                    })}
                </div>
            );
                
        }

    });

    var EventBlock = React.createClass({

        render: function(){
            
            var event = this.props.event,
                width= this.props.width,
                left = this.props.left,
                eventStyle = {top: event.start, width: width-(GLOBAL_VARS.isLtIE8?4:0), left: left},
                contentStyle={height:event.end-event.start-(GLOBAL_VARS.isLtIE8?2:0)};

            return (
                //since it seems React is struggling to render the HTML5 elements properly in IE8 and below
                //divs is used instead.
                <div className="singleDayCal-event" style={eventStyle}>
                    <div className="article" style={contentStyle}>
                        <div className="header">
                            <h1>Sample Item</h1>
                            <p>Sample Location</p>
                        </div>
                        <div className="section"/>
                    </div>
                </div>
            );
        }

    });

    var TimeAxis = React.createClass({
        
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
                <ul className="singleDayCal-times">
                    {timeTicks.map(function(tt){ 
                        var ttStyle= {top: tt.top};
                        return <TimeTick time={tt.time} style={ttStyle} />;
                    })}
                </ul>
            );
        }

    });

    var TimeTick = React.createClass({

        render: function() {

            var tm = this.props.time;

            return (
                <li style={this.props.style}>
                    {tm.minute()===0?<em>{tm.format('h:mm')}</em>:tm.format('h:mm')} {tm.minute()===0?tm.format('A'):''}
                </li>);     

        }

    });

    var SingleDayCal=React.createClass({

        render:function(){

            var events = this.props.events;

            return (
                <div className="singleDayCal clearfix">
                    <TimeAxis />
                    <CalendarDayBlock groups={sortAndGroupEvents(events)} />
                </div>
            );

        }

    });

    exports.layOutDay = function(events) {

        React.renderComponent(
            <SingleDayCal events={events} />,
            document.getElementById('container')
        );

    }
})(this);