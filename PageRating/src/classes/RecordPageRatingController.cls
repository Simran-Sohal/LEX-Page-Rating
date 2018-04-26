public class RecordPageRatingController {

    @AuraEnabled
    public static String getOverallRating(String pageName, Id recordId){
        String retVal;
        
        if (String.IsBlank(pageName)){
            return JSON.serialize(getError('Page Name cannot be blank'));
        } 
        if (recordId == null){
            return JSON.serialize(getError('Record ID cannot be blank'));
        } 
        
        String objectName = recordId.getSobjectType().getDescribe().getName();
        
        List<Record_Page__c> recordPages = [SELECT Id, Overall_Rating__c
                                                 , Total_Number_Of_Ratings__c
                                                 , Related_Object_Name__c
                                              FROM Record_Page__c
                                             WHERE Page_Developer_Name__c = :pageName];
        
        if (recordPages.size() == 0){
            return JSON.serialize(getError('Unable to find details for this record page'));
        }
        if (recordPages.size() == 1 && recordPages.get(0).Related_Object_Name__c != objectName){
            return JSON.serialize(getError('The page you selected is not related to object ' + objectName));
        }
        
        PageOverallRating pageRating = new PageOverallRating();
        pageRating.recordPageId = recordPages.get(0).Id;
        pageRating.overallRating = recordPages.get(0).Overall_Rating__c;
        pageRating.totalRatings = (Integer)recordPages.get(0).Total_Number_Of_Ratings__c;
        pageRating.returnStatus = 'SUCCESS';
        
        return JSON.serialize(pageRating);
    }
    
    @AuraEnabled
    public static String addNewRating(Id recordPageId, String rating, String comments){
        try{
            Record_Page_Rating__c newRating = new Record_Page_Rating__c();
            newRating.Page_Name__c = recordPageId;
            newRating.Rating__c = Integer.valueOf(rating);
            newRating.Comments__c = comments;
            insert newRating;
            
            return JSON.serialize(new ReturnValue('SUCCESS'));
        }
        catch(Exception e){
            return JSON.serialize(getError(e.getMessage()));
        }
    }
    
    public virtual class ReturnValue{
        public String returnStatus;
        public ReturnValue(){
            returnStatus = '';
        }
        public ReturnValue(String status){
            returnStatus = status;
        }
    }
    
    public class PageOverallRating extends ReturnValue{
        public Id recordPageId;
        public Decimal overallRating;
        public Integer totalRatings;
    }

    public class Error extends ReturnValue{
        public String errorMessage;
    }
    
    private static Error getError(String errMsg){
        Error err = new Error();
        err.returnStatus = 'ERROR';
        err.errorMessage = errMsg;
        return err;
    }
    
}