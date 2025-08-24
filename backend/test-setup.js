const path = require('path');
const fs = require('fs').promises;
const os = require('os');

// 在测试运行前设置环境变量
<<<<<<< HEAD
const TEST_DATA_DIR = path.join(__dirname, '../data-unittest/' + Date.now());
=======
const TEST_DATA_DIR = path.join(os.tmpdir(), 'hs-uitest-platform-test-' + Date.now());
>>>>>>> 5de74244762d6efe98a6f8b4a2c23139b217b4ee
process.env.DATA_DIR = TEST_DATA_DIR;

// 将测试目录信息写入全局变量供测试使用
global.TEST_DATA_DIR = TEST_DATA_DIR;

<<<<<<< HEAD
// 测试环境设置
process.env.NODE_ENV = 'test';

// 生成测试token
global.TEST_TOKEN = 'test-token-' + Date.now();

=======
>>>>>>> 5de74244762d6efe98a6f8b4a2c23139b217b4ee
// 调试输出，确认环境变量和 config 读取的 DATA_DIR 是否一致
// eslint-disable-next-line no-console
console.log('[调试] process.env.DATA_DIR:', process.env.DATA_DIR);
// eslint-disable-next-line no-console
console.log('[调试] require(./config/config).DATA_DIR:', require('./config/config').DATA_DIR);

// 同步导出初始化代码供Mocha使用
(async function setupTestData() {
<<<<<<< HEAD
  // 创建临时测试数据目录
  await fs.mkdir(TEST_DATA_DIR, { recursive: true });

  // 创建空的 datas.json 文件用于数据接口测试
  const datasFile = path.join(TEST_DATA_DIR, 'datas.json');
  await fs.writeFile(datasFile, '{}', 'utf8');
=======
  // auth认证
  const { generateToken } = require('./services/auth-service');
  global.TEST_TOKEN = generateToken('test-user', '127.0.0.1');

  // 创建临时测试数据目录
  await fs.mkdir(TEST_DATA_DIR, { recursive: true });

  // 创建测试用的嵌套子目录
  await fs.mkdir(path.join(TEST_DATA_DIR, 'subdir'), { recursive: true });
  await fs.mkdir(path.join(TEST_DATA_DIR, 'subdir', 'nested'), { recursive: true });

  // 创建各种类型的测试文件
  // JSON文件
  await fs.writeFile(
    path.join(TEST_DATA_DIR, 'test.json'),
    JSON.stringify({ name: "test", value: 123 }, null, 2)
  );

  // TXT文件
  await fs.writeFile(
    path.join(TEST_DATA_DIR, 'test.txt'),
    'This is a text file for testing'
  );

  // XML文件
  await fs.writeFile(
    path.join(TEST_DATA_DIR, 'test.xml'),
    '<?xml version="1.0" encoding="UTF-8"?><root><item>Test</item></root>'
  );

  // ZIP文件（模拟内容）
  await fs.writeFile(
    path.join(TEST_DATA_DIR, 'test.zip'),
    'PK mock zip content'
  );

  // 嵌套目录中的文件
  await fs.writeFile(
    path.join(TEST_DATA_DIR, 'subdir', 'nested-file.txt'),
    'This is a file in nested directory'
  );

  await fs.writeFile(
    path.join(TEST_DATA_DIR, 'subdir', 'nested', 'deep-file.json'),
    JSON.stringify({ deep: "nested file" }, null, 2)
  );
>>>>>>> 5de74244762d6efe98a6f8b4a2c23139b217b4ee
})();