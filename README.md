# Firebase Angular Trigger Binding Service


Author: Scott Prue <br>
Email: scott@reels.io <br>


This is a public version of a service I wrote for use within the [Reels Application](reels.io) developed by [Qwackr](qwackr.com).

##Description
This service is built to store information that is bound or gathered from firebase to store/cache the information on the device as well as in a service. Using the [forge prefs](https://trigger.io/modules/prefs/current/docs/index.html) module, the data is stored on the device for access after rebooting. This can be especially helpful on devices with slow internet connections.

##Note
I am releasing this just after seeing interest and it does not work completely as intended. I will try to keep the code that I update in our project in parallel with this code, but it gets difficult since we are alpha testing our application currently.


##Functions
*Incomplete*<br>

`loadPref(prefName)` promise that checks prefs array for preference and loads it. Use `.then(function(pref))` to run a function after this process is complete. <br>

`savePref(prefName, prefValue)` saves value in storageObject and forge preferences under the prefName <br>

`addToPref(objectToAdd, prefName)` add object to existing preference and restore both storageObject and preference <br>

`BindList($scope, objectToBind)` binds a firebase object to a scope variable then watches for changes to update vars and prefs. Also sets a object of null booleans to true and false when bound object is empty (for easy true/false for ng-show/hide on null list object).<br>

`BackgroundProcess` wraps a array modification function in seperate timeouts for each item in the array timeouts

##Dependencies
1. [Firebase](firebase.com)
1. [AngularJS](angularjs.org)
1. [Trigger](trigger.io) including [prefs module](https://trigger.io/modules/prefs/current/docs/index.html)
1. A forge service that detects the existance of forge
