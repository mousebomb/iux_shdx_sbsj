import './App.css';
import React, { useState, useEffect } from 'react';
import { bitable, UIBuilder } from "@base-open/web-api";
import callback from './runUIBuilder';
import Config from "./config";

export default function App() {
  const [data, setData] = useState({ t: new Date() });
  useEffect(() => {
    UIBuilder.getInstance('#container', { bitable, callback });
  }, []);
  //监听多维表格选择变化
  useEffect(() => {
    const asyncListen = async () => {
      //先验证表格名称是否都存在
      const sjglTable = await bitable.base.getTableByName(Config.TAB_NAME_SJGL);
      if (!sjglTable) {
        return uiBuilder.markdown(`检测不到\`${Config.TAB_NAME_SJGL}\`表`);
      }
      const offSel = bitable.base.onSelectionChange((event) => {
        // offSel(); // 取消监听所选数据表变化
        setData({ t: new Date() });
        UIBuilder.getInstance('#container', { bitable, callback });
      })
    }
    asyncListen();
  }, []);
  //监听多维表格新增
  useEffect(() => {
    const asyncListen = async () => {
      //先验证表格名称是否都存在
      const tjzbTable = await bitable.base.getTableByName(Config.TAB_NAME_TJZB);
      if (!tjzbTable) {
        return uiBuilder.markdown(`检测不到\`${Config.TAB_NAME_TJZB}\`表`);
      }
      const offAdd = tjzbTable.onRecordAdd((event) => { // 监听字段增加事件。
        // offAdd();
        setData({ t: new Date() });
        UIBuilder.getInstance('#container', { bitable, callback });
      });
    }
    asyncListen();
  }, []);

  return (
    <div id='container'></div>
  );
}