({
  getImages : function(component, recordId, callback) {
    var action = component.get('c.getFiles');
    var prefix = $A.util.isEmpty(component.get('v.prefix')) ? '' : component.get('v.prefix');
    action.setParams({ parentId : recordId, prefix: prefix, contentType: 'image/%' });
    action.setCallback(this, function(response) {
      if (response.getState() === 'SUCCESS') {
        callback(null, response.getReturnValue());
      } else {
        callback(JSON.stringify(response.getError()), null);
      }
    });
    $A.enqueueAction(action);
  },
  changeImage  : function(component, diff){
      var index = component.get('v.index') + diff;
      var images = component.get('v.images');
      if (images === undefined){
        return;
      }
      if(index >= images.length) {
        index = 0;
      }
      if(index < 0){
        index = images.length-1;
      }
      this.setComponentAttributes(component, {
        index: index,
        image: images[index]
      })
  },
  setComponentAttributes : function(component, attributes) {
    if(!component.isValid()){
      return;
    }
    for (var key in attributes) {
      component.set('v.'+key, attributes[key]);
    }
  },
  deleteAttachment : function(component, id, callback) {
    var action = component.get('c.deleteAttachment');
    action.setParams({ Id : id });
    action.setCallback(this, function(response) {
      if (response.getState() === 'SUCCESS') {
        callback(null, response.getReturnValue());
      } else {
        callback(JSON.stringify(response.getError()), null);
      }
    });
    $A.enqueueAction(action);
  },
  toggleButtons: function(component){
    $A.util.toggleClass(component.find('image-container'), "hide-buttons");
  },
  startInterval: function(component){
    var intervalInstance = component.get("v.intervalInstance");
    var intervalValue = component.get('v.interval');

    if (intervalInstance === undefined && intervalValue !== undefined && intervalValue > 0 && component.get('v.images').length > 1){
      var self = this;
      var interval = setInterval(
        $A.getCallback(function(){
          self.changeImage(component, 1);
        }), intervalValue
      );
      component.set("v.intervalInstance", interval);
    }
  },
  stopInterval: function(component){
    var interval = component.get("v.intervalInstance");
    if (interval !== undefined){
      clearInterval(interval);
    }
    component.set('v.intervalInstance', undefined);
  },
  restartInterval: function(component){
    var self = this;
    self.stopInterval(component);
    setTimeout($A.getCallback(function(){
      self.startInterval(component);
    }), 5000);
  }
})