import { bitable, UIBuilder } from "@base-open/web-api";

export default  class BitableHelper{
  public static createOpenLink(recordId:string,tableId:string){
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