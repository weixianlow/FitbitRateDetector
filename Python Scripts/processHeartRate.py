#import necessary libraries
import firebase_admin
import requests
import json
from time import gmtime, strftime
from base64 import b64encode
from mailin import Mailin

from twilio.rest import Client

from firebase_admin import credentials
from firebase_admin import db


#function to determine what sms body to send to user
def sendSMS(hrsZero):
    "Send SMS to User Account using Twilio API"
    
    #create sms client object for twilio
    client = Client(account_sid, auth_token)

    #if user has not provided phone number, skip.
    if phoneNumber == "empty":
        return
    
    if hrsZero == 24:
        message = client.messages.create(
            to="+1"+phoneNumber, 
            from_="<INSERT OUTGOING PHONE NUMBER>",
            body="Hello from Fitbit HeartRate Detector, we have not detected 24 hours of heart rate data, your important files will be sent to your email list now. ")
    else:
        message = client.messages.create(
            to="+1"+phoneNumber, 
            from_="<INSERT OUTGOING PHONE NUMBER>",
            body="Hello from Fitbit HeartRate Detector, we have not received your heartrate for "+ str(hrsZero) + " hours now. Please make sure your fitbit is syncing, or else please pause your account at the dashboard.")
    
    print(message)
    
    
#function to determine what email body to send to user
def sendEmail(hrsZero, email):
    "Send Email to User Account using sendinblue API"
    
    
    
    if hrsZero == 24:
        m = Mailin("https://api.sendinblue.com/v2.0","<SENDINBLUE API KEY>")
        data = { "to" : {email:"to whom!"},
            "from" : ["<OUTGOING EMAIL ADDRESS>", "Fitbit HeartRate Detector"],
            "subject" : "[ALERT] Heartrate Not Detected Recently",
            "html" : "Hello from Fitbit HeartRate Detector, we have not detected 24 hours of heart rate data, your important files will be sent to your email list now. ",

        }
    else:
        m = Mailin("https://api.sendinblue.com/v2.0","<SENDINBLUE API KEY>")
        data = { "to" : {email:"to whom!"},
            "from" : ["<OUTGOING EMAIL ADDRESS>", "Fitbit HeartRate Detector"],
            "subject" : "[ALERT] Heartrate Not Detected Recently",
            "html" : "Hello from Fitbit HeartRate Detector, we have not received your heartrate for "+ str(hrsZero) + " hours now. Please make sure your fitbit is syncing, or else please pause your account at the dashboard.",

        }
        
    result = m.send_email(data)
    print(result)

#function to send email to user's next of kin, including the file download URL
def sendEmailToList(email, downloadURL, name):
    "Send Email to Next of Kin"
    
    m = Mailin("https://api.sendinblue.com/v2.0","<SENDINBLUE API KEY>")
    data = { "to" : {email:"to whom!"},
        "from" : ["<OUTGOING EMAIL ADDRESS>", "Fitbit HeartRate Detector"],
        "subject" : "[IMPORTANT] Heartrate Not Detected Recently",
        "html" : "Hello from Fitbit HeartRate Detector, we have not detected a heartrate from " + name + " for more than 24 hours. <br>Since he has created an account and activated an automatic service to forward important document to his/her next of kin in the event of his/her probable death, this email is to notify you of said event. <br><br><strong>Please Confirm If The User Is Still Alive</strong><br><br>The following is the document provided by " + name + " to us. Click here to <a href='"+ downloadURL + "'>download</a><br><br>Sincerely,<br> Fitbit HeartRate Detector",

    }
    
    result = m.send_email(data)
    print(result)
    
    
#certificate needed for firebase admin
cred = credentials.Certificate("<FIREBASE ADMIN SDK CONFIG JSON FILE>")

firebase_admin.initialize_app(cred, {
    'databaseURL': '<FIREBASE DATABASE URL>'
})


# Your Account SID from twilio.com/console
account_sid = "<TWILIO ACCOUNT SID HERE>"
# Your Auth Token from twilio.com/console
auth_token  = "<TWILIO ACCOUNT AUTH TOKEN HERE>"

