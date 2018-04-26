({
	raisePageEvent : function(component, event, actionType) {
		var newPageRatingEvt = $A.get("e.c:newPageRatingEvent");
        newPageRatingEvt.setParams({
            "recordPageId" : component.get("v.recordPageId"),
            "action" : actionType
        });
        newPageRatingEvt.fire();
	},
	raiseToastEvent : function(component, event, toastType, toastMessage) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "type": toastType,
            "message": toastMessage
        });
        toastEvent.fire();
	},
})