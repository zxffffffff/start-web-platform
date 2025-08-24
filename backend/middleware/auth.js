const { findToken } = require('../services/auth-service');

/**
 * 认证中间件 - 验证请求中的token
 * 采用保护API接口的模式，只保护以/api开头的接口
 * @param {Object} options - 配置选项
 * @param {Array<string|RegExp>} options.protectedPaths - 需要保护的路径前缀或正则表达式列表
 */
function authMiddleware(options = {}) {
  const { protectedPaths = [/^\/api\//] } = options;

  return async (ctx, next) => {
    // 检查是否在需要保护的路径中
    const needsProtection = protectedPaths.some(path => {
      if (typeof path === 'string') {
        return ctx.path.startsWith(path);
      } else if (path instanceof RegExp) {
        return path.test(ctx.path);
      }
      return false;
    });

    // 如果不在需要保护的路径中，直接跳过认证
    if (!needsProtection) {
      return await next();
    }

    // 对于需要保护的API接口，检查是否是登录相关或用户状态检查接口
    if (ctx.path === '/api/login/account' ||
      ctx.path == '/api/login/outLogin' ||
      ctx.path === '/api/currentUser') {
      return await next();
    }

    // 从请求头或查询参数中获取token
    const token = ctx.headers.authorization?.replace('Bearer ', '') || ctx.query.token;

    // 如果没有token，返回401错误
    if (!token) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        error: 'Unauthorized',
        message: '缺少访问令牌'
      };
      return;
    }

    // 在测试环境中检查是否是测试token
    if (global.TEST_TOKEN && token === global.TEST_TOKEN) {
      // 将用户信息附加到上下文
      ctx.state.user = {
        username: 'test-user',
        token: global.TEST_TOKEN,
        ip: '127.0.0.1'
      };

      // token有效，继续执行后续中间件
      return await next();
    }

<<<<<<< HEAD
    // 获取客户端IP地址
    const clientIP = ctx.request.ip || ctx.request.connection.remoteAddress || 'unknown';

    // 验证token是否存在且有效（username为可选参数）
    const tokenData = findToken(token, null, null, clientIP);
=======
    // 验证token是否存在且有效
    const tokenData = findToken(token);
>>>>>>> 5de74244762d6efe98a6f8b4a2c23139b217b4ee
    if (!tokenData) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        error: 'Unauthorized',
        message: '无效的访问令牌'
      };
      return;
    }

    // 将用户信息附加到上下文
    ctx.state.user = {
      username: tokenData.username,
      token: tokenData.token,
<<<<<<< HEAD
      ip: tokenData.ip,
      type: tokenData.type
=======
      ip: tokenData.ip
>>>>>>> 5de74244762d6efe98a6f8b4a2c23139b217b4ee
    };

    // token有效，继续执行后续中间件
    await next();
  };
}

module.exports = authMiddleware;