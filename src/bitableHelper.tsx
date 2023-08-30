import { bitable, UIBuilder } from "@base-open/web-api";

export default  class BitableHelper{
  public static createOpenLink(recordId,tableId){
    return {
        record_ids: [
          recordId
        ],
        table_id: tableId,
        text: "1",
        type: "text"
      };
  }
}