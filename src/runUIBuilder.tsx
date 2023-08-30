import { bitable, UIBuilder } from "@base-open/web-api";
import Config from "./config";
import BitableHelper from "./bitableHelper";

export default async function main(uiBuilder: UIBuilder) {
  //先验证表格名称是否都存在
  const sjglTable = await bitable.base.getTableByName(Config.TAB_NAME_SJGL);
  const tjzbTable = await bitable.base.getTableByName(Config.TAB_NAME_TJZB);
  if (!sjglTable) {
    return uiBuilder.markdown(`检测不到\`${Config.TAB_NAME_SJGL}\`表`);
  }
  if (!tjzbTable) {
    return uiBuilder.markdown(`检测不到\`${Config.TAB_NAME_TJZB}\`表`);
  }
  //验证字段
  const sjglFieldMetaList = await sjglTable.getFieldMetaList();
  const sjglZhiJu = sjglFieldMetaList.find((li) => li.name == Config.FIELD_SJGL_ZJ);
  const sjglKeHu = sjglFieldMetaList.find((li) => li.name == Config.FIELD_SJGL_KEHU);
  const sjglYiShangBao = sjglFieldMetaList.find((li) => li.name == Config.FIELD_SJGL_YISHANGBAO);
  const sjglYuJiJinE = sjglFieldMetaList.find((li) => li.name == Config.FIELD_SJGL_YUJIJINE);
  if (!sjglZhiJu) { return uiBuilder.markdown(`检测不到\`${Config.FIELD_SJGL_ZJ}\`字段`); }
  if (!sjglKeHu) { return uiBuilder.markdown(`检测不到\`${Config.FIELD_SJGL_KEHU}\`字段`); }
  if (!sjglYiShangBao) { return uiBuilder.markdown(`检测不到\`${Config.FIELD_SJGL_YISHANGBAO}\`字段`); }
  if (!sjglYuJiJinE) { return uiBuilder.markdown(`检测不到\`${Config.FIELD_SJGL_YUJIJINE}\`字段`); }

  const tjzbFieldMetaList = await tjzbTable.getFieldMetaList();
  const tjzbKeHu = tjzbFieldMetaList.find((li) => li.name == Config.FIELD_TJZB_KEHU);
  if (!tjzbKeHu) { return uiBuilder.markdown(`检测不到\`${Config.FIELD_TJZB_KEHU}\`字段`); }

  //输出表单
  // let t = new Date();
  // let tS = t.toString();
  uiBuilder.markdown(`
  **商机上报**
  `);

  const selection = await bitable.base.getSelection();
  // console.log("getSelection", selection);
  // uiBuilder.showLoading('Loading...');
  // // 1000 毫秒后隐藏 loading
  // setTimeout(() => {
  //   uiBuilder.hideLoading();
  // }, 1000);

  //确保选中了行
  if (!selection.recordId) {
    return uiBuilder.text("没有选中任何商机");
  }
  //检测当前选中是否在商机管理表
  const selectionTable = await bitable.base.getTableById(selection.tableId);
  const selectionTableName = await selectionTable.getName();
  if (selectionTableName != Config.TAB_NAME_SJGL) {
    return uiBuilder.text("选中的表格不是商机表");
  }

  //确定要填入的字段值
  //--显示核对数据：
  //客户=.对接客户
  //支局=.支局
  //最近跟进时间

  //支局
  const cellStrZhiJu = await selectionTable.getCellString(sjglZhiJu.id, selection.recordId);
  //预计金额
  const cellStrZhiJuYuJiJinE = await selectionTable.getCellString(sjglYuJiJinE.id, selection.recordId);
  //客户
  const cellStrKeHu = await selectionTable.getCellString(sjglKeHu.id, selection.recordId);


  //--写入数据：
  //客户 客户=引用
  const cellValueKeHu = BitableHelper.createOpenLink(selection.recordId, selection.tableId);
  // 查重，确保不要重复写入客户
  const isYiShangBao = await selectionTable.getCellString(sjglYiShangBao.id,selection.recordId);
  if (isYiShangBao)
  {
    return uiBuilder.markdown(`该商机已上报: 【${cellStrKeHu}】，不需要重复上报`);
  }
  
  // //支局
  // // const cellValueZhiJu = await selectionTable.getCellValue(sjglZhiJu.id,selection.recordId);
  // //写入单选之前需要确保选项都有
  // //去掉type属性 才能修改，修改单选，把选项同步过去 需要合并，原先已有的id不能改
  // let tryFind = await tjzbZhiJu.property.options.find((li) => li.name == cellStrZhiJu);
  // if (!tryFind) {
  //   let zhiJuPropertyAltered = { options: tjzbZhiJu.property.options.concat([]) };
  //   let tryFindSrc = await sjglZhiJu.property.options.find((li) => li.name == cellStrZhiJu);
  //   zhiJuPropertyAltered.options.push(tryFindSrc);
  //   let setConfig = { name: sjglZhiJu.name, property: zhiJuPropertyAltered };
  //   console.log("检查到新选项" + cellStrZhiJu + "，修改字段选项", JSON.stringify(setConfig));
  //   // const updateTjzbZhiJuRes = await tjzbTable.setField(tjzbZhiJu.id, setConfig);
  //   // 目前由于bitable的api会导致选项修改后所有已填内容丢失，因此暂时先提示人工调整字段。
  //   uiBuilder.markdown(`**发现问题**：请先手动添加新选项**${cellStrZhiJu}**到[${Config.TAB_NAME_TJZB}]表[**${Config.FIELD_SJGL_ZJ}**]选项`);
  //   return;
  // }

  // // 单选的id不同，还需要找到写入目标表的id
  // const cellValueZhiJu = await tjzbZhiJu.property.options.find((li) => li.name == cellStrZhiJu);
  // console.log("cellValueZhiJu", cellValueZhiJu);
  


  uiBuilder.markdown(`确认要上报的商机：
  - ${cellStrKeHu}
  - 预计商机金额${cellStrZhiJuYuJiJinE}`);

  uiBuilder.form((form) => ({
    formItems: [],
    buttons: ['提交上报'],
  }), async ({ key, values }) => {
    if (key == "提交上报") {
      //写入数据
      const flushData = async () => {
        //显示加载
        uiBuilder.showLoading('Loading...');
        await tjzbTable.addRecord({
          fields: {
            [tjzbKeHu.id]: cellValueKeHu
          }
        });
        uiBuilder.hideLoading();
        uiBuilder.message.success(`已经写入完毕`);
      }
      flushData();
    }
  });
}