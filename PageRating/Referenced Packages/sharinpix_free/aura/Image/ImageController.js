({
  doInit : function(component) {
    component.reload();
  },
  doNext : function(component, event, helper){
    helper.changeImage(component, 1);
  },
  doPrevious : function(component, event, helper){
    helper.changeImage(component, -1);
  },
  uploaded: function(component, event){
    if (component.getGlobalId() === event.getParam('eventIdentifier')){
      component.reload();
    }
  },
  doReload : function(component, event, helper) {
    helper.stopInterval(component);
    helper.setComponentAttributes(component, { loading: false, images: [], total: 0, index: 0, image: {id: ''}, errorMessage: null, displayButtons: true });

    helper.getImages(component, component.get('v.recordId'), function(err, images) {
      if (component.isValid() && images != null) {
        helper.setComponentAttributes(component, {
          total: images.length,
          index: 0,
          images: images,
          image: images[0],
          loading: false,
          displayButtons: true
        });
        helper.startInterval(component);
      } else {
        helper.setComponentAttributes(component, {'errorMessage': $A.get('$Label.sharinpix_free.err_unknown'), 'loading': false, displayButtons: false});
      }
    });
  },
  doDelete: function(component, event, helper) {
    component.set('v.loading', true);
    var id = component.get('v.image').Id;
    helper.deleteAttachment(component, id, function(err, resp){
      if (err !== null){
        var error = JSON.parse(err)[0];
        helper.setComponentAttributes(component, {'errorMessage': error.message, 'loading': false});
      }
      else {
        component.reload();
      }
    });
  },
  displayError: function(component, event, helper){
    if (component.getGlobalId() === event.getParam('eventIdentifier')){
      helper.setComponentAttributes(component, {'errorMessage': event.getParams('error').error, 'loading': false, 'displayButtons': true});
    }
  },
  toggle : function(component, event, helper) {
    helper.toggleButtons(component);
    helper.restartInterval(component);
  }
})