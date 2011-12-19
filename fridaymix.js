sp = getSpotifyApi(1);

exports.init = init;

var statusdisplay = $("#status");

var tweetTemplate = "";

function init() {
	
	setupTweetTemplate();
	
	// listen for the tab chnage event and hide/show the divs
    sp.core.addEventListener("argumentsChanged", function (event) {
		setTab();		
    });
	
	// also do it right away in case we refresh on the settigns tab
	setTab();
	
	// listen for the player changing state
    sp.trackPlayer.addEventListener("playerStateChanged", function(event) {

        // Only update the page if the track changed
        if (event.data.curtrack == true) {
            updatePageWithTrackDetails();
        }
    });
	
	// also update it right away in case it's already playing
    updatePageWithTrackDetails();
}

function setTab() {
	var args = sp.core.getArguments();
	var key = args[0]+"Tab";
	
	if (key == "settingsTab") {
			$("#mainTab").hide();
			$("#"+key).show();
		} else {
			$("#settingsTab").hide();
			$("#"+key).show();
		}

}

function setupTweetTemplate() {
	if ("tweetTemplate" in localStorage) {
		console.log("Loading from storage");
		tweetTemplate = localStorage['tweetTemplate'];
	}
	else {
		tweetTemplate = "Now Playing $TRACK$ by $ARTIST$ from $ALBUM$";
		setStorageVar("tweetTemplate", tweetTemplate);
	}
	$("#tweetTemplate").val(tweetTemplate);
}

function setStorageVar(key, value) {
	try {
		 localStorage.setItem(key, value);
	} catch (e) {
		 if (e == QUOTA_EXCEEDED_ERR) {
		 	 statusdisplay.innerHTML('<p><strong>Unable to save settings:</strong> Quota exceeded.</p>');
		}
	}
}

function updatePageWithTrackDetails() {

    var nowPlaying = document.getElementById("nowPlaying");

    // This will be null if nothing is playing.
    var playerTrackInfo = sp.trackPlayer.getNowPlayingTrack();

    if (playerTrackInfo == null) {
        nowPlaying.innerText = "Nothing playing!";
    } else {
        var track = playerTrackInfo.track;
		console.log("tweet isAd " + track.isAd + "bool" + Boolean(track.isAd));
		if (!track.isAd) {
			var text = tweetTemplate.replace("$ARTIST$", track.album.artist.name).replace("$TRACK$", track.name).replace("$ALBUM$", track.album.name);
			nowPlaying.innerText = text;
	        updateTwitter(text);
		}
    }
}


function updateTwitter(status) {
    
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
