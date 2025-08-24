const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 从统一配置文件导入配置
const { SECURITY_DATA_DIR } = require('../config/config');

// 登录令牌文件路径
const LOGIN_TOKEN_FILE = path.join(SECURITY_DATA_DIR, 'login_token.json');

// 初始化创建登录令牌文件
(async () => {
  try {
    // 确保登录令牌文件存在
    fs.accessSync(LOGIN_TOKEN_FILE);
  } catch (err) {
    // 文件不存在，创建空数组的文件
    fs.writeFileSync(LOGIN_TOKEN_FILE, JSON.stringify([], null, 2), 'utf8');
  }
})();

/**
 * 从文件加载登录令牌数据
 * @returns {Array} 令牌数据数组
 */
function loadLoginTokens() {
  try {
    const data = fs.readFileSync(LOGIN_TOKEN_FILE, 'utf8');
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
function saveLoginTokens(tokens) {
  try {
    // 确保目录存在
    const dir = path.dirname(LOGIN_TOKEN_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOGIN_TOKEN_FILE, JSON.stringify(tokens, null, 2));
  } catch (err) {
    console.error('保存登录令牌数据失败:', err);
  }
}

/**
 * 检查令牌是否存在且有效
 * @param {string} token - 要检查的令牌
 * @param {string} username - 用户名（可选）
 * @param {string} type - 登录类型（可选）
 * @param {string} ip - IP地址
 * @returns {Object|undefined} 找到的令牌数据或undefined
 */
function findToken(token, username, type, ip) {
  const tokens = loadLoginTokens();

  // 查找匹配的token
  let matchedTokens = tokens.filter(t => t.token === token && t.ip === ip);

  // 如果提供了type，则进一步筛选
  if (type) {
    matchedTokens = matchedTokens.filter(t => t.type === type);
  }

  // 如果提供了username，则进一步筛选
  if (username) {
    matchedTokens = matchedTokens.filter(t => t.username === username);
  }

  // 返回第一个匹配项或undefined
  return matchedTokens.length > 0 ? matchedTokens[0] : undefined;
}

/**
 * 添加新的登录令牌数据
 * @param {Object} tokenData - 令牌数据
 */
function addLoginToken(tokenData) {
  let tokens = loadLoginTokens();

  // 移除相同username和type的旧token
  tokens = tokens.filter(t =>
    !(t.username === tokenData.username && t.type === tokenData.type)
  );

  tokens.push(tokenData);
  saveLoginTokens(tokens);
}

/**
 * 删除登录令牌数据
 * @param {string} token - 要删除的令牌
 */
function removeLoginToken(token) {
  let tokens = loadLoginTokens();
  tokens = tokens.filter(t => t.token !== token);
  saveLoginTokens(tokens);
}

/**
 * 生成一个新的token
 * @param {string} username - 用户名
 * @param {string} type - 登录类型
 * @param {string} ip - IP地址
 * @returns {string} 生成的token
 */
function generateToken(username, type, ip) {
  // 生成UUID作为token
  const token = uuidv4();

  // 保存登录数据到文件
  addLoginToken({
    token: token,
    username: username,
    type: type,
    ip: ip
  });

  return token;
}

module.exports = {
  findToken,
  addLoginToken,
  removeLoginToken,
  generateToken
};