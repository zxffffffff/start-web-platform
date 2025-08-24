const Koa = require('koa');
const Router = require('@koa/router');
const { default: koaBody } = require('koa-body');
const static = require('koa-static');
const cors = require('@koa/cors');
const fs = require('fs').promises;
const path = require('path');

const app = new Koa();
const router = new Router();

// 从统一配置文件导入配置
<<<<<<< HEAD
const { LOG_DIR, LISTEN_IP, LISTEN_PORT } = require('./config/config');
=======
const { DATA_DIR, LOG_DIR, ensureDirectoriesExist, PORT, IP } = require('./config/config');
(async () => {
  // 确保必要的目录存在
  await ensureDirectoriesExist();
})();
>>>>>>> 5de74244762d6efe98a6f8b4a2c23139b217b4ee

// 配置 koa-body 中间件
app.use(koaBody({
  multipart: true, // 支持文件上传
  json: true, // 支持JSON请求体
  text: true, // 支持文本请求体
  form: true, // 支持表单请求体
  urlencoded: true, // 支持URL编码请求体
  jsonLimit: '100mb',
  textLimit: '100mb',
  formLimit: '100mb',
  enableTypes: ['json', 'form', 'text'], // 启用的类型
  formidable: {
    maxFileSize: 100 * 1024 * 1024, // 设置最大文件大小为100MB
    multiples: true // 允许多文件上传
  }
}))

// 配置 CORS 中间件 - 允许所有跨域请求
app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'], // 明确允许的HTTP方法
  allowHeaders: ['Content-Type', 'Authorization'], // 明确允许的请求头，添加Authorization
  exposeHeaders: ['Content-Type'] // 明确指定可暴露的响应头
}));

// 日志中间件
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;

  const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const timeStr = new Date().toLocaleTimeString('zh-CN', { hour12: false }); // HH:mm:ss

  const clientIP = ctx.request.ip || ctx.request.connection.remoteAddress || 'unknown';
  const cleanClientIP = clientIP.replace(/[:.]/g, '_');

  // 简洁的控制台日志
  const consoleLogMessage = `[${timeStr}] <${clientIP}> ${ctx.method} ${ctx.url} ${ms}ms`
    + ` ${ctx.status}`
    + ` ${ctx.body ? JSON.stringify(ctx.body) : 'null'}`;
  const max_len = 300;
  if (consoleLogMessage.length > max_len)
    console.log(consoleLogMessage.substring(0, max_len - 3) + '...');
  else
    console.log(consoleLogMessage);

  // 详细的文件日志
  const fileLogMessage = `[${timeStr}] <${clientIP}> ${ctx.method} ${ctx.url} ${ms}ms
Status: ${ctx.status}
Request Headers: ${JSON.stringify(ctx.request.headers, null, 2)}
Request Body: ${ctx.request.body ? JSON.stringify(ctx.request.body, null, 2) : 'null'}
Response Headers: ${JSON.stringify(ctx.response.headers, null, 2)}
Response Body: ${ctx.body ? JSON.stringify(ctx.body, null, 2) : 'null'}`;
  try {
    // 按照 ip/时间.log 的结构组织日志文件
    const logDirPath = path.join(LOG_DIR, cleanClientIP);
    const logFileName = `${dateStr}.log`;
    const logFilePath = path.join(logDirPath, logFileName);
    // 确保日志目录存在
    await fs.mkdir(logDirPath, { recursive: true });
    await fs.appendFile(logFilePath, fileLogMessage + '\n\n');
  } catch (err) {
    console.error(`写入日志文件时出错: ${err.message}`);
  }
});

// 引入认证中间件
const authMiddleware = require('./middleware/auth');

// 应用认证中间件到API路由
app.use(authMiddleware());

// 检查 dist/index.html 是否存在，如果存在则设置静态文件服务
const frontendBuildPath = path.join(__dirname, '../dist');
(async () => {
  try {
    await fs.access(path.join(frontendBuildPath, 'index.html'));
    app.use(static(frontendBuildPath));
    console.log(`Tips：已找到前端构建文件，启用静态文件服务: ${frontendBuildPath}`);
  } catch (err) {
    console.log('Tips：未找到前端构建文件，跳过静态文件服务设置');
  }
})();

// 引入认证路由
const authRouter = require('./routes/auth');
app.use(authRouter.routes()).use(authRouter.allowedMethods());

<<<<<<< HEAD
// 引入数据管理路由
const datasRouter = require('./routes/datas');
app.use(datasRouter.routes()).use(datasRouter.allowedMethods());
=======
// 引入文件路由
const filesRouter = require('./routes/files');
app.use(filesRouter.routes()).use(filesRouter.allowedMethods());
>>>>>>> 5de74244762d6efe98a6f8b4a2c23139b217b4ee

// 导出应用实例供测试使用
module.exports = app;

// 仅在直接运行此文件时启动服务器
if (require.main === module) {
  const serviceName = require('./package.json').name;
<<<<<<< HEAD
  const server = app.listen(LISTEN_PORT, LISTEN_IP, () => {
    console.log(`================================================================= `);
    console.log(`${serviceName} 服务正在运行于 http://${LISTEN_IP}:${LISTEN_PORT}`);
=======
  const server = app.listen(PORT, IP, () => {
    console.log(`================================================================= `);
    console.log(`${serviceName} 服务正在运行于 http://${IP}:${PORT}`);
>>>>>>> 5de74244762d6efe98a6f8b4a2c23139b217b4ee
    console.log(` * 认证API接口：`);
    console.log(` * - POST   /api/login/account (用户登录)`);
    console.log(` * - POST   /api/login/outLogin (用户登出)`);
    console.log(` * - GET    /api/currentUser (检查用户登录状态)`);
<<<<<<< HEAD
    console.log(` * 数据管理API接口：`);
    console.log(` * - GET    /api/datas (获取数据列表)`);
    console.log(` * - GET    /api/datas/:id (获取单个数据)`);
    console.log(` * - POST   /api/datas (创建数据)`);
    console.log(` * - PUT    /api/datas/:id (创建或更新数据)`);
    console.log(` * - PATCH  /api/datas/:id (部分更新数据)`);
    console.log(` * - DELETE /api/datas/:id (删除数据)`);
=======
    console.log(` * 文件服务API接口：`);
    console.log(` * - GET    /api/files (获取文件列表)`);
    console.log(` * - GET    /api/files/:filename (读取文件)`);
    console.log(` * - POST   /api/files/:filename (创建文件)`);
    console.log(` * - PUT    /api/files/:filename (更新文件)`);
    console.log(` * - DELETE /api/files/:filename (删除文件)`);
>>>>>>> 5de74244762d6efe98a6f8b4a2c23139b217b4ee
    console.log(`=================================================================`);
  });

  // 监听 PM2 发送的 SIGINT 信号
  process.on('SIGINT', () => {
    console.log('接收到 SIGINT 信号，优雅退出...');

    // 停止服务器接收新连接
    server.close(async (err) => {
      if (err) {
        console.error('Error closing server:', err);
        process.exit(1);
      }

      // 在这里执行其他清理工作，例如关闭数据库连接

      console.log('所有连接已关闭，优雅退出。');
      process.exit(0);
    });
  });
}