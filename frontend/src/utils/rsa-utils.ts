import JSEncrypt from 'jsencrypt';

// 硬编码的公钥，与后端保持一致
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
<<<<<<< HEAD
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDb8Lchd9M3EPTHwSukq4xUuOq8
mMogpM/rQKRQhRooiFt1/zQT1OCii1Nol489eYDNUo/ARXOjdf40jlFlBo+oL2MT
m/7PHevU+2RKQ+IQpBiCq58Wa4gtIUoyMoYAN3smeTX/8Kz8ZwG85i9MSYRb94az
oS/5NN6ZYHiojRjEOwIDAQAB
=======
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC8UWPZrgPqUvYvb/jIzX+wazQ1
qJeR/ybCc2EVe77dyAas531IDCPPzGKWpLA3kkscQSzOxxqTPM2x9i51GK0DdnER
rV2qdTRCA1pOw9TWrvdZ4PiZVsO+oMgWDA8O7+OOhO0qoz3hvRxXRYe7qjyyD60D
lGvRAI2Db+vOceNPDQIDAQAB
>>>>>>> 5de74244762d6efe98a6f8b4a2c23139b217b4ee
-----END PUBLIC KEY-----
`;

/**
 * RSA加密解密规范:
 * 1. 密钥格式: PKCS#8
 * 2. 密钥长度: 1024位
 * 3. 密钥密码: 无密码保护
 * 4. 加密算法: RSA/ECB/PKCS1Padding (PKCS#1 v1.5 填充)
 * 5. 分段加密: 对长文本进行分段处理
 */

/**
 * 使用公钥加密数据
 * @param data 要加密的数据
 * @returns 加密后的数据
 */
export function encryptWithPublicKey(data?: string): string {
  if (!data) {
    return '';
  }
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(PUBLIC_KEY);
  return encrypt.encrypt(data) as string;
}
