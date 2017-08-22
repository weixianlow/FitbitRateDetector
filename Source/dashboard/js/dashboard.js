//intialize firebase
firebase.initializeApp(config);

//check if user is logon
firebase.auth().onAuthStateChanged(function(user) {
if (user) {
    
    
    const userUid = user.uid;
    
    //create database reference
    const databaseUser=firebase.database().ref().child("users/"+userUid);
    
    //grab html elements    
    var runningLabel = document.getElementById("runningLabel");
    var pausedLabel = document.getElementById("pausedLabel");
    var runBtn = document.getElementById("unpauseBtn");
    var pauseBtn = document.getElementById("pauseBtn");
    
    var nameField = document.getElementById("name");
    var phoneNumberField = document.getElementById("phoneNumber");
    var emailLabel = document.getElementById("email");
    var fitbitYes = document.getElementById("fitbitYes");
    var firbitNo = document.getElementById("fitbitNo");
    var updateBtn = document.getElementById("updateBtn");
    
    var email1 = document.getElementById("email1");
    var email2 = document.getElementById("email2");
    var email3 = document.getElementById("email3");
    
    var fileLabel = document.getElementById("fileLabel");
    var dateFileLabel = document.getElementById("dateFileLabel");
    
    //update account status on dashboard page and user's info
    databaseUser.once("value", function(snapshot){
       if (snapshot.val().pauseStatus == "false"){
           //user account is running
           pausedLabel.style.display = "none";
           runBtn.style.display = "none";
           runBtn.style.disabled;
       }else{
           //user account is not running
           runningLabel.style.display = "none";
           pauseBtn.style.display = "none";
           pauseBtn.style.disabled;
       }
        
        nameField.value = snapshot.val().displayName;
        phoneNumberField.value = snapshot.val().phoneNumber;
        emailLabel.innerHTML = snapshot.val().email;

    
    });
    
    //update fitbit database authentication status
    databaseUser.child("Fitbit").once("value", function(snapshot){
       if (snapshot.child("accessToken").exists()){
           if(snapshot.child("refreshToken").exists()){
               if(snapshot.child("userID").exists()){
                   fitbitNo.style.display = "none";
               }else{
                   fitbitYes.style.display = "none";
               }
           }else{
                   fitbitYes.style.display = "none";
               }
       } else{
                   fitbitYes.style.display = "none";
               }
    });
    
    //update dashboard view of email list provided by user
    databaseUser.child("emailList").once("value", function(snapshot){
        if (snapshot.val().emailUser1 == "empty" && snapshot.val().emailUser2 == "empty" && snapshot.val().emailUser3 == "empty"){
            email2.style.display = "none";
            email3.style.display = "none";
        }else{
            if(snapshot.val().emailUser1 == "empty" ){
                email1.style.display = "none";
            }else{
                email1.innerHTML = snapshot.val().emailUser1; 
            }
            
            if(snapshot.val().emailUser2 == "empty" ){
                email2.style.display = "none";
            }else{
                email2.innerHTML = snapshot.val().emailUser2; 
            }
            
            if(snapshot.val().emailUser3 == "empty" ){
                email3.style.display = "none";
            }else{
                email3.innerHTML = snapshot.val().emailUser3; 
            }
        }
    });
    
    //update dashboard view of file uploaded by user
    databaseUser.child("files").once("value", function(snapshot){
        if (snapshot.val().dateUploaded != "empty" && snapshot.val().fileName != "empty" && snapshot.val().filePath != "empty"){
            fileLabel.innerHTML = '<a href="'+snapshot.val().downloadURL+'" target="_blank">'+snapshot.val().fileName+"</a>";
            dateFileLabel.innerHTML = snapshot.val().dateUploaded;
        }
    })
   
    
    
    // if user press pause button, pause account
    runBtn.addEventListener("click", function(){
        databaseUser.update({
            pauseStatus:"false"
        });
        //remove previous heartrate data for trash collection, prevent old redundant data
        firebase.database().ref("heartRate/"+ userUid).remove();
        
        databaseUser.on("value", function(){
            alert("Your account is now running!");
            window.location.replace("http://cs4085.weixianlow.me/dashboard");
        });
    })
    
    //if user press start button, restart account
    pauseBtn.addEventListener("click", function(){
        databaseUser.update({
            pauseStatus:"true"
        });
        
        databaseUser.on("value", function(){
            alert("Your account is now paused.");
            window.location.replace("http://cs4085.weixianlow.me/dashboard");
        })
    })
    //if user press update button, update user's personal info
    updateBtn.addEventListener("click",function(){
        var nameUpdated = document.getElementById("name").value;
        var phoneNumberUpdated = document.getElementById("phoneNumber").value;
        
        databaseUser.update({
            displayName: nameUpdated,
            phoneNumber: phoneNumberUpdated
        })
        
    })
    
    
    
} else {
    //redirect to login page if user hasn't logon
  window.location.replace("http://cs4085.weixianlow.me/login.html");
}
});


function validateEmail(email) 
{
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}





