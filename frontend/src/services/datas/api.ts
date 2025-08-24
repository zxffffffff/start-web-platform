// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取数据列表 GET /api/datas */
export async function getDataList(
  params?: {
    pageNo?: number;
    pageSize?: number;
  },
  options?: { [key: string]: any }
) {
  return request<API.Response<API.DataListResult>>('/api/datas', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 创建数据 POST /api/datas */
export async function createData(
  body: { name: string; content: string },
  options?: { [key: string]: any },
) {
  return request<API.Response<API.DataItem>>('/api/datas', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

/** 获取数据内容 GET /api/datas/${id} */
export async function getData(
  id: string,
  options?: { [key: string]: any },
) {
  return request<API.Response<API.DataItem>>(`/api/datas/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 更新数据 PUT /api/datas/${id} */
export async function updateData(
  id: string,
  body: { name: string; content: string },
  options?: { [key: string]: any },
) {
  return request<API.Response<API.DataItem>>(`/api/datas/${id}`, {
    method: 'PUT',
    data: body,
    ...(options || {}),
  });
}

/** 删除数据 DELETE /api/datas/${id} */
export async function deleteData(
  id: string,
  options?: { [key: string]: any },
) {
  return request<API.Response<any>>(`/api/datas/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}
