




//initialize firebase
firebase.initializeApp(config);
//check if user is logon
firebase.auth().onAuthStateChanged(function(user) {
if (user) {
    
    
    const userUid = user.uid;
    console.log(userUid);
    
    const databaseUser=firebase.database().ref().child("users").child(userUid);
        
    //check if phone number exist in database, if yes, show user in input field
    databaseUser.once("value", function(snapshot){
        if(snapshot.val().phoneNumber != "empty")
            {
                document.getElementById("phoneNumberRaw").value = snapshot.val().phoneNumber;
            }
    })
    
    //if user clicked button, grab phone number and update database
    document.getElementById("mysubmitBtn").addEventListener("click", function(){
      
        var phoneNumberValue = document.getElementById("phoneNumberRaw").value;
        console.log(phoneNumberValue);
        
       databaseUser.update({
           phoneNumber:phoneNumberValue
       });
        databaseUser.on("value", function(snap){
        alert("Phone number has been updated"); 
            window.location.replace("http://cs4085.weixianlow.me/fitbitAuth1.html");
            
    })
       
    });
    
    
    
    
    
} else {
    //redirect to login page if user is no logon
  window.location.replace("http://cs4085.weixianlow.me/login.html");
}
});








