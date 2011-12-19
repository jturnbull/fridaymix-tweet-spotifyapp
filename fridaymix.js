sp = getSpotifyApi(1);

exports.init = init;

var statusdisplay = document.getElementById("status");

function init() {

    updatePageWithTrackDetails();
	
	//setupTwitterCreds();

    sp.core.addEventListener("argumentsChanged", function (event) {	
		args = sp.core.getArguments(); 
		setTab(args[0]+"Tab");		
    });

    sp.trackPlayer.addEventListener("playerStateChanged", function(event) {

        // Only update the page if the track changed
        if (event.data.curtrack == true) {
            updatePageWithTrackDetails();
        }
    });
}

function setTab(key) {
	console.log("key "+ key);
	if (key == "settingsTab") {
			document.getElementById("mainTab").hide();
			document.getElementById(key).show();
		} else {
			document.getElementById("settingsTab").hide();
			document.getElementById(key).show();
		}

}

// function setupTwitterCreds() {
// 	if ("consumerKey" in localStorage and "consumerSecret" in localStorage) {
// 		// fixme
// 	
// 	}
// 	else {
// 		
// 	}
// }

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
		if (!track.isAd) {
	        var text = "#fridaymixtest is playing " + track.name + " by " + track.album.artist.name;
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
