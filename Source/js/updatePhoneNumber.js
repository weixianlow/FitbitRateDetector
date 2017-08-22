// Initialize Firebase
  var config = {
    apiKey: "<INSERT FIREBASE CONFIG HERE>",
    authDomain: "<INSERT FIREBASE CONFIG HERE>",
    databaseURL: "<INSERT FIREBASE CONFIG HERE>",
    projectId: "<INSERT FIREBASE CONFIG HERE>",
    storageBucket: "<INSERT FIREBASE CONFIG HERE>",
    messagingSenderId: "<INSERT FIREBASE CONFIG HERE>"
  };






firebase.initializeApp(config);

firebase.auth().onAuthStateChanged(function(user) {
if (user) {
    
    
    const userUid = user.uid;
    console.log(userUid);
    
    const databaseUser=firebase.database().ref().child("users").child(userUid);
        
    databaseUser.once("value", function(snapshot){
        if(snapshot.val().phoneNumber != "empty")
            {
                document.getElementById("phoneNumberRaw").value = snapshot.val().phoneNumber;
            }
    })
    
    document.getElementById("mysubmitBtn").addEventListener("click", function(){
      
        var phoneNumberValue = document.getElementById("phoneNumberRaw").value;
        console.log(phoneNumberValue);
        
       databaseUser.update({
           phoneNumber:phoneNumberValue
       });
        databaseUser.on("value", function(snap){
        console.log(snap.val());
        window.location.replace("http://cs4085.weixianlow.me/fitbitAuth1.html");    
            
    })
       
    });
    
    
    
    
    
} else {
  window.location.replace("http://cs4085.weixianlow.me/login.html");
}
});








