# Media-progress favicons (MPF)

## Description

MPF adds a circular progress meter to tab favicons to show how far the media (video or audio) playback has progressed. MPF requires access to data of all web-pages because to make this work the the extension needs to access the media elements on each page.

MPF doesn't do anything before some tab actually becomes audible.

## Technicalities

MPF has three components:

1. background-script.js - when a tab becomes audible this adds required scripts to that tab
2. content-script.js - sent to top-level frame only - functions that modify the page favicon.
3. frame-script.js - sent to all frames in the tab - functions to determine current playback position of media

The content-script lives in top-level frame only since the tab favicon is that of top-level frame. Frame-script adds an function to be run on an variable length interval that determines the playback position in that frame and then does one of the following:

1. Use an update function defined by content-script if the frame-script is in top-level frame
2. Sends a message to background-script that passes that message to the top-level frame, which then updates the favicon

background-script.js and content-script.js are quite simple, but the logic in frame-script.js is not. What makes it complex is that there are a lot of scenarios that could happen while the playback is "active":

* The media element that was playing audio might be removed.
* The whole frame that had media could be removed
* Media playback could be stopped and then resumed
* New media element might be created before or after the old element was destroyed - and this might happen while the old was stopped or playing
* the tab may become audible multiple times
* several others

