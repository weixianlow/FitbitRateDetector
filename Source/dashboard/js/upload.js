




//initialize firebase
firebase.initializeApp(config);

//check if user is logon
firebase.auth().onAuthStateChanged(function(user) {
if (user) {
    
    
    const userUid = user.uid;
    
    //grab html elements
    var uploader = document.getElementById('uploader');
    var fileButton = document.getElementById('fileButton');
    
    //if user selected file, automatically upload file
    fileButton.addEventListener('change', function(e){
        //grab file
        var file = e.target.files[0];
        var filePathWay = 'uploads/' + userUid + "/" + file.name;
        
        const databaseUser = firebase.database().ref("users/"+ userUid+ "/files");
        
        //check for previous file, if exist, delete, if not, move on
        databaseUser.once("value", function(snapshot){
            if (snapshot.val().filePath != "empty"){
                firebase.storage().ref(snapshot.val().filePath).delete().then(function(){
                    alert("Previous file <" + snapshot.val().fileName + "> has been deleted.")
                }).catch(function(error){
                    console.log(error);
                    alert("Previous file was not able to be removed, please try again later.");
                })
            }
        })
        
        //grab current date to get timestamp
        var date = new Date();
        
        var currentDate = date.getFullYear().toString()+"-"+(date.getMonth()+1).toString()+"-"+date.getDate().toString();
        
        //create storage reference with firebase storage
        var storageRef = firebase.storage().ref(filePathWay);
        
        //upload file
        var task=storageRef.put(file);
        
        //update progress bar
        task.on('state_changed', 
                
                function progress(snapshot){
                    var percentage = (snapshot.bytesTransferred / snapshot.totalBytes)*100;
                    uploader.value=percentage;
                },
                
                function error(err){
                    consonle.log(err);
                    alert("Something went wrong, please try again later.");
                },
                function complete(){
            
            
                    //get download URL from firebase storage and update field in user's database
                    storageRef.getDownloadURL().then(function(url){
                        databaseUser.update({
                        filePath:filePathWay,
                        dateUploaded: currentDate,
                        fileName:file.name,
                        downloadURL: url
                    
                    });
                    
                    databaseUser.on("value", function(snap){
                        alert("Your file <"+file.name+"> has been uploaded!");
                    });
                    });
            
                    
                    
                }
        );
    });
    
    
    
} else {
    
    //redirect to login page if not logon
  window.location.replace("http://cs4085.weixianlow.me/login.html");
}
});








