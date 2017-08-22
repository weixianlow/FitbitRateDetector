



// initialize firebase
firebase.initializeApp(config);

//check if user has logon
firebase.auth().onAuthStateChanged(function(user) {
if (user) {
    
    
    const userUid = user.uid;
    
    
    const databaseUser=firebase.database().ref().child("users/"+userUid+"/emailList");
        
    //check if user has previously provided email address, if yes, show in field
    databaseUser.once("value", function(snapshot){
        if(snapshot.val().emailUser1 != "empty"){
            document.getElementById("email1").value = snapshot.val().emailUser1;
        }
        if(snapshot.val().emailUser2 != "empty"){
            document.getElementById("email2").value = snapshot.val().emailUser2;
        }
        if(snapshot.val().emailUser3 != "empty"){
            document.getElementById("email2").value = snapshot.val().emailUser2;
        }
    });
    
    //if user press button, grab new email address and update database
    document.getElementById("mysubmitBtn").addEventListener("click", function(){
      
        
        
        var emailAddress1 = document.getElementById("email1").value;
        var emailAddress2 = document.getElementById("email2").value;
        var emailAddress3 = document.getElementById("email3").value;
        
        var code = 0;
        
        
        if (emailAddress1 == ""){
            emailAddress1 = "empty";
        }else if (validateEmail(emailAddress1) == false){
            code = 1;
        }
        if (emailAddress2 == ""){
            emailAddress2 = "empty";
        }else if (validateEmail(emailAddress2) == false){
            code = 1;
        }
        if (emailAddress3 == ""){
            emailAddress3 = "empty";
        }else if (validateEmail(emailAddress3) == false){
            code = 1;
        }
        
        //check if email address is valid
        if (code == 1){
            alert("Please ensure that the email address you have entered follows the following format -> email@mydomainname.com");
        }else{
            
            databaseUser.update({
               emailUser1:emailAddress1,
               emailUser2:emailAddress2,
               emailUser3:emailAddress3
            });
            databaseUser.on("value", function(snap){
                alert("Updated! The email address you have provided has been updated in our system.");    
            });
        }
        
       
       
    });
    
    
    
    
    
} else {
    
    //redirect user to login page if user hasn't logon
  window.location.replace("http://cs4085.weixianlow.me/login.html");
}
});

//function to check email format validity.
function validateEmail(email) 
{
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}





