
//function to read URL parameters
function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('#');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

//initialize firebase
firebase.initializeApp(config);

//check if user is logon
firebase.auth().onAuthStateChanged(function(user){
    if (user){
        
        //obtain code given in URL parameter
        var returnCode = getUrlVars()['code'];

        //create reference in database and obtain data
        firebase.database().ref("Fitbit").once("value", function(snapshot){
            const FitbitClientID = snapshot.val().ClientID;
            const FitbitClientSecret = snapshot.val().ClientSecret;
            
            const secret = btoa(FitbitClientID + ":" + FitbitClientSecret);
            
            
            //perform a POST request to get user's fitbit access token and refresh token
        $.ajax({
            method: "POST",
            url:"https://api.fitbit.com/oauth2/token",
            beforeSend: function(xhr){
                xhr.setRequestHeader("Authorization", "Basic "+secret);
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            },
            data:"clientId=" +FitbitClientID+"&grant_type=authorization_code&redirect_uri=http%3A%2F%2Fcs4085.weixianlow.me%2FfitbitAuth2.html&code="+returnCode,
            success: function(data){
                
                
                //after obtaining it, create firebase database reference and update user's data
                const databaseUser = firebase.database().ref("users/" + user.uid + "/Fitbit");
                
                databaseUser.update({
                    accessToken: data.access_token,
                    refreshToken: data.refresh_token,
                    userID: data.user_id
                })
                //after completion, redirect to dashboard
                databaseUser.on("value", function(snap){
                    window.location.replace("http://cs4085.weixianlow.me/dashboard");
                })
            },
            error: function(data){
                alert("error: "+ data);
                
            }
        })
        });
        
        
        
        

        

    } else{
        //redirect user to login page if user is not logon.
        window.location.replace("http://cs4085.weixianlow.me/login.html");
    }
})
