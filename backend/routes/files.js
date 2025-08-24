const Router = require('@koa/router');
const fs = require('fs').promises;
const path = require('path');

// 创建路由实例
const router = new Router();

// 从统一配置文件导入配置
const { DATA_DIR } = require('../config/config');
const listDir = path.join(DATA_DIR, 'test-case-list');
(async () => {
    try {
        // 确保数据目录存在
        await fs.mkdir(listDir, { recursive: true });
    } catch (err) {
        console.error('创建目录失败:', err);
    }
})();

// 统一错误响应格式
const sendError = (ctx, status, message) => {
    ctx.status = status;
    ctx.body = {
        success: false,
        message
    };
};

// 处理空文件名的情况 - 放在具体路由之前
router.post('/api/files/', async (ctx) => {
    sendError(ctx, 400, '缺少 filename 参数。');
});

router.get('/api/files/', async (ctx) => {
    sendError(ctx, 400, '缺少 filename 参数。');
});

router.put('/api/files/', async (ctx) => {
    sendError(ctx, 400, '缺少 filename 参数。');
});

router.delete('/api/files/', async (ctx) => {
    sendError(ctx, 400, '缺少 filename 参数。');
});

// 添加处理非法路径的路由，确保返回400而不是404或405
router.post('/api/files/../:filename(.*)', async (ctx) => {
    sendError(ctx, 400, '非法的文件名。');
});

router.get('/api/files/../:filename(.*)', async (ctx) => {
    sendError(ctx, 400, '非法的文件名。');
});

router.put('/api/files/../:filename(.*)', async (ctx) => {
    sendError(ctx, 400, '非法的文件名。');
});

router.delete('/api/files/../:filename(.*)', async (ctx) => {
    sendError(ctx, 400, '非法的文件名。');
});

/**
 * GET /api/files
 * 获取文件列表
 * 
 * 成功响应:
 *   状态码: 200
 *   响应体: string[] (直接返回文件路径数组)
 * 
 * 错误响应:
 *   状态码: 500
 *   响应体: { success: false, message: string }
 *     - message: 错误描述信息
 */
router.get('/api/files', async (ctx) => {
    try {
        // 递归获取所有文件和文件夹
        const getAllFiles = async (dirPath) => {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            const files = [];

            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                const relativePath = path.relative(DATA_DIR, fullPath);
                // 使用正斜杠替换路径分隔符，确保在所有平台上一致
                const normalizedPath = relativePath.split(path.sep).join('/');

                if (entry.isDirectory()) {
                    const subFiles = await getAllFiles(fullPath);
                    files.push(...subFiles);
                } else {
                    files.push(normalizedPath);
                }
            }

            return files;
        };

        const files = await getAllFiles(DATA_DIR);
        ctx.status = 200;
        ctx.body = files;
    } catch (err) {
        sendError(ctx, 500, `获取文件列表时出错: ${err.message}`);
        console.error(`获取文件列表时出错: ${err.message}`);
    }
});

/**
 * POST /api/files/:filename
 * 创建新文件并写入内容
 * 请求体: 要写入的内容（可以是任意格式）
 * 
 * 成功响应:
 *   状态码: 201
 *   响应体: { success: true, message: string }
 *     - message: 操作结果描述，格式为"成功创建文件: [filename]"
 * 
 * 错误响应:
 *   状态码: 400
 *   响应体: { success: false, message: '缺少 filename 参数。' | '非法的文件名。' | '缺少请求体内容。' }
 *     - message: 错误描述信息
 *   
 *   状态码: 409
 *   响应体: { success: false, message: string }
 *     - message: 格式为"文件已存在: [filename]"
 *   
 *   状态码: 500
 *   响应体: { success: false, message: string }
 *     - message: 错误描述信息
 */
