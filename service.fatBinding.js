angular.module('myApp.service.fatBinding', ['firebase', 'myApp.service.firebase'])

  .factory('storageService', ['$rootScope', 'firebaseRef', '$q', '$timeout', 'syncData',
    function ($rootScope, firebaseRef, $q, $timeout, syncData) {
      var storageObject = {};
      var prefsArray = [];
      function loadStorageObject (name){
        if(_.contains(storageObject, name)){
          return storageObject[name]
        }
        else{
          return null
        }
      }
      function getPrefKeys(){
        var deferred = $q.defer();
        if(prefsArray.length < 1){
          forge.prefs.keys(function (keysArray) {
            //resolve for null?
            console.log('Current prefs: ');
            console.log(keysArray);
            prefsArray = keysArray;
            deferred.resolve(keysArray);
          }, function(err){
            forge.logging.error(err);
            deferred.reject(err)
          });
        }
        else{
          //getPrefs has already been run, so we know what prefs there were (watch out for new ones?)
          deferred.resolve(prefsArray);
        }
        return deferred.promise
      }
      return {
        getPrefs: function(){
          if(forgeService.status){
            return getPrefKeys()
          }
          else{
            console.log('no preferences enabled for this device');
          }
        },
        loadPref: function (prefName) {
          //get all user preferences from forge prefs and set appropriate variables
          //should be called at the begining of app then run the specific loads of scope vars
          if(forgeService.status){
            getPrefKeys().then(function(prefs){
              var deferred = $q.defer();
              //check for pref in prefNames
              if(_.contains(prefs, prefName)){
                console.log(prefName + ' pref exists, loading it.')
                forge.prefs.get(prefName, function(pref){
                    console.log('loaded ' + prefName);
                    console.log(pref);
                    deferred.resolve(pref);
                }, function(err){
                  console.error('error getting ' + prefName + ' pref:');
                  console.error(err);
                  deferred.reject(err);
                })
              }
              else{
                //pref does not exist in list of pref keys
                console.log(prefName + ' does not exist')
                deferred.resolve(null);
              }
            });
          
          }
          else{
            console.log('preferences can not be loaded on this platform');
            deferred.resolve()
          }
          return deferred.promise
        },
        savePref: function (prefName, prefValue) {
          //save in the background if forge exists
          if(forgeService.status){
            $timeout(function () {
              storageObject[prefName] = prefValue;
              forge.prefs.set(prefName, prefValue, function () {
                console.log(prefName + ' preference was set')
              })
            })
          }
          else{
            console.log('Preferences not able to be saved on this platform')
          }
        },
        //adding to existing pref
        addToPref: function (objectToAdd, prefName) {
          console.log('save picture run');
          //check for forge existance
          if(forgeService.status){
            //set preference and update saveObj in background
            $timeout(function(){
              //check for parameter existance
              if(!loadStorageObject(prefName)){
                //add object to top of array of objects (could use push to put on bottom)
                loadStorageObject(prefName).unshift(objectToAdd);
                console.log('storageObject.'+ prefName ' updated with ' + JSON.Stringify(objectToAdd));
                console.log(storageObject[prefName]);
                //set preference to storage object with new value
                forge.prefs.set('pics', storageObject[prefName], function(){
                  console.log('picture preference updated with new picture')
                }, function(err){
                  console.error('error setting ' + prefName +'  preference');
                  console.log(err);
                  forge.logging.log(err);
                })
              }
              else {
                //preference must be loaded
                //either there is no pref or there is
                var deferred = $q.defer()
                forge.prefs.get('pics', function(pref){
                  deferred.resolve(pref);
                }, function(err){
                  console.error('Error getting pics preference:')
                  deferred.reject(err);
                })
                deferred.promise.then(function(pref){
                  //add new object to pref
                  if(!pre){
                    pref.unshift(objectToAdd);
                  }
                  else{
                    //add first picture
                    pref = [objectToAdd]
                  }
                  forge.prefs.set('pics', pref, function () {
                    console.log(JSON.Stringify(objectToAdd) + ' was added to the ' + prefName + ' preference:');
                    console.log(pref);
                  }, function(err){
                    console.error('error saving ' + prefName + ' preference');
                  })
                })
              }
            }, 0)//end of timeout
          }
          else{
            console.log('preferences can not be saved on this platform');
          }
        },
        bindList: function (bindScope, listName) {
          console.log('running bindList with ' + listName);
          var listBase = syncData(['users', $rootScope.auth.user.uid]).$child(listName);
          listBase.$bind(bindScope, listName).then(function () {
            console.log(listName + ' was bound');
            //background watching function for storageObj and pref update
            $timeout(function(){
              //setup watcher for null and storage
              bindScope.$watch(listName, function (newVal, oldVal) {
                if (listBase.$getIndex().length > 0) {
                  bindScope.isNullList[listName] = false;
                  console.log('old');
                  console.log(oldVal);
                  console.log('setting ' + listName + ' pref to ');
                  console.log(newVal);
                  //save to service storage
                  storageObject[listName];
                  //check for forge existance
                  if(forgeService.status){
                    //save to preference
                    forge.prefs.set(listName, function(){
                      console.log(listName + 'preference was set');
                    })
                  }
                }
                else {
                  //activate ui-element for null list ($scope.isNullList[listName])
                  bindScope.isNullList[listName] = true;
                  //set empty object in the listName parameter of the storage object
                  storageObject[listName] = {};
                }
              })
            }, 0)
          })
        },
        backgroundModify: function (collection, evalFn) {
          var deferred = $q.defer();
          // Closures to track the resulting collection as it's built and the iteration index
          var resultCollection = [];
          var index = 0;
          function enQueueNext() {
            $timeout(function () {
              // Process the element at "index"
              resultCollection.push(evalFn(collection[index]));
              index++;
              if (index < collection.length)
                enQueueNext();
              else {
                // resolve the promise
                deferred.resolve(resultCollection);
              }
            }, 0);
          }
          // Run Que Process
          enQueueNext();
          return deferred.promise;
        }
      }
    }])
