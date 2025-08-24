# start-web-platform

搭建 web 平台的脚手架，前后端分离 Ant Design Pro + Koa

## 接口规范（RESTful API 风格）

### 请求规范

HTTP方法和URL格式：

- GET    /api/datas            获取数据列表
- GET    /api/datas/{data-id}  获取单个数据
- POST   /api/datas            创建数据（响应返回 data-id）
- PUT    /api/datas/{data-id}  创建或更新数据
- PATCH  /api/datas/{data-id}  部分更新数据
- DELETE /api/datas/{data-id}  删除数据

参数传递：

- GET 用 Query Params
- POST/PUT/PATCH 用 JSON Body（Content-Type: application/json）
- 传输包含文件类型时采用其他格式（Content-Type: multipart/form-data）

状态码规范：

- 接口一律返回 200，错误信息在响应体中管理

### 响应规范

基础结构：

- ok: bool 必填，表示操作是否成功（例如请求参数错误返回 false）
- data: object 操作成功时必填，返回数据
- err: string 操作失败时必填，前端展示错误信息
- code: string 操作失败时必填，前端展示错误码
- traceId: string 非必填，用于日志定位（前端生成uuid4）

> 这里不使用 success 和 message 是为了兼容各种脚手架的过滤规则，前端收到 success: false 可能被拦截报错

```json
// 成功 status = 200
{
    "ok": true,
    "data": {},
}

// 失败 status = 200
{
    "ok": false,
    "err": "请求参数错误，请检查xxx字段",
    "code": "ERR_REQ_PARAM_ERROR",
}

// 分页查询
{
    "ok": true,
    "data": {
        "dataList": [],
        "totalCount": 100,
        "pageNo": 1,
        "pageSize": 20
    }
}
```

## 提交前检查

```text
请检查当前代码中是否包含以下隐私泄露风险：
- 明文密码、密钥、token、accessKey、secretKey、privateKey、证书等敏感凭据；
- 真实 IP、域名、URL、邮箱、手机号、身份证号等个人信息；
- 日志、测试、mock 数据中包含真实用户数据或敏感字段；
- 公司内部域名、API、数据库连接串、云服务凭据等；
- 敏感文件未加入 .gitignore；
- 注释或文档中暴露敏感信息。 若有，请及时清理或加密处理。
```
