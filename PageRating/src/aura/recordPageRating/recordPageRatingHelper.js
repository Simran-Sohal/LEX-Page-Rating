({
	setOverallRating : function(component, event, helper) {
        var action = component.get("c.getOverallRating");
        action.setParams({ 
            pageName : component.get("v.pageName"),
            recordId : component.get("v.recordId")
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var retVal = JSON.parse(response.getReturnValue());
                if (retVal.returnStatus == "SUCCESS"){
                    component.set("v.recordPageId", retVal.recordPageId);
                    if (retVal.totalRatings <= 0){
                        helper.setOverallRatingMessage(component, "No ratings found", "slds-text-color_weak");
                    } else {
                        helper.setOverallRatingMessage(component, "Overall Rating", "slds-text-color_weak");
                        helper.setOverallRatingValue(component, retVal.overallRating);
                    }
                } 
                else if (retVal.returnStatus == "ERROR"){
                    helper.setOverallRatingMessage(component, retVal.errorMessage, "slds-text-color_error");
                }
            }
            else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        helper.setOverallRatingMessage(component, errors[0].message, "slds-text-color_error");
                    }
                } else {
                    helper.setOverallRatingMessage(component, "Unknown error", "slds-text-color_error");
                }
            }
        });
        $A.enqueueAction(action);		
	},
    setOverallRatingMessage : function(component, messageText, messageClass){
        var textClass = "slds-text-body_small " + messageClass;
        $A.createComponent(
            "ui:outputText",
            {
                "class": textClass,
                "value": messageText
            },
            function(ratingMessage, status, errorMessage){
                //Add the new button to the body array
                if (status === "SUCCESS") {
                    component.set("v.overallRatingMessage", ratingMessage);
                }
                else if (status === "INCOMPLETE") {
                    console.log("No response from server or client is offline.")
                }
                else if (status === "ERROR") {
                    console.log("Error: " + errorMessage);
                }
            }
        );    
    },
    setOverallRatingValue : function(component, overallRatingValue){
        var ratingClass;
        if (overallRatingValue < 4 && overallRatingValue >= 2.5){
            ratingClass = "warning-text-color";
        } else if (overallRatingValue < 2.5){
            ratingClass = "error-text-color";
        } else {
            ratingClass = "success-text-color";
        }
        
        ratingClass = "slds-text-heading_large " + ratingClass;
        
        $A.createComponent(
            "ui:outputText",
            {
                "class": ratingClass,
                "value": overallRatingValue
            },
            function(ratingValue, status, errorMessage){
                //Add the new button to the body array
                if (status === "SUCCESS") {
                    component.set("v.overallRatingValue", ratingValue);
                }
                else if (status === "INCOMPLETE") {
                    console.log("No response from server or client is offline.")
                }
                else if (status === "ERROR") {
                    console.log("Error: " + errorMessage);
                }
            });
    },
    showAddRatingSection : function(component, event, helper) {
        $A.createComponent(
            "c:newPageRating",
            {
                "recordPageId": component.get("v.recordPageId")
            },
            function(newRating, status, errorMessage){
                //Add the new button to the body array
                if (status === "SUCCESS") {
                    component.set("v.addRating", newRating);
                }
                else if (status === "INCOMPLETE") {
                    console.log("No response from server or client is offline.")
                }
                else if (status === "ERROR") {
                    console.log("Error: " + errorMessage);
                }
            }
        );    
    }
})