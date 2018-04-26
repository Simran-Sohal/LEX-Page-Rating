({
    MAX_FILE_SIZE: 2500000, // 6 000 000 * 3/4 to account for base64
    CHUNK_SIZE: 500000,
    filetoBase64 : function(file, callback){
        var fr = new FileReader();
        fr.onload = function() {
            var fileContents = fr.result;
            var base64Mark = 'base64,';
            var dataStart = fileContents.indexOf(base64Mark) + base64Mark.length;
            fileContents = fileContents.substring(dataStart);
            $A.getCallback(function(){
                callback(null, fileContents);
            })();
        }
        fr.readAsDataURL(file);
    },
    update_progress:  function(component){
        component.set('v.progress', 30 + Math.round(component.get('v.n_uploaded')/component.get('v.n_uploading')*70));
    },
    upload: function(component, files, callback) {
        var helper = this;
        for (var i=0; i < files.length; i++) {
            component.set('v.n_uploading', component.get('v.n_uploading') + 1);
            helper.update_progress(component);
            this.upload_file(component, files[i], function(err, res){
                if (err !== null){
                    callback('Error occurred', null);
                    component.set('v.n_uploaded', 0);
                    component.set('v.n_uploading', 0);
                    component.set('v.progress', 0);
                    component.set('v.done', true);
                    var error = JSON.parse(err)[0];
                    var event = $A.get('e.sharinpix_free:ErrorHandling').setParams({error: error.message, eventIdentifier: component.get('v.eventIdentifier')});
                    event.fire();
                    return;
                }
                component.set('v.n_uploaded', component.get('v.n_uploaded') + 1);
                helper.update_progress(component);
                if(component.get('v.n_uploaded') === component.get('v.n_uploading')){
                    callback(null, component.get('v.n_uploaded'));
                    component.set('v.n_uploaded', 0);
                    component.set('v.n_uploading', 0);
                    component.set('v.progress', 0);
                    component.set('v.done', true);
                    var input = component.find("file").getElement();
                    input.type = '';
                    input.type = 'file';
                }
            })
        }
    },
    upload_file: function(component, file, callback) {
        if (file.size > this.MAX_FILE_SIZE) {
            return callback('[{"message": "File size cannot exceed ' + this.MAX_FILE_SIZE + ' bytes. ' +
              'Selected file size: ' + file.size + '."}]', null);
        }
        var self = this;
        this.filetoBase64(file, function(err, content){
            self.uploadChunk(component, file, content, 0, callback);
        });
    },

    uploadChunk : function(component, file, fileContents, fromPos, callback, attachId) {
        if (fromPos === fileContents.length) {
            return callback(null, attachId);
        }
        var toPos = Math.min(fileContents.length, fromPos + this.CHUNK_SIZE);
        var chunk = fileContents.substring(fromPos, toPos);

        var action = component.get("c.saveTheChunk");
        var prefix = $A.util.isEmpty(component.get("v.filenamePrefix")) ? '' : component.get("v.filenamePrefix");
        action.setParams({
            parentId: component.get("v.recordId"),
            fileName: prefix + file.name,
            base64Data: encodeURIComponent(chunk),
            contentType: file.type,
            fileId: attachId
        });

        var self = this;
        action.setCallback(this, function(response) {
            if (response.getState() === 'SUCCESS') {
                attachId = response.getReturnValue();
                self.uploadChunk(component, file, fileContents, toPos, callback, attachId);
            }else{
                callback(JSON.stringify(response.getError()), null);
            }
        });

        $A.enqueueAction(action);
    },

    upload_via_api: function(component, payload){
        component.find('upload-iframe').getElement().contentWindow.postMessage(payload, '*');
    },

    site_url: function(component){
        var action = component.get("c.site");
        action.setCallback(this, function(response) {
            var baseUrl = window.location.protocol + '//' + window.location.hostname;
            component.set('v.iframeUrl', response.getReturnValue()+'/apex/sharinpix_free__SharinPixUploadApi?url='+baseUrl+'&eventIdentifier='+component.getGlobalId());
            component.set('v.siteUrl', response.getReturnValue());
        });
        $A.enqueueAction(action);
    },

    fireUpload: function(component) {
        var eventUploaded = $A.get('e.sharinpix_free:Uploaded');
        eventUploaded.setParam('eventIdentifier', component.get('v.eventIdentifier'));
        eventUploaded.fire();
    }, 

    appendPrefix: function(component, event){
        var prefix = component.get("v.filenamePrefix");
        var files = event.getParam("files");
        for(var i=0; i<files.length; i++){
            files[i].name = prefix + files[i].name;
        }
        var jsonFile = JSON.stringify(files);
        var action = component.get("c.appendPrefix");
        action.setParams({
            uploads : jsonFile
        });
        var self = this;
        action.setCallback(this, function(response){
            if (response.getState() === 'SUCCESS') {
                self.fireUpload(component);
            }
        });
        $A.enqueueAction(action);
    }
})