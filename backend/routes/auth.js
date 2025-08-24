const Router = require('@koa/router');
<<<<<<< HEAD
=======
const { v4: uuidv4 } = require('uuid');
>>>>>>> 5de74244762d6efe98a6f8b4a2c23139b217b4ee
const fs = require('fs').promises;
const path = require('path');
const { decryptWithPrivateKey } = require('../utils/rsa-utils');
const { authenticateWithLDAP } = require('../services/ldap-service');

// 从统一配置文件导入配置
const { SECURITY_DATA_DIR, LDAP_ENABLE } = require('../config/config');

// 引入认证服务
<<<<<<< HEAD
const { findToken, addLoginToken, removeLoginToken, generateToken } = require('../services/auth-service');
=======
const { findToken, generateToken } = require('../services/auth-service');
>>>>>>> 5de74244762d6efe98a6f8b4a2c23139b217b4ee

// 创建路由实例
const router = new Router();

// 硬编码的用户凭证
const users = {
  admin: '123',
  zxffffffff: '123'
};

// 用户权限白名单配置
// adminUsers 包含具有管理员权限的用户名
const adminUsers = new Set(['admin']);
<<<<<<< HEAD
=======

// 登录令牌文件路径
const LOGIN_TOKEN_FILE = path.join(SECURITY_DATA_DIR, 'login_token.json');

// 初始化创建登录令牌文件
(async () => {
  try {
    // 确保登录令牌文件存在
    await fs.access(LOGIN_TOKEN_FILE);
  } catch (err) {
    // 文件不存在，创建空数组的文件
    await fs.writeFile(LOGIN_TOKEN_FILE, JSON.stringify([], null, 2), 'utf8');
  }
})();

/**
 * 从文件加载登录令牌数据
 * @returns {Promise<Array>} 令牌数据数组
 */
