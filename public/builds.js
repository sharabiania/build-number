angular.module('App', [])
  .controller('buildsController', function() {
    var self = this;
    self.build = 0;
    self.get = function() {
      var xhttp = new XMLHttpRequest();
      xhttp.open('GET', "http://localhost:1337/api/read");
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          self.build = this.responseText;
        }
      }      
      xhttp.send();
    }
    self.get();

});