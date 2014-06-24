angular.module('myApp.service.fatBinding', ['firebase', 'myApp.service.firebase'])

  .factory('storageService', ['$rootScope', 'firebaseRef', '$q', '$timeout', 'syncData',
    function ($rootScope, firebaseRef, $q, $timeout, syncData) {
      var prefs = {};
      var localPictures = [];
      return {
        prefsList: function () {
          //get all user preferences from forge prefs and set appropriate variables
          forge.prefs.keys(function (keysArray) {
            console.log('Current prefs: ');
            console.log(keysArray);
          })
          //watch prefs and localpictures vars then update forge prefs in the background
        },
        getSavedPics: function () {
          var deferred = $q.defer();
          forge.prefs.get('pics', function (picsArray) {
            if (picsArray != null) {
              deferred.resolve(picsArray)
            }
            else {
              deferred.resolve();
            }
          }, function (err) {
            console.log('error getting pics preference');
            console.log(err);
          })
          return deferred.promise;
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
        },
        saveList: function (listName, list) {
          prefs[listName] = list;
          $timeout(function () {
            forge.prefs.set(listName, list, function () {
              console.log(listName + ' preference was set')
            })
          })
        },
        getList: function (listName) {
          //TODO: put in error check
          if (prefs.hasOwnProperty(listName)) {
            console.log('bound list is not empty');
            return prefs[listName];
          }
          else {
            console.log(linstName + ' was never saved')
            return null
          }
        },
        checkListExistance: function(listName){
        //TODO: put in error check
          if (prefs.hasOwnProperty(listName)) {
              if(prefs[listName].keys(obj).length > 0){
                  console.log('bound list is not empty');
                  return true;
              }
              else{
                  console.log('bound list is empty');
                  return null;
              }
          }
          else {
              console.log(listName + ' was never saved')
              return null
          }
        },
        getListObj: function (listName) {
          //TODO: put in error check
          if (prefs.hasOwnProperty(listName)) {
            return prefs[listName];
          }
          else {
            console.log(listName + ' was never saved')
            return null
          }
        },
        bindList: function (bindScope, listName) {
          console.log('running bindList with ' + listName);
          var listBase = syncData(['users', $rootScope.auth.user.uid]).$child(listName);
          listBase.$bind(bindScope, listName).then(function () {
            console.log(listName + ' was bound');
            //setup watcher for null and storage
            bindScope.$watch(listName, function (newVal, oldVal) {
              //check for bound object being empty
              if (listBase.$getIndex().length > 0) {
                //Hide indicator
                bindScope.isNullList[listName] = false;
                //save firebase obj to preference variable
                console.log('old');
                console.log(oldVal);
                console.log('setting ' + listName + ' pref to ');
                console.log(newVal);
                prefs[listName] = newVal;
                //service contains the bound object
                //save list to service to service (this only needs to be friends)
              }
              else {
                //activate ui-element for null list ($scope.isNullList[listName])
                bindScope.isNullList[listName] = true;
                                prefs[listName] = {};
              }
            })
          })
        }
      }
    }])
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