router.post('/api/files/:filename(.*)', async (ctx) => {
    const { filename } = ctx.params;
    if (!filename || filename.trim() === '') {
        sendError(ctx, 400, '缺少 filename 参数。');
        return;
    }

    // 检查文件名是否包含非法字符或路径遍历攻击
    if (filename.includes('..') || (path.sep !== '/' && filename.includes('../'))) {
        sendError(ctx, 400, '非法的文件名。');
        return;
    }

    const content = ctx.request.body;
    const filePath = path.join(DATA_DIR, filename);

    try {
        // 检查文件是否已存在
        try {
            await fs.access(filePath);
            sendError(ctx, 409, `文件已存在: ${filename}`);
            return;
        } catch (err) {
            // 文件不存在，继续创建
        }

        // 确保文件的目录存在
        const fileDir = path.dirname(filePath);
        await fs.mkdir(fileDir, { recursive: true });

        // 根据文件扩展名决定如何处理内容
        if (filename.endsWith('.json')) {
            await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf8');
        } else {
            // 对于非.json文件，以二进制形式写入，避免编码问题
            let dataToWrite;
            if (content === undefined) {
                // 如果内容是undefined，写入空Buffer
                dataToWrite = Buffer.alloc(0);
            } else if (Buffer.isBuffer(content)) {
                // 如果内容已经是Buffer，直接使用
                dataToWrite = content;
            } else if (typeof content === 'string') {
                // 如果内容是字符串，转换为Buffer
                dataToWrite = Buffer.from(content);
            } else {
                // 其他情况，尝试转换为Buffer
                dataToWrite = Buffer.from(content);
            }
            await fs.writeFile(filePath, dataToWrite);
        }
        ctx.status = 201;
        ctx.body = {
            success: true,
            message: `成功创建文件: ${filename}`
        };
    } catch (err) {
        sendError(ctx, 500, `创建文件时出错: ${err.message}`);
        console.error(`创建文件 ${filename} 时出错: ${err.message}`);
    }
});

/**
 * GET /api/files/:filename
 * 读取指定文件内容
 * 
 * 成功响应:
 *   对于.json文件:
 *     状态码: 200
 *     响应体: JSON对象 (直接返回解析后的JSON内容，不包含status/data/message包装)
 *   
 *   对于非.json文件:
 *     状态码: 200
 *     响应体: Buffer (文件二进制内容)
 * 
 * 错误响应:
 *   状态码: 400
 *   响应体: { success: false, message: '缺少 filename 参数。' | '非法的文件名。' }
 *     - message: 错误描述信息
 *   
 *   状态码: 404
 *   响应体: { success: false, message: string }
 *     - message: 格式为"文件未找到: [filename]"
 *   
 *   状态码: 500
 *   响应体: { success: false, message: string }
 *     - message: 错误描述信息，如JSON解析错误等
 */
router.get('/api/files/:filename(.*)', async (ctx) => {
    const { filename } = ctx.params;

    if (!filename || filename.trim() === '') {
        sendError(ctx, 400, '缺少 filename 参数。');
        return;
    }

    // 检查文件名是否包含非法字符或路径遍历攻击
    if (filename.includes('..') || (path.sep !== '/' && filename.includes('../'))) {
        sendError(ctx, 400, '非法的文件名。');
        return;
    }

    const filePath = path.join(DATA_DIR, filename);

    try {
        // 对.json文件进行特殊处理，确保返回JSON对象
        if (filename.endsWith('.json')) {
            const data = await fs.readFile(filePath, 'utf8');
            try {
                const parsedData = JSON.parse(data);
                ctx.type = 'json';
                ctx.status = 200;
                ctx.body = parsedData;
            } catch (parseError) {
                sendError(ctx, 500, `文件 ${filename} 不是有效的JSON格式`);
                console.error(`解析JSON文件 ${filename} 时出错: ${parseError.message}`);
            }
        } else {
            // 对于非.json文件，以二进制形式读取和返回，避免编码问题
            const data = await fs.readFile(filePath);
            ctx.status = 200;
            ctx.body = data;
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            sendError(ctx, 404, `文件未找到: ${filename}`);
        } else {
            sendError(ctx, 500, `读取文件时出错: ${err.message}`);
            console.error(`读取文件 ${filename} 时出错: ${err.message}`);
        }
    }
});

/**
 * PUT /api/files/:filename
 * 更新指定文件内容，如果文件不存在则创建文件
 * 请求体: 要更新/创建的内容（可以是任意格式）
 * 
 * 成功响应:
 *   状态码: 200 (更新文件)
 *   状态码: 201 (创建文件)
 *   响应体: { success: true, message: string }
 *     - message: 操作结果描述，格式为"成功更新文件: [filename]"或"成功创建文件: [filename]"
 * 
 * 错误响应:
 *   状态码: 400
 *   响应体: { success: false, message: '缺少 filename 参数。' | '非法的文件名。' | '缺少请求体内容。' }
 *     - message: 错误描述信息
 *   
 *   状态码: 500
 *   响应体: { success: false, message: string }
 *     - message: 错误描述信息
 */
