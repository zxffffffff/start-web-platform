const fs = require('fs');
const path = require('path');

// 确保keys目录存在
const keysDir = path.join(__dirname, '../keys');
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
}

const { generateKeyPair } = require('../utils/rsa-utils');

// 生成RSA密钥对
const { publicKey, privateKey } = generateKeyPair();

// 保存公钥和私钥到文件
const publicKeyPath = path.join(keysDir, 'public.pem');
const privateKeyPath = path.join(keysDir, 'private.pem');

fs.writeFileSync(publicKeyPath, publicKey);
fs.writeFileSync(privateKeyPath, privateKey);

console.log('RSA密钥对生成成功！');
console.log('公钥保存在:', publicKeyPath);
console.log('私钥保存在:', privateKeyPath);
