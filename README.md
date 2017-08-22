# FitbitRateDetector

Independent Study for CS4085 at University of Missouri


## Milestones
* Initial Commit - 7.17.2017
* Project Completion - 8.20.2017


## Brief

In this project, an automated service will be built based on an API provided by Fitbit. This automated service will monitor a user’s heart rate to detect any lack of heart rate by fetching new data from the API on a set time. When the service has detected a lack of heart rate from the user, the service will then flag the user account and then continuously fetch new data from the API to detect any changes from the heart rate data obtained from Fitbit. Depending on the user’s preference, the service will then monitor the heart rate data until the selected time by the user, and automatically send out a predesignated zip folder containing all the user’s important information such as the last will of the user, important account username and password, and emergency contact information to a designated list of people’s email inboxes. If a non-zero heart rate data is received from Fitbit’s API, the service will then un-flag the user’s account and continue as always.



## To-Do
* Better phone error checking
* Database data validation
* Better UI interface to show user data is retrieved from Fitbit
