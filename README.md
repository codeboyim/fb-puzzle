fb-puzzle
=========
<br/>
This is my solution to one of the puzzles from Facebook given to the applicants who are interested in the Front-End Engineer position (UI/UX team). It comprises two implementations. They both use same algorithm for calculating the right position for each event block. One is using vanilla JavaScript innerHTML for rendering while the other which is under "/react" uses reactjs, a UI framework created by Facebook engineers.
<br/><br/>
###tl;dr Code Challenge:###   
<br/>
>Given a set of events, render the events on a single day calendar (similar to Outlook, Calendar.app, and Google Calendar). There are several properties of the layout:
    1. No events may visually overlap.
    2. If two events collide in time, they must have the same width.
    3. An event should utilize the maximum width available, but constraint 2) takes precedence over this constraint.
Each event is represented by a JS object with a start and end attribute.
The value of these attributes is the number of minutes since 9am. So
{start:30, end:90) represents an event from 9:30am to 10:30am. The events
should be rendered in a container that is 620px wide (600px + 10px padding
on the left/right) and 720px (the day will end at 9pm)
<br/><br/>
>There must be a
following function in the global namespace which takes in an array
of events and will lay out the events according to the above description.
function layOutDay(events) {}
This function will be invoked from the console for testing purposes. If it
cannot be invoked, the submission will be rejected.
<br/><br/>
You may structure your code however you like, your solution will be run
through a suite of test cases and evaluated on *correctness*, *elegance*, and
*readability*.

<br/>
Declaimer
--------
<br/>
**DO NOT USE IN YOUR JOB APPLICATION**

**This repo is used for private archievement. It's NOT actively maintained. There is no guarantee on the quality or the correctness of the code, nor to move you to the next step in pursuing a front-end engineer position in Facebook.  **



