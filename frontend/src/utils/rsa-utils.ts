import JSEncrypt from 'jsencrypt';

// 硬编码的公钥，与后端保持一致
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDQMWsjAAsgeGB7L2D0UihrvuK/
aj3dLZU6YJ/asp9+15WwbIt0dAg4tRhYyGuUMn6E2p9gjBQhDWIpjcJcpGz9Ag8p
CLk8ri9DSXpydrWW+vAdvzIPHyRbHh7BFcySnEmyDkMDDi4HsZxW374zBBRlcb0P
zRj+SbESpVxotPgShwIDAQAB
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
