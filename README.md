# Firebase Angular Trigger Binding Service


Author: Scott Prue <br>
Email: scott@reels.io <br>


This is a public version of a service I wrote for use within the [Reels Application](reels.io) developed by [Qwackr](qwackr.com).

##Description
This service is built to store information that is bound or gathered from firebase to store/cache the information on the device. Using the forge prefs module the information is stored on the device so that when you restart the app the object can be re-populated then bound

##Note
I am releasing this just after seeing interest and it does not work completely as intended. I will try to keep the code that I update in our project in parallel with this code, but it gets difficult since we are alpha testing our application currently.


##Functions
*Incomplete*<br>
`BindList($scope, objectToBind)` binds a fb object to a scope variable then watches for changes to update vars and prefs. Also sets a object of null booleans to true and false when bound object is empty.<br>
`BackgroundProcess` wraps a array modification function in seperate timeouts for each item in the array timeouts
##Dependencies
1. [Firebase](firebase.com)
1. [AngularJS](angularjs.org)
1. [Trigger](trigger.io) including [prefs module](git remote add origin git@github.com:Qwackr/fatBindingService.git)
