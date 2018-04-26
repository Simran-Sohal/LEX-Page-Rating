({
  init : function(component, event, helper) {
    component.set('v.uploading', false);
    component.set('v.n_uploading', 0);
    component.set('v.n_uploaded', 0);
    component.set('v.progress', 0);
    component.set('v.done', false);
    component.set('v.uploaderId', 'uploader_'+component.getGlobalId());
    component.set('v.loaded', false);

    if (component.isValid()){
      helper.site_url(component);
    }

    window.addEventListener('message', $A.getCallback( function(postMessageEvent) {
      if (postMessageEvent && component.isValid() && postMessageEvent.data.eventIdentifier === component.getGlobalId()){
        if (postMessageEvent.data.name==='loaded'){
          component.set('v.loaded', true);
        }
        if (postMessageEvent.data.name==='uploading'){
          component.set('v.progress', postMessageEvent.data.percent);
        }
        if (postMessageEvent.data.name==='uploaded'){
          component.set('v.n_uploaded', 0);
          component.set('v.n_uploading', 0);
          component.set('v.progress', 0);
          component.set('v.done', true);
          var input = component.find("file").getElement();
          input.type = '';
          input.type = 'file';

          helper.fireUpload(component);
        }
        if (postMessageEvent.data.name==='error'){
          var error = JSON.parse(postMessageEvent.data.message)[0];
          var eventErr = $A.get('e.sharinpix_free:ErrorHandling').setParams({error: error.message, eventIdentifier: component.get('v.eventIdentifier')});
          eventErr.fire();
        }
      }
      })
    );
  },
  fileInputChange: function(component, event, helper) {
    var loaded = component.get('v.loaded');
    if (loaded){
      var payload = {name: 'new-upload',
              recordId: component.get('v.recordId'),
              eventIdentifier: component.getGlobalId(),
              files: component.find('file').getElement().files,
              prefix: component.get('v.filenamePrefix'),
              fileType: (component.get('v.siteUrl') === '' ? component.get('v.uploadChoice') : 'Attachment')
            };
      helper.upload_via_api(component, payload);
    }
    else {
      helper.upload(component, component.find("file").getElement().files, function(err, res){
        if (err !== 'Error occurred'){
          helper.fireUpload(component);
        }
      });
    }
  },
  handleUploadFinished: function(component, event, helper){
    if(!$A.util.isEmpty(component.get("v.filenamePrefix"))){
      helper.appendPrefix(component, event);
    }else{
      helper.fireUpload(component);
    }
  }
})