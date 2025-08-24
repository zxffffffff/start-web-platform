const Router = require('@koa/router');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 创建路由实例
const router = new Router();

// 从统一配置文件导入配置
const { DATAS_DATA_DIR } = require('../config/config');

// 数据文件路径
const DATAS_JSON = path.join(DATAS_DATA_DIR, 'datas.json');

// 统一响应格式
const sendSuccess = (ctx, data) => {
    ctx.status = 200;
    ctx.body = {
        ok: true,
        data
    };
};

const sendError = (ctx, err, code) => {
    ctx.status = 200;
    ctx.body = {
        ok: false,
        err,
        code
    };
};

// 读取数据文件
const readDataFile = async () => {
    try {
        const data = await fs.readFile(DATAS_JSON, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        // 如果文件不存在，返回空对象
        if (err.code === 'ENOENT') {
            return {};
        }
        throw err;
    }
};

// 写入数据文件
const writeDataFile = async (data) => {
    await fs.writeFile(DATAS_JSON, JSON.stringify(data, null, 2), 'utf8');
};

/**
 * GET /api/datas
 * 获取数据列表
 */
router.get('/api/datas', async (ctx) => {
    try {
        const data = await readDataFile();
        const dataList = Object.entries(data).map(([id, item]) => ({
            id,
            ...item
        }));

        // 获取分页参数
        const pageNo = parseInt(ctx.query.pageNo) || 1;
        const pageSize = parseInt(ctx.query.pageSize) || 10;

        // 计算分页数据
        const totalCount = dataList.length;
        const startIndex = (pageNo - 1) * pageSize;
        const paginatedDataList = dataList.slice(startIndex, startIndex + pageSize);

        sendSuccess(ctx, {
            dataList: paginatedDataList,
            totalCount,
            pageNo,
            pageSize
        });
    } catch (err) {
        sendError(ctx, `获取数据时出错: ${err.message}`, 'ERR_GET_DATA');
    }
});

/**
 * GET /api/datas/{data-id}
 * 获取单个数据
 */
router.get('/api/datas/:id', async (ctx) => {
    const { id } = ctx.params;

    if (!id || id.trim() === '') {
        sendError(ctx, '缺少 data-id 参数', 'ERR_MISSING_ID');
        return;
    }

    try {
        const data = await readDataFile();
        if (!data[id]) {
            sendError(ctx, `数据未找到: ${id}`, 'ERR_DATA_NOT_FOUND');
            return;
        }

        sendSuccess(ctx, {
            id,
            ...data[id]
        });
    } catch (err) {
        sendError(ctx, `获取数据时出错: ${err.message}`, 'ERR_GET_DATA');
    }
});

// 处理空ID的情况
router.get('/api/datas/', async (ctx) => {
    try {
        const data = await readDataFile();
        const dataList = Object.entries(data).map(([id, item]) => ({
            id,
            ...item
        }));

        sendSuccess(ctx, {
            dataList,
            totalCount: dataList.length,
            pageNo: 1,
            pageSize: dataList.length
        });
    } catch (err) {
        sendError(ctx, `获取数据时出错: ${err.message}`, 'ERR_GET_DATA');
    }
});

/**
 * POST /api/datas
 * 创建数据
 */
router.post('/api/datas', async (ctx) => {
    const body = ctx.request.body;

    // 检查请求体是否存在
    if (!body || Object.keys(body).length === 0) {
        sendError(ctx, '缺少请求体内容', 'ERR_MISSING_BODY');
        return;
    }

    try {
        const data = await readDataFile();

        // 生成唯一ID
        const id = uuidv4();

        // 保存数据
        data[id] = body;
        await writeDataFile(data);

        sendSuccess(ctx, {
            id,
            ...body
        });
    } catch (err) {
        sendError(ctx, `创建数据时出错: ${err.message}`, 'ERR_CREATE_DATA');
    }
});

/**
 * PUT /api/datas/{data-id}
 * 创建或更新数据
 */
router.put('/api/datas/:id', async (ctx) => {
    const { id } = ctx.params;
    const body = ctx.request.body;

    if (!id || id.trim() === '') {
        sendError(ctx, '缺少 data-id 参数', 'ERR_MISSING_ID');
        return;
    }

    // 检查请求体是否存在
    if (!body || Object.keys(body).length === 0) {
        sendError(ctx, '缺少请求体内容', 'ERR_MISSING_BODY');
        return;
    }

    try {
        const data = await readDataFile();
        const exists = !!data[id];

        // 更新或创建数据
        data[id] = body;
        await writeDataFile(data);

        sendSuccess(ctx, {
            id,
            ...body
        });
    } catch (err) {
        sendError(ctx, `更新数据时出错: ${err.message}`, 'ERR_UPDATE_DATA');
    }
});

// 处理空ID的情况
router.put('/api/datas/', async (ctx) => {
    sendError(ctx, '缺少 data-id 参数', 'ERR_MISSING_ID');
});

/**
 * PATCH /api/datas/{data-id}
 * 部分更新数据
 */
router.patch('/api/datas/:id', async (ctx) => {
    const { id } = ctx.params;
    const body = ctx.request.body;

    if (!id || id.trim() === '') {
        sendError(ctx, '缺少 data-id 参数', 'ERR_MISSING_ID');
        return;
    }

    // 检查请求体是否存在
    if (!body || Object.keys(body).length === 0) {
        sendError(ctx, '缺少请求体内容', 'ERR_MISSING_BODY');
        return;
    }

    try {
        const data = await readDataFile();
        if (!data[id]) {
            sendError(ctx, `数据未找到: ${id}`, 'ERR_DATA_NOT_FOUND');
            return;
        }

        // 部分更新数据
        data[id] = {
            ...data[id],
            ...body
        };

        await writeDataFile(data);

        sendSuccess(ctx, {
            id,
            ...data[id]
        });
    } catch (err) {
        sendError(ctx, `部分更新数据时出错: ${err.message}`, 'ERR_PATCH_DATA');
    }
});

// 处理空ID的情况
router.patch('/api/datas/', async (ctx) => {
    sendError(ctx, '缺少 data-id 参数', 'ERR_MISSING_ID');
});

/**
 * DELETE /api/datas/{data-id}
 * 删除数据
 */
router.delete('/api/datas/:id', async (ctx) => {
    const { id } = ctx.params;

    if (!id || id.trim() === '') {
        sendError(ctx, '缺少 data-id 参数', 'ERR_MISSING_ID');
        return;
    }

    try {
        const data = await readDataFile();
        if (!data[id]) {
            sendError(ctx, `数据未找到: ${id}`, 'ERR_DATA_NOT_FOUND');
            return;
        }

        delete data[id];
        await writeDataFile(data);

        sendSuccess(ctx, null);
    } catch (err) {
        sendError(ctx, `删除数据时出错: ${err.message}`, 'ERR_DELETE_DATA');
    }
});

// 处理空ID的情况
router.delete('/api/datas/', async (ctx) => {
    sendError(ctx, '缺少 data-id 参数', 'ERR_MISSING_ID');
});

module.exports = router;