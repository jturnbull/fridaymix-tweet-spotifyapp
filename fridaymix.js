sp = getSpotifyApi(1);

exports.init = init;

function init() {

    updatePageWithTrackDetails();

    sp.trackPlayer.addEventListener("playerStateChanged", function(event) {

        // Only update the page if the track changed
        if (event.data.curtrack == true) {
            updatePageWithTrackDetails();
        }
    });
}

function updatePageWithTrackDetails() {

    var header = document.getElementById("header");

    // This will be null if nothing is playing.
    var playerTrackInfo = sp.trackPlayer.getNowPlayingTrack();

    if (playerTrackInfo == null) {
        header.innerText = "Nothing playing!";
    } else {
        var track = playerTrackInfo.track;
        var text = "#fridaymixtest is playing " + track.name + " by " + track.album.artist.name;
        header.innerText = text;
        updateTwitter(text);
    }
}


function updateTwitter(status) {
    
    var statusdisplay = document.getElementById("status");
    
    if (typeof oauth_config === 'undefined') {
        statusdisplay.innerHTML = "<p><strong>Error</strong> You need to create oauth_config.js and set the variables.</p>";
    }

    var url = "https://api.twitter.com/1/statuses/update.json";
    
    if (status.length > 140) {
        status=status.substr(0,138);
        status = status + "…";
    }
    
    var message = {
        action: url,
        method: "POST",
        parameters: {
            'status': status
        }
    };

    OAuth.completeRequest(message, oauth_config);
    OAuth.SignatureMethod.sign(message, oauth_config);
    url = url + '?' + OAuth.formEncode(message.parameters);

    var req = new XMLHttpRequest();
    req.open("POST", url, true);

    req.onreadystatechange = function() {

        if (req.readyState == 4) {
            if (req.status == 403) {
                statusdisplay.innerHTML = "<p><strong>403 Error</strong> (Denied, possibly a duplicate tweet)</p>";
            }
            
            if (req.status == 200) {
                var response = JSON.parse(req.responseText);
                statusdisplay.innerHTML = "<p><strong>Posted:</strong> "+response.text+"</p>";
            }
        }
    };

    req.send();
}