router.put('/api/files/:filename(.*)', async (ctx) => {
    const { filename } = ctx.params;
    if (!filename || filename.trim() === '') {
        sendError(ctx, 400, '缺少 filename 参数。');
        return;
    }

    // 检查文件名是否包含非法字符或路径遍历攻击
    if (filename.includes('..') || (path.sep !== '/' && filename.includes('../'))) {
        sendError(ctx, 400, '非法的文件名。');
        return;
    }

    const content = ctx.request.body;
    if (content === undefined) {
        sendError(ctx, 400, '缺少请求体内容。');
        return;
    }

    const filePath = path.join(DATA_DIR, filename);
    let fileExists = true;

    try {
        // 检查文件是否存在
        try {
            await fs.access(filePath);
        } catch (err) {
            // 文件不存在，将创建新文件
            fileExists = false;
        }

        // 确保文件的目录存在
        const fileDir = path.dirname(filePath);
        await fs.mkdir(fileDir, { recursive: true });

        // 根据文件扩展名决定如何处理内容
        if (filename.endsWith('.json')) {
            await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf8');
        } else {
            // 对于非.json文件，以二进制形式写入，避免编码问题
            let dataToWrite;
            if (Buffer.isBuffer(content)) {
                // 如果内容已经是Buffer，直接使用
                dataToWrite = content;
            } else if (typeof content === 'string') {
                // 如果内容是字符串，转换为Buffer
                dataToWrite = Buffer.from(content);
            } else {
                // 其他情况，尝试转换为Buffer
                dataToWrite = Buffer.from(content);
            }
            await fs.writeFile(filePath, dataToWrite);
        }

        // 根据文件是否存在设置状态码和消息
        if (fileExists) {
            ctx.status = 200;
            ctx.body = {
                success: true,
                message: `成功更新文件: ${filename}`
            };
        } else {
            ctx.status = 201;
            ctx.body = {
                success: true,
                message: `成功创建文件: ${filename}`
            };
        }
    } catch (err) {
        sendError(ctx, 500, `处理文件时出错: ${err.message}`);
        console.error(`处理文件 ${filename} 时出错: ${err.message}`);
    }
});

/**
 * DELETE /api/files/:filename
 * 删除指定文件
 * 
 * 成功响应:
 *   状态码: 200
 *   响应体: { success: true, message: string }
 *     - message: 操作结果描述，格式为"成功删除文件: [filename]"
 * 
 * 错误响应:
 *   状态码: 400
 *   响应体: { success: false, message: '缺少 filename 参数。' | '非法的文件名。' }
 *     - message: 错误描述信息
 *   
 *   状态码: 404
 *   响应体: { success: false, message: string }
 *     - message: 格式为"文件未找到: [filename]"
 *   
 *   状态码: 500
 *   响应体: { success: false, message: string }
 *     - message: 错误描述信息
 */
router.delete('/api/files/:filename(.*)', async (ctx) => {
    const { filename } = ctx.params;
    if (!filename || filename.trim() === '') {
        sendError(ctx, 400, '缺少 filename 参数。');
        return;
    }

    // 检查文件名是否包含非法字符或路径遍历攻击
    if (filename.includes('..') || (path.sep !== '/' && filename.includes('../'))) {
        sendError(ctx, 400, '非法的文件名。');
        return;
    }

    const filePath = path.join(DATA_DIR, filename);

    try {
        // 先检查文件是否存在
        await fs.access(filePath);

        // 文件存在，执行删除操作
        await fs.unlink(filePath);
        ctx.status = 200;
        ctx.body = {
            success: true,
            message: `成功删除文件: ${filename}`
        };
    } catch (err) {
        if (err.code === 'ENOENT') {
            // 文件不存在
            sendError(ctx, 404, `文件未找到: ${filename}`);
        } else {
            // 其他错误
            sendError(ctx, 500, `删除文件时出错: ${err.message}`);
            console.error(`删除文件 ${filename} 时出错: ${err.message}`);
        }
    }
});

module.exports = router;