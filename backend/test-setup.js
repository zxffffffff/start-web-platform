const path = require('path');
const fs = require('fs').promises;
const os = require('os');

// 在测试运行前设置环境变量
const TEST_DATA_DIR = path.join(__dirname, '../data-unittest/' + Date.now());
process.env.DATA_DIR = TEST_DATA_DIR;

// 将测试目录信息写入全局变量供测试使用
global.TEST_DATA_DIR = TEST_DATA_DIR;

// 测试环境设置
process.env.NODE_ENV = 'test';

// 生成测试token
global.TEST_TOKEN = 'test-token-' + Date.now();

// 调试输出，确认环境变量和 config 读取的 DATA_DIR 是否一致
// eslint-disable-next-line no-console
console.log('[调试] process.env.DATA_DIR:', process.env.DATA_DIR);
// eslint-disable-next-line no-console
console.log('[调试] require(./config/config).DATA_DIR:', require('./config/config').DATA_DIR);

// 同步导出初始化代码供Mocha使用
(async function setupTestData() {
  // 创建临时测试数据目录
  await fs.mkdir(TEST_DATA_DIR, { recursive: true });

  // 创建空的 datas.json 文件用于数据接口测试
  const datasFile = path.join(TEST_DATA_DIR, 'datas.json');
  await fs.writeFile(datasFile, '{}', 'utf8');
})();