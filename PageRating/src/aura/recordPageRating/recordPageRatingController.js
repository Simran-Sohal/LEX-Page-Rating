({
	doInit : function(component, event, helper) {
		helper.setOverallRating(component, event, helper);
	},
    initAddRating : function(component, event, helper) {
		helper.showAddRatingSection(component, event, helper);
	},
    handlePageEvent : function(component, event, helper) {
		var recordPageIdEvt = event.getParam("recordPageId");
		var actionType = event.getParam("action");

        var recordPageId = component.get("v.recordPageId");
        
        if (!$A.util.isUndefinedOrNull(recordPageId)){
            if (recordPageId == recordPageIdEvt){
                var blankComp = [];
                component.set("v.addRating", blankComp);
                if (actionType == "SUBMIT"){
                    helper.setOverallRating(component, event, helper);
                }
            }
        }
	},
})