// @ts-ignore
/* eslint-disable */

declare namespace API {
  // 统一响应格式
  type Response<T> = {
    ok: boolean;
    data?: T;
    err?: string;
    code?: string;
    traceId?: string;
  };

  // 数据项类型
  type DataItem = {
    id: string;
    name: string;
    content: string;
  };

  // 数据列表响应类型
  type DataListResult = {
    dataList: DataItem[];
    totalCount: number;
    pageNo: number;
    pageSize: number;
  };
}