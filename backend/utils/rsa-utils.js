const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 获取密钥路径
const publicKeyPath = path.join(__dirname, '../keys/public.pem');
const privateKeyPath = path.join(__dirname, '../keys/private.pem');

// 缓存密钥
let publicKey = null;
let privateKey = null;

/**
 * RSA加密解密规范:
 * 1. 密钥格式: PKCS#8
 * 2. 密钥长度: 1024位
 * 3. 密钥密码: 无密码保护
 * 4. 加密算法: RSA/ECB/PKCS1Padding (PKCS#1 v1.5 填充)
 * 5. 分段加密: 对长文本进行分段处理
 */
function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 1024,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
  return { publicKey, privateKey }
}

/**
 * 获取公钥
 * @returns {string} 公钥
 */
function getPublicKey() {
  if (!publicKey) {
    publicKey = fs.readFileSync(publicKeyPath, 'utf8');
  }
  return publicKey;
}

/**
 * 获取私钥
 * @returns {string} 私钥
 */
function getPrivateKey() {
  if (!privateKey) {
    privateKey = fs.readFileSync(privateKeyPath, 'utf8');
  }
  return privateKey;
}

/**
 * 使用公钥加密数据
 * @param {string} data - 要加密的数据
 * @returns {string} 加密后的数据(Base64编码)
 */
function encryptWithPublicKey(data) {
  const publicKey = getPublicKey();
  const buffer = Buffer.from(data, 'utf8');
  // 1024位密钥最大加密长度（PKCS#1填充）
  const MAX_CHUNK_SIZE = 117;
  let encryptedChunks = [];
  for (let offset = 0; offset < buffer.length; offset += MAX_CHUNK_SIZE) {
    const chunk = buffer.slice(offset, offset + MAX_CHUNK_SIZE);
    const encrypted = crypto.publicEncrypt({
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING
    }, chunk);
    encryptedChunks.push(encrypted);
  }
  // 拼接所有加密块为一个Buffer，再Base64编码
  return Buffer.concat(encryptedChunks).toString('base64');
}

/**
 * 使用私钥解密数据
 * @param {string} encryptedData - 加密的数据(Base64编码)
 * @returns {string} 解密后的数据
 */
function decryptWithPrivateKey(encryptedData) {
  const privateKey = getPrivateKey();
  const encryptedBuffer = Buffer.from(encryptedData, 'base64');
  // 1024位密钥每段解密长度128字节
  const CHUNK_SIZE = 128;
  let decryptedBuffers = [];
  for (let offset = 0; offset < encryptedBuffer.length; offset += CHUNK_SIZE) {
    const chunk = encryptedBuffer.slice(offset, offset + CHUNK_SIZE);
    try {
      const decrypted = crypto.privateDecrypt({
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
      }, chunk);
      decryptedBuffers.push(decrypted);
    } catch (err) {
      throw err;
    }
  }
  return Buffer.concat(decryptedBuffers).toString('utf8');
}

module.exports = {
  generateKeyPair,
  encryptWithPublicKey,
  decryptWithPrivateKey
};