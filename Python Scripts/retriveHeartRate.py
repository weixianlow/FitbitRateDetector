#import needed libraries
import firebase_admin
import requests
import json
from time import gmtime, strftime
from base64 import b64encode

from firebase_admin import credentials
from firebase_admin import db

#function to get data from fitbit api using user's fitbit access code
def getResponseFitbit():
    "initial response"
    auth = 'Bearer '+UseraccessToken

    headers = {
        'Authorization': auth ,
    }
    r = requests.get('https://api.fitbit.com/1/user/-/activities/heart/date/today/1d/1min/time/'+strftime("%H:00")+'/'+strftime("%H:00")+'.json', headers=headers)

    #if user's access code is expired, reprocess authentication 
    if r.status_code == 200:
        #user access code is valid, get heart rate from provided json data
        getHeartRate(r, refHeartRate)
    elif r.status_code == 401:
        #user access code is expired, reobtain new access code with refresh code
        updateToken(clientID, clientSecret, UserrefreshToken, refUserFitbit)       
        
    return
    
#function to parse through obtained json data
def getHeartRate(r, refHeartRate):
    "get heartrate from fitbit if success"
    parsed_json = json.loads(r.text)
    print r.text
    data = parsed_json['activities-heart-intraday']['dataset']
    keyName = strftime("%Y-%m-%d %H:00") 
    if not data:
        #if field in json doesn't exist, no heart rate data is available from fitbit, assume user has no heart rate data and record as zero value
        refHeartRate.child(userUid).update({
            keyName:0
        })
    else:
        #else, read value from json and upload to database
        heartRate =  (data[0]['value'])
        refHeartRate.child(userUid).update({
            keyName:heartRate
        })
    
    return

#function to refresh user's access code for fitbit API
def updateToken(clientID, clientSecret, UserrefreshToken, refUserFitbit):
    "refresh token if expired"
    #base64 conversion required for header authentication by OAuth 2.0
    authBase = b64encode(clientID + ":" + clientSecret)
        
    refreshAuth = "Basic "+authBase
    headers = {
        #include needed header for post
        'Authorization': refreshAuth,
        'Content-Type': 'application/x-www-form-urlencoded',
    }

    data = [
        ('grant_type', 'refresh_token'),
        ('refresh_token', UserrefreshToken),
    ]
    #post 
    r = requests.post('https://api.fitbit.com/oauth2/token', headers=headers, data=data)

    parsed_json = json.loads(r.text)
    print r.text
    
    #grab user's new access code and new refresh code
    newAccessToken = parsed_json['access_token']
    newRefreshToken = parsed_json['refresh_token']
    time = strftime("%Y-%m-%d %H:%M")
    
    #update user's code in database
    refUserFitbit.update({
        'accessToken':newAccessToken,
        'refreshToken':newRefreshToken,
        'lastUpdated':time
    })
    
    UseraccessToken = newAccessToken
    UserrefreshToken = newRefreshToken
    
    auth = 'Bearer '+UseraccessToken

    headers = {
        'Authorization': auth ,
    }


    r = requests.get('https://api.fitbit.com/1/user/-/activities/heart/date/today/1d/1min/time/'+strftime("%H:00")+'/'+strftime("%H:00")+'.json', headers=headers)
    
    #reattempt to get heart rate with new access code
    if r.status_code == 200:
        getHeartRate(r, refHeartRate)
    elif r.status_code == 401:
        updateToken(clientID, clientSecret, UserrefreshToken, refUserFitbit)
    
    return
    

#certificate needed for firebase admin
cred = credentials.Certificate("<FIREBASE ADMIN SDK CONFIG JSON FILE>")

#firebase database URL 
firebase_admin.initialize_app(cred, {
    'databaseURL': '<FIREBASE DATABASE URL>'
})

#database reference
refHeartRate = db.reference("/heartRate")

refUser = db.reference("/users")

#get data snapshot from database
snapshot = refUser.get()

#for loop to loop through every user
for userUid in snapshot:
    
    refUserStatus = db.reference("users/" + userUid)
    snapshotStatus = refUserStatus.get()
    
    #check if user has paused account, if yes, continue to next user
    if snapshotStatus.get("pauseStatus") == "true":
        print(userUid + " has paused account.")
        continue

    refUserFitbit = db.reference("/users/"+userUid+"/Fitbit")
    snapshotFitbit = refUserFitbit.get()
    
    #check if user has a valid fitbit authentication code
    if snapshotFitbit == None:
        print(userUid + " has not authenticated Fitbit.")
        continue
        
    #if yes, obtain from database    
    UseraccessToken = snapshotFitbit.get("accessToken")
    UserrefreshToken = snapshotFitbit.get("refreshToken")

    refFitbit = db.reference("/Fitbit")
    snapshotFitbitAuth = refFitbit.get()
    clientID = snapshotFitbitAuth.get("ClientID")
    clientSecret = snapshotFitbitAuth.get("ClientSecret")
    
    #start heart rate obtain process
    getResponseFitbit()
    
    
        
        
        