async function loadLoginTokens() {
  try {
    const data = await fs.readFile(LOGIN_TOKEN_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // 如果文件不存在或解析失败，返回空数组
    return [];
  }
}

/**
 * 保存登录令牌数据到文件
 * @param {Array} tokens - 令牌数据数组
 */
async function saveLoginTokens(tokens) {
  try {
    await fs.writeFile(LOGIN_TOKEN_FILE, JSON.stringify(tokens, null, 2));
  } catch (err) {
    console.error('保存登录令牌数据失败:', err);
  }
}

/**
 * 删除登录令牌数据
 * @param {string} token - 要删除的令牌
 */
async function removeLoginToken(token) {
  let tokens = await loadLoginTokens();
  tokens = tokens.filter(t => t.token !== token);
  await saveLoginTokens(tokens);
}

>>>>>>> 5de74244762d6efe98a6f8b4a2c23139b217b4ee
/**
 * 根据用户名获取用户权限
 * @param {string} username - 用户名
 * @returns {string} 用户权限 ('admin' 或 'user')
 */
function getUserAccess(username) {
  if (adminUsers.has(username)) {
    return 'admin';
  }
  return 'user';
}

/**
 * 登录接口 - 符合antd pro框架标准
 * 
 * 请求URL: /api/login/account
 * 请求参数: {
 *   "username": "string",
 *   "password": "string", 
 *   "autoLogin": true,
 *   "type": "account, mobile"
 * }
 * 
 * 成功响应: 200 {
 *   "status": "ok",
 *   "type": "account", 
 *   "currentAuthority": "admin, user, guest",
 *   "token": "string"
 * }
 * 
 * 失败响应: 200 {
 *   "status": "error",
 *   "type": "account"
 *   "errorCode": "401",
 *   "errorMessage": "string"
 * }
 */
router.post('/api/login/account', async (ctx) => {
  const { username, password, autoLogin, type } = ctx.request.body;

  // 验证用户名和密码是否存在
  if (!username || !password) {
    ctx.status = 200;
    ctx.body = {
      status: "error",
      type: type,
      errorCode: '401',
      errorMessage: '用户名或密码不能为空'
    };
    return;
  }

  // 解密密码（如果密码是加密的）
  let decryptedPassword = '';
  try {
    // 使用统一的RSA解密方法 (兼容JSEncrypt前端加密)
    decryptedPassword = decryptWithPrivateKey(password);
  } catch (err) {
    console.error('密码解密失败:', err);
    // 如果解密失败，返回密码解密失败，便于调试
    ctx.status = 200;
    ctx.body = {
      status: "error",
      type: type,
      errorCode: '401',
      errorMessage: '密码解密失败'
    };
    return;
  }

  // 验证解密后的密码是否为字符串
  if (typeof decryptedPassword !== 'string') {
    ctx.status = 200;
    ctx.body = {
      status: "error",
      type: type,
      errorCode: '401',
      errorMessage: '密码格式错误'
    };
    return;
  }

  // 先尝试本地认证
  let isAuthenticated = false;
  isAuthenticated = users[username] && users[username] === decryptedPassword;

  // 如果本地认证失败，尝试LDAP认证作为备用
  if (!isAuthenticated && LDAP_ENABLE) {
    try {
      isAuthenticated = await authenticateWithLDAP(username, decryptedPassword);
    } catch (err) {
      console.error('LDAP认证出错:', err);
      // LDAP认证出错，保持isAuthenticated为false
    }
  }

  // 检查用户凭证
  if (isAuthenticated) {
    // 获取客户端IP地址
    const clientIP = ctx.request.ip || ctx.request.connection.remoteAddress || 'unknown';

    // 获取用户权限
    const access = getUserAccess(username);

    // 生成token
<<<<<<< HEAD
    const token = generateToken(username, type, clientIP);

    addLoginToken({ username, token, type, ip: clientIP })
=======
    const token = generateToken(username, clientIP);
>>>>>>> 5de74244762d6efe98a6f8b4a2c23139b217b4ee

    // 登录成功
    ctx.status = 200;
    ctx.body = {
      status: 'ok',
      type: type,
      currentAuthority: access,
      token: token
    };
  } else {
    // 登录失败，用户名或密码错误
    ctx.status = 200;
    ctx.body = {
      status: "error",
      type: type,
      errorCode: '401',
      errorMessage: '用户名或密码错误'
    };
  }
});

/**
 * 检查用户登录状态接口 - 符合antd pro框架标准
 * 
 * 请求URL: /api/currentUser
 * 请求参数: token (string)
 * 
 * 成功响应: 200 {
 *   "data": {
 *     "name": "登录的username",
 *     "avatar": "头像url",
 *     "userid": "内部数据",
 *     "access": "admin, user, guest，为空代表没登录"
 *   }
 * }
 * 
 * 未登录响应: 401 {}
 */
router.get('/api/currentUser', async (ctx) => {
  const token = ctx.query.token;
<<<<<<< HEAD
  const type = ctx.query.type || 'account';
  const clientIP = ctx.request.ip || ctx.request.connection.remoteAddress || 'unknown';

  // 检查token是否存在且有效（username为可选参数）
  const tokenData = findToken(token, null, type, clientIP);
=======

  // 检查token是否存在且有效
  const tokenData = findToken(token);
>>>>>>> 5de74244762d6efe98a6f8b4a2c23139b217b4ee
  if (token && tokenData) {
    const username = tokenData.username;

    // 获取用户权限
    const access = getUserAccess(username);

    // 返回用户信息
    ctx.status = 200;
    ctx.body = {
      data: {
        name: username,
        avatar: '',
        userid: username,
        access: access
      }
    };
  } else {
    // 未登录或token无效
    ctx.status = 401;
    ctx.body = {
      data: {
        isLogin: false,
      },
      errorCode: '401',
      errorMessage: '请先登录！',
      success: true,
    };
  }
});

/**
 * 登出接口 - 符合antd pro框架标准
 * 
 * 请求URL: /api/login/outLogin
 * 请求参数: token (string)
 * 
 * 成功响应: 200 { data: {}, success: true }
 * 
 * 失败响应: 401 {
 *   "errorCode": "string",
 *   "errorMessage": "string",
 *   "success": true
 * }
 */
router.post('/api/login/outLogin', async (ctx) => {
  const token = ctx.query.token;
<<<<<<< HEAD
  const type = ctx.query.type || 'account';
  const clientIP = ctx.request.ip || ctx.request.connection.remoteAddress || 'unknown';

  // 检查token是否存在且有效（username为可选参数）
  const tokenData = findToken(token, null, type, clientIP);
=======

  // 检查token是否存在
  const tokenData = findToken(token);
>>>>>>> 5de74244762d6efe98a6f8b4a2c23139b217b4ee
  if (token && tokenData) {
    // 删除登录令牌
    await removeLoginToken(token);

    // 登出成功
    ctx.status = 200;
    ctx.body = {
      data: {},
      success: true
    };
  } else {
    // 登出失败
    ctx.status = 401;
    ctx.body = {
      errorCode: '401',
      errorMessage: '无效的token',
      success: false
    };
  }
});

// 导出路由实例
module.exports = router;