const chai = require('chai');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const sinon = require('sinon');
const expect = chai.expect;
const request = require('supertest');
const app = require('../../main.js');

// 导入认证服务以生成测试token
const { generateToken } = require('../../services/auth-service');

// 导入LDAP服务以便模拟
const ldapService = require('../../services/ldap-service');

// 导入公钥用于加密
const { encryptWithPublicKey } = require('../../utils/rsa-utils');

describe('Auth API', function () {
  let testToken;
  let sandbox;

  // 测试用户凭证 (与auth.js中硬编码的用户一致)
  const testUsers = {
    admin: '123',
    zxffffffff: '123'
  };

  before(function () {
    // 生成测试token
<<<<<<< HEAD
    testToken = generateToken('admin', 'account', '127.0.0.1');
=======
    testToken = generateToken('admin', '127.0.0.1');
>>>>>>> 5de74244762d6efe98a6f8b4a2c23139b217b4ee
  });

  beforeEach(function () {
    // 创建sinon沙箱用于模拟
    sandbox = sinon.createSandbox();

    // 模拟LDAP服务，使其总是返回false，这样只会测试硬编码凭证
    sandbox.stub(ldapService, 'authenticateWithLDAP').resolves(false);
  });

  afterEach(function () {
    // 恢复所有模拟
    sandbox.restore();
  });

  describe('POST /api/login/account', function () {
    it('应该使用硬编码凭证成功登录admin用户', function (done) {
      // 使用RSA公钥加密密码
      const encryptedPassword = encryptWithPublicKey(testUsers.admin);

      request(app.callback())
        .post('/api/login/account')
        .send({
          username: 'admin',
          password: encryptedPassword,
          type: 'account'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an('object');
          expect(res.body.status).to.equal('ok');
          expect(res.body.type).to.equal('account');
          expect(res.body.currentAuthority).to.equal('admin');
          expect(res.body.token).to.be.a('string');
          done();
        });
    });

    it('应该使用硬编码凭证成功登录zxf用户', function (done) {
      // 使用RSA公钥加密密码
      const encryptedPassword = encryptWithPublicKey(testUsers.zxffffffff);

      request(app.callback())
        .post('/api/login/account')
        .send({
          username: 'zxffffffff',
          password: encryptedPassword,
          type: 'account'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an('object');
          expect(res.body.status).to.equal('ok');
          expect(res.body.type).to.equal('account');
          expect(res.body.currentAuthority).to.equal('user');
          expect(res.body.token).to.be.a('string');
          done();
        });
    });

    it('应该拒绝无效的用户名/密码', function (done) {
      // 使用RSA公钥加密密码
      const encryptedPassword = encryptWithPublicKey('invalid');

      request(app.callback())
        .post('/api/login/account')
        .send({
          username: 'invalid',
          password: encryptedPassword,
          type: 'account'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an('object');
          expect(res.body.status).to.equal('error');
          expect(res.body.type).to.equal('account');
          expect(res.body.errorCode).to.equal('401');
          expect(res.body.errorMessage).to.equal('用户名或密码错误');
          done();
        });
    });

    it('应该拒绝缺少用户名的请求', function (done) {
      // 使用RSA公钥加密密码
      const encryptedPassword = encryptWithPublicKey(testUsers.admin);

      request(app.callback())
        .post('/api/login/account')
        .send({
          password: encryptedPassword,
          type: 'account'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an('object');
          expect(res.body.status).to.equal('error');
          expect(res.body.type).to.equal('account');
          expect(res.body.errorCode).to.equal('401');
          expect(res.body.errorMessage).to.equal('用户名或密码不能为空');
          done();
        });
    });

    it('应该拒绝缺少密码的请求', function (done) {
      request(app.callback())
        .post('/api/login/account')
        .send({
          username: 'admin',
          type: 'account'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an('object');
          expect(res.body.status).to.equal('error');
          expect(res.body.type).to.equal('account');
          expect(res.body.errorCode).to.equal('401');
          expect(res.body.errorMessage).to.equal('用户名或密码不能为空');
          done();
        });
    });

    it('应该拒绝无效的加密密码', function (done) {
      request(app.callback())
        .post('/api/login/account')
        .send({
          username: 'admin',
          password: 'invalid-encrypted-password',
          type: 'account'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an('object');
          expect(res.body.status).to.equal('error');
          expect(res.body.type).to.equal('account');
          expect(res.body.errorCode).to.equal('401');
          expect(res.body.errorMessage).to.equal('密码解密失败');
          done();
        });
    });
  });

  describe('GET /api/currentUser', function () {
<<<<<<< HEAD
    let validToken;
    
    before(function () {
      // 为这个测试套件生成一个有效的token
      validToken = generateToken('admin', 'account', '::ffff:127.0.0.1');
    });
    
    it('应该返回有效的当前用户信息', function (done) {
      request(app.callback())
        .get('/api/currentUser')
        .query({ token: validToken, type: 'account' })
=======
    it('应该返回有效的当前用户信息', function (done) {
      request(app.callback())
        .get('/api/currentUser')
        .query({ token: testToken })
>>>>>>> 5de74244762d6efe98a6f8b4a2c23139b217b4ee
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an('object');
          expect(res.body.data).to.be.an('object');
          expect(res.body.data.name).to.equal('admin');
          expect(res.body.data.userid).to.equal('admin');
          expect(res.body.data.access).to.equal('admin');
          done();
        });
    });

    it('应该拒绝无效token', function (done) {
      request(app.callback())
        .get('/api/currentUser')
<<<<<<< HEAD
        .query({ token: 'invalid-token', type: 'account' })
=======
        .query({ token: 'invalid-token' })
>>>>>>> 5de74244762d6efe98a6f8b4a2c23139b217b4ee
        .expect(401)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an('object');
          expect(res.body.data).to.be.an('object');
          expect(res.body.data.isLogin).to.equal(false);
          expect(res.body.errorCode).to.equal('401');
          expect(res.body.errorMessage).to.equal('请先登录！');
          done();
        });
    });

    it('应该拒绝缺少token', function (done) {
      request(app.callback())
        .get('/api/currentUser')
<<<<<<< HEAD
        .query({ type: 'account' })
=======
>>>>>>> 5de74244762d6efe98a6f8b4a2c23139b217b4ee
        .expect(401)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an('object');
          expect(res.body.data).to.be.an('object');
          expect(res.body.data.isLogin).to.equal(false);
          expect(res.body.errorCode).to.equal('401');
          expect(res.body.errorMessage).to.equal('请先登录！');
          done();
        });
    });
