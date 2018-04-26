({
	onSubmit : function(component, event, helper) {
        var action = component.get("c.addNewRating");
        action.setParams({ 
            recordPageId : component.get("v.recordPageId"),
            rating : component.get("v.rating"),
            comments : component.get("v.comments")
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var retVal = JSON.parse(response.getReturnValue());
                if (retVal.returnStatus == "SUCCESS"){
                    helper.raiseToastEvent(component,event, "success","Thank you for response.");
                    helper.raisePageEvent(component, event, "SUBMIT");
                } 
                else if (retVal.returnStatus == "ERROR"){
                    helper.raiseToastEvent(component,event, "error", retVal.errorMessage);
                }
            }
        });
        $A.enqueueAction(action);		
	},
	onCancel : function(component, event, helper) {
		helper.raisePageEvent(component, event, "CANCEL");
	},
    
})