//Start of using getPrefKeys as its own service to be used throughout app
// .factory('getPrefKeys', ['$q', function($q){
//   var prefsArray = [];
//   return function(){
//     var deferred = $q.defer();
//     if(prefsArray.length < 1){
//       forge.prefs.keys(function (keysArray) {
//       //resolve for null?
//       console.log('Current prefs: ');
//       console.log(keysArray);
//       prefsArray = keysArray;
//       deferred.resolve(keysArray);
//     }, function(err){
//       forge.logging.error(err);
//       deferred.reject(err)
//     });
//     }
//     else{
//       //getPrefs has already been run, so we know what prefs there are
//       deferred.resolve(prefsArray);
//     }
//     return deferred.promise
//   }
// }])
//Unused backgrounding maping service
//   .factory('backgroundProcess', ['$q', '$timeout' , function($q, $timeout){
//     var self = this;
//     // Works like Underscore's map() except it uses setTimeout between each loop iteration
//     // to try to keep the UI as responsive as possible
//     self.responsiveMap = function(collection, evalFn)
//     {
//         console.log('service called with collection: ');
//         console.log(collection);
//         var deferred = $q.defer();
//         // Closures to track the resulting collection as it's built and the iteration index
//         var resultCollection = [], index = 0;
//         function enQueueNext() {
//             $timeout(function () {
//                 // Process the element at "index"
//                 resultCollection.push(evalFn(collection[index]));

//                 index++;
//                 if (index < collection.length)
//                     enQueueNext();
//                 else
//                 {
//                     // We're done; resolve the promise
//                     deferred.resolve(resultCollection);
//                 }
//             }, 0);
//         }

//         // Start off the process
//         enQueueNext();

//         return deferred.promise;
// }

// return self;
//   }])
