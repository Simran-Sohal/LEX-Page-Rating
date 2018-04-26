({
    reloadSource: function(component) {
        var source = component.get('v.attachmentId');
        component.set('v.source', undefined);
        if (!$A.util.isEmpty(source) && (source.length === 15 || source.length === 18)) {
            if (this.validateStartsWith(source, '00P')){
                component.set('v.source', (component.get('v.siteUrl') === undefined ? '' : component.get('v.siteUrl')) + '/servlet/servlet.FileDownload?file=' + source);
            }
            else if (this.validateStartsWith(source, '068')){
                component.set('v.source', '/sfc/servlet.shepherd/version/download/'+source);
            }
        }
        else if (!$A.util.isEmpty(source)) {
            component.set('v.source', source);
        }
        else if (!$A.util.isEmpty(component.get('v.urlField'))){
            var recordId = component.get('v.recordId');
            var urlFieldName = component.get('v.urlField');
            
            if (!$A.util.isEmpty(recordId)) {
                this.fetchURL(component, recordId, urlFieldName);
            }
        }
    },
    siteUrl: function(component){
        var action = component.get("c.site");
        action.setCallback(this, function(response) {
            component.set('v.siteUrl', response.getReturnValue());
            this.reloadSource(component);
        });
        $A.enqueueAction(action);
    },
    validateStartsWith: function(source, searchString){
        return source.indexOf(searchString, 0) === 0;
    },
    fetchURL: function(component, recordId, urlFieldName){
        var action = component.get("c.fetchURL");
        action.setParams({
            "recordId": recordId,
            "urlFieldName": urlFieldName
        });
      	action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS"){
                var url = response.getReturnValue();

                if(!$A.util.isEmpty(url)){
                    component.set('v.source', url);
                }else{
                    component.set('v.source', '');
                }
            }else{
                component.set('v.source', '');
            }
        });
        $A.enqueueAction(action);
    }
})