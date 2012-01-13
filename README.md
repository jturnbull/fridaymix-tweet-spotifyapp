# Spotify Tweet

A Spotify Apps API Plugin to tweet the current-playing track.

## Installation

First, checkout this code to ~/Spotify/fridaymix.

Copy the file oauth_config.example.js to oauth_config.js and fill in the Twitter API variables. You'll have to register your own Twitter app to get the token and secret, and then use some other method to "do the oauth dance" and get consumer tokens for your app.

You'll need to [register as a spotify developer][reg], and use the [preview build][prev] of Spotify. 

Then load the app by "searching" for "spotify:app:fridaymix".

[reg]: http://developer.spotify.com/en/spotify-apps-api/developer-signup/
[prev]: http://developer.spotify.com/en/spotify-apps-api/preview/