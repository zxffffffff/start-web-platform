const path = require('path');

// 获取项目根目录的 package.json 文件
const packageJson = require('./package.json');

// 获取当前 Node.js 版本号
const nodeVersion = process.versions.node;

// 将版本号拆分成数组，方便比较
const [major, minor, patch] = nodeVersion.split('.').map(Number);

// 动态生成 node_args 数组
let nodeArgs = [];

// 检查 Node.js 版本是否在需要该参数的范围内
// 1. v18.x 系列: >= v18.19.0
// 2. v20.x 系列: >= v20.11.0
// 3. v21.x 系列: >= v21.6.1
const isV18 = major === 18 && minor >= 19;
const isV20 = major === 20 && minor >= 11;
const isV21 = major === 21 && minor >= 6 && patch >= 1;
const isNew = major > 21;

if (isV18 || isV20 || isV21 || isNew) {
  console.log(`Node.js 版本 ${nodeVersion} 已禁用 RSA PKCS#1 v1.5 格式，需手动放开`);
  nodeArgs = ["--security-revert=CVE-2023-46809"];
} else {
  console.log(`Node.js 版本 ${nodeVersion}`);
}

// 动态获取版本号
const cur_name = packageJson.name;
const cur_version = packageJson.version;
console.log(`当前程序 ${cur_name} 版本 ${cur_version}`);

module.exports = {
  apps: [{
    name: cur_name,
    version: cur_version,
    script: "main.js",
    node_args: nodeArgs,
  }]
};