<<<<<<< HEAD
    
    it('应该拒绝username不匹配', function (done) {
      // 这个测试用例不再适用，因为username已经不是必需参数
      // 但我们保留它以确保向后兼容性，只是修改期望结果
      request(app.callback())
        .get('/api/currentUser')
        .query({ token: validToken, type: 'account' })
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an('object');
          expect(res.body.data).to.be.an('object');
          expect(res.body.data.name).to.equal('admin');
          done();
        });
    });
  });

  describe('POST /api/login/outLogin', function () {
    let validToken;
    
    before(function () {
      // 为这个测试套件生成一个有效的token
      validToken = generateToken('admin', 'account', '::ffff:127.0.0.1');
    });
    
    it('应该成功登出有效token', function (done) {
      request(app.callback())
        .post('/api/login/outLogin')
        .query({ token: validToken, type: 'account' })
=======
  });

  describe('POST /api/login/outLogin', function () {
    it('应该成功登出有效token', function (done) {
      request(app.callback())
        .post('/api/login/outLogin')
        .query({ token: testToken })
>>>>>>> 5de74244762d6efe98a6f8b4a2c23139b217b4ee
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an('object');
          expect(res.body.success).to.equal(true);
          expect(res.body.data).to.be.an('object');
          done();
        });
    });

    it('应该拒绝无效token的登出请求', function (done) {
      request(app.callback())
        .post('/api/login/outLogin')
<<<<<<< HEAD
        .query({ token: 'invalid-token', type: 'account' })
=======
        .query({ token: 'invalid-token' })
>>>>>>> 5de74244762d6efe98a6f8b4a2c23139b217b4ee
        .expect(401)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an('object');
          expect(res.body.success).to.equal(false);
          expect(res.body.errorCode).to.equal('401');
          expect(res.body.errorMessage).to.equal('无效的token');
          done();
        });
    });
  });
});