



//initialize firebase
firebase.initializeApp(config);


//to check if user is logon to firebase
firebase.auth().onAuthStateChanged(function(user) {
if (user) {



      // User is signed in.
    
    // grab user info from google
      var userDisplayName = user.displayName;
      var userEmail = user.email;
      var userUid = user.uid;

    //create reference with firebase database
      const databaseUser = firebase.database().ref("users/"+ userUid );
      


    //import data to realtime database
      databaseUser.once("value")
        .then(function(snapshot){
          var snapshotBoolean = snapshot.exists();
            if(snapshotBoolean){
                //to check if user exists in database, if yes, redirect to dashboard page
                setTimeout(function(){
                    window.location.replace("http://cs4085.weixianlow.me/dashboard");
                }, 3000);
                
                
            } else {
                //if not create user
                //create user in database
                databaseUser.set({
                  displayName: userDisplayName,
                  email: userEmail,
                  flagHeartRateZero:"false",
                  sent12hrwarning:"false",
                  sent16hrwarning:"false",
                  sent20hrwarning:"false",
                  sent23hrwarning:"false",
                  pauseStatus:"false",
                  fileSendStats:"false",
                  phoneNumber:"empty"
                })
                
                databaseUser.child("emailList").set({
                    emailUser1:"empty",
                    emailUser2:"empty",
                    emailUser3:"empty"
                })
                
                databaseUser.child("files").set({
                    fileName: "empty",
                    filePath: "empty",
                    dateUploaded: "empty"
                })

                
                
                
                
                
                //after done, redirect to update user's phone number
                window.location.replace("http://cs4085.weixianlow.me/updatePhoneNumber.html");
            }


        });
    



} else {
    //if user is not logon, redirect to login page
  window.location.replace("http://cs4085.weixianlow.me/login.html");
}
});








