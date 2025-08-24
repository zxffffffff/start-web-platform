// 统一配置文件
const path = require('path');
const fs = require('fs');

// 目录配置 - 从环境变量获取或使用默认值
const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, '../../logs');
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');
const DATAS_DATA_DIR = process.env.DATAS_DATA_DIR || path.join(DATA_DIR, 'datas');
const SECURITY_DATA_DIR = process.env.SECURITY_DATA_DIR || path.join(DATA_DIR, 'security');

// 服务器配置
const LISTEN_IP = process.env.IP || '0.0.0.0';
const LISTEN_PORT = process.env.PORT || 3333;

// LDAP配置
const LDAP_ENABLE = process.env.LDAP_ENABLE === 'true' || false;
const LDAP_SERVER_URI = process.env.LDAP_SERVER_URI || 'ldap://192.168.0.1:389';
const LDAP_BASE_DN = process.env.LDAP_BASE_DN || 'dc=zxffffffff,dc=com';
const LDAP_LOGIN_USER = process.env.LDAP_LOGIN_USER || 'cn=zxffffffffadmin,ou=authusers,dc=zxffffffff,dc=com';
const LDAP_LOGIN_PASSWD = process.env.LDAP_LOGIN_PASSWD || 'xxxxxx';

(() => {
  // 确保必要的目录存在
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.mkdirSync(DATAS_DATA_DIR, { recursive: true });
    fs.mkdirSync(SECURITY_DATA_DIR, { recursive: true });
  } catch (err) {
    console.error(`创建目录时出错: ${err.message}`);
  }
})();

module.exports = {
  LOG_DIR,
  DATA_DIR,
  DATAS_DATA_DIR,
  SECURITY_DATA_DIR,
  LISTEN_IP,
  LISTEN_PORT,
  LDAP_ENABLE,
  LDAP_SERVER_URI,
  LDAP_BASE_DN,
  LDAP_LOGIN_USER,
  LDAP_LOGIN_PASSWD
};