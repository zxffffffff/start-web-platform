const ldap = require('ldapjs');
const { LDAP_SERVER_URI, LDAP_BASE_DN, LDAP_LOGIN_USER, LDAP_LOGIN_PASSWD } = require('../config/config');

/**
 * LDAP认证服务
 * 
 * @module ldap-service
 */

/**
 * LDAP认证函数
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise<boolean>} 认证结果
 */
async function authenticateWithLDAP(username, password) {
  // 验证输入参数是否为字符串
  if (typeof username !== 'string' || typeof password !== 'string') {
    console.error('LDAP认证失败: 用户名或密码不是字符串类型');
    return false;
  }

  // 验证输入参数是否为空
  if (username.trim() === '' || password.trim() === '') {
    console.error('LDAP认证失败: 用户名或密码为空');
    return false;
  }

  return new Promise((resolve, reject) => {
    let client;
    try {
      // 创建LDAP客户端
      client = ldap.createClient({
        url: LDAP_SERVER_URI
      });
    } catch (err) {
      console.error('LDAP客户端创建失败:', err);
      return resolve(false);
    }

    // 监听连接错误
    client.on('error', (err) => {
      console.error('LDAP连接错误:', err);
    });

    // 用户的DN
    const userDN = `cn=${username},${LDAP_BASE_DN}`;

    // 先使用管理员账户绑定，以验证用户存在
    client.bind(LDAP_LOGIN_USER, LDAP_LOGIN_PASSWD, (err) => {
      if (err) {
        console.error('LDAP管理员绑定失败:', err);
        try {
          client.unbind();
        } catch (unbindErr) {
          console.error('LDAP解绑失败:', unbindErr);
        }
        return resolve(false);
      }

      // 搜索用户
      const opts = {
        filter: `(cn=${username})`,
        scope: 'sub',
        attributes: ['dn']
      };

      client.search(LDAP_BASE_DN, opts, (err, res) => {
        if (err) {
          console.error('LDAP搜索用户失败:', err);
          try {
            client.unbind();
          } catch (unbindErr) {
            console.error('LDAP解绑失败:', unbindErr);
          }
          return resolve(false);
        }

        let userFound = false;
        res.on('searchEntry', (entry) => {
          userFound = true;
          // 添加调试信息，打印 entry 对象
          // console.log('LDAP entry object:', entry);

          // 验证 entry.objectName 是否为字符串
          if (!entry || !entry.objectName) {
            console.error('LDAP用户认证失败: 用户DN不存在或为空', { entry: entry });
            try {
              client.unbind();
            } catch (unbindErr) {
              console.error('LDAP解绑失败:', unbindErr);
            }
            return resolve(false);
          }

          // 检查 entry.objectName 是否为 DN 对象，如果是则转换为字符串
          let userDN;
          if (typeof entry.objectName === 'object' && entry.objectName.toString) {
            userDN = entry.objectName.toString();
          } else if (typeof entry.objectName === 'string') {
            userDN = entry.objectName;
          } else {
            console.error('LDAP用户认证失败: 用户DN不是有效格式', {
              objectName: entry.objectName,
              type: typeof entry.objectName
            });
            try {
              client.unbind();
            } catch (unbindErr) {
              console.error('LDAP解绑失败:', unbindErr);
            }
            return resolve(false);
          }

          // 再次验证 password 是否为字符串，防止解密后出现非字符串类型
          if (typeof password !== 'string') {
            console.error('LDAP用户认证失败: 密码不是字符串类型');
            try {
              client.unbind();
            } catch (unbindErr) {
              console.error('LDAP解绑失败:', unbindErr);
            }
            return resolve(false);
          }

          // 找到用户后，尝试用用户提供的密码进行绑定验证
          client.bind(userDN, password, (err) => {
            try {
              client.unbind();
            } catch (unbindErr) {
              console.error('LDAP解绑失败:', unbindErr);
            }
            if (err) {
              console.error('LDAP用户认证失败:', err);
              resolve(false);
            } else {
              resolve(true);
            }
          });
        });

        res.on('error', (err) => {
          console.error('LDAP搜索错误:', err);
          try {
            client.unbind();
          } catch (unbindErr) {
            console.error('LDAP解绑失败:', unbindErr);
          }
          resolve(false);
        });

        res.on('end', (result) => {
          if (!userFound) {
            try {
              client.unbind();
            } catch (unbindErr) {
              console.error('LDAP解绑失败:', unbindErr);
            }
            resolve(false);
          }
        });
      });
    });
  });
}

/**
 * 检查LDAP服务器连接状态
 * @returns {Promise<boolean>} 连接状态
 */
async function checkLDAPConnection() {
  return new Promise((resolve) => {
    let client;
    try {
      client = ldap.createClient({
        url: LDAP_SERVER_URI
      });
    } catch (err) {
      console.error('LDAP客户端创建失败:', err);
      return resolve(false);
    }

    // 监听连接错误
    client.on('error', (err) => {
      console.error('LDAP连接错误:', err);
    });

    client.bind(LDAP_LOGIN_USER, LDAP_LOGIN_PASSWD, (err) => {
      try {
        client.unbind();
      } catch (unbindErr) {
        console.error('LDAP解绑失败:', unbindErr);
      }
      if (err) {
        console.error('LDAP连接检查失败:', err);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

/**
 * 获取用户信息
 * @param {string} username - 用户名
 * @returns {Promise<Object|null>} 用户信息或null
 */
async function getUserInfo(username) {
  return new Promise((resolve) => {
    const client = ldap.createClient({
      url: LDAP_SERVER_URI
    });

    client.bind(LDAP_LOGIN_USER, LDAP_LOGIN_PASSWD, (err) => {
      if (err) {
        console.error('LDAP管理员绑定失败:', err);
        client.unbind();
        return resolve(null);
      }

      const opts = {
        filter: `(cn=${username})`,
        scope: 'sub'
      };

      client.search(LDAP_BASE_DN, opts, (err, res) => {
        if (err) {
          console.error('LDAP搜索用户失败:', err);
          client.unbind();
          return resolve(null);
        }

        let userInfo = null;
        res.on('searchEntry', (entry) => {
          userInfo = entry.object;
        });

        res.on('error', (err) => {
          console.error('LDAP搜索错误:', err);
          client.unbind();
          resolve(null);
        });

        res.on('end', () => {
          client.unbind();
          resolve(userInfo);
        });
      });
    });
  });
}

module.exports = {
  authenticateWithLDAP,
  checkLDAPConnection,
  getUserInfo
};