refHeartRate = db.reference("/heartRate")

refUser = db.reference("/users")
snapshot = refUser.get()

#for loop to loop through user list
for userUid in snapshot:
    
    refUserStatus = db.reference("users/" + userUid)
    snapshotStatus = refUserStatus.get()
    phoneNumber = snapshotStatus.get("phoneNumber")
    
    #if user has paused account, skip to next user
    if snapshotStatus.get("pauseStatus") == "true":
        print(userUid + " has paused account.")
        continue
        
    #grab last 24 hours heartrate data snapshot
    snapshotHeartRate = refHeartRate.child(userUid).order_by_key().limit_to_last(24).get()
    print snapshotHeartRate
    
    #if no data obtained from snapshot, ignore and move on
    if snapshotHeartRate == None:
        print(userUid + " has no heart rate data.")
        continue
    
    
    heartRateCounter = 0
    #count how many consecutive zero value heart rate from most recent
    for heartRate in reversed(snapshotHeartRate):
        if snapshotHeartRate[heartRate] != 0:
            print("Non Zero Heart Rate Data Found at " + heartRate)
            print("Heart Rate is: "+ str(snapshotHeartRate[heartRate]))
            break
        print("Heart Rate is: "+ str(snapshotHeartRate[heartRate]))
        heartRateCounter = heartRateCounter + 1
        
    
    print("heart rate for " + userUid+ "is : " + str(heartRateCounter)) 
    
    #if first heart rate data is non zero, update needed flags
    #if user has zero value heart rate data, depending on counter, flag necessary flags and send sms and email notification
    if heartRateCounter == 0:
        refUser.child(userUid).update({
            'sent23hrwarning':'false',
            'sent12hrwarning':'false',
            'sent16hrwarning':'false',
            'sent20hrwarning':'false',
            'flagHeartRateZero': 'false'
        })
        
    elif heartRateCounter == 1:
        refUser.child(userUid).update({
            'flagHeartRateZero':'true'
        })
        
    elif heartRateCounter == 12:
        refUser.child(userUid).update({
            'sent12hrwarning': "true",
        })
        
        sendSMS(12)
        sendEmail(12, snapshotStatus.get("email"))
        
    
    elif heartRateCounter == 16:
        refUser.child(userUid).update({
            'sent16hrwarning': "true"
        })
        sendSMS(16)
        sendEmail(16, snapshotStatus.get("email"))
        

    elif heartRateCounter == 20:
        refUser.child(userUid).update({
            'sent20hrwarning': "true"
        })
        sendSMS(20)
        sendEmail(20, snapshotStatus.get("email"))
        
    
    elif heartRateCounter == 23:
        refUser.child(userUid).update({
            'sent23hrwarning': "true"
        })
        
        sendSMS(23)
        sendEmail(23, snapshotStatus.get("email"))
        
    #if user has 24 hours of zero value heart rate, obtain user's next of kin email and send email to them attached with download URL
    elif heartRateCounter == 24:
        refUser.child(userUid).update({
            'fileSendStats': "true",
            'pauseStatus':"true"
        })
        
        
            
            
        sendSMS(24)
        sendEmail(24, snapshotStatus.get("email"))
        
        userFiles = refUserStatus.child("files").get()
        emailList = refUserStatus.child("emailList").get()
        URL = userFiles.get("downloadURL")
        
        print emailList
        print URL
        
        #if no URL, user has not uploaded file, skip to next user
        if URL == None:
            continue
        else:
            email1 = emailList["emailUser1"]
            email2 = emailList["emailUser2"]
            email3 = emailList["emailUser3"]
            downloadURL = URL
            name = snapshotStatus.get("displayName")

            if email1 != "empty":
                sendEmailToList(email1, downloadURL, name)
            if email2 != "empty":
                sendEmailToList(email2, downloadURL, name)
            if email3 != "empty":
                sendEmailToList(email3, downloadURL, name)
        
        
        

        
        
        
        
        