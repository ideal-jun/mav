import { request } from '@/service/request';
import type { UserVO } from './system/user/types';

/** 登录请求参数 */
export interface LoginData {
  username?: string;
  password?: string;
  code?: string;
  uuid?: string;
  clientId?: string;
  grantType?: string;
  rememberMe?: boolean;
  socialCode?: string;
  socialState?: string;
  source?: string;
}

/** 登录响应（后端 LoginVo） */
export interface LoginResult {
  /** 授权令牌 */
  access_token: string;
  /** 刷新令牌 */
  refresh_token?: string;
  /** access_token 有效期（秒） */
  expire_in?: number;
  /** refresh_token 有效期（秒） */
  refresh_expire_in?: number;
  /** 应用 id */
  client_id?: string;
  /** 令牌权限 */
  scope?: string;
  /** 用户 openid */
  openid?: string;
}

/** 验证码响应 */
export interface CaptchaResult {
  /** 是否开启验证码 */
  captchaEnabled: boolean;
  /** 验证码唯一标识 */
  uuid?: string;
  /** 验证码图片（base64） */
  img?: string;
}

/** 当前登录用户信息（/system/user/getInfo） */
export interface UserInfoVo {
  user: UserVO;
  roles: string[];
  permissions: string[];
}

/** pc 端固定客户端授权 id */
const clientId: string = import.meta.env.VITE_APP_CLIENT_ID;

/**
 * 登录
 *
 * @param data 登录参数
 */
export function login(data: LoginData) {
  const params: LoginData = {
    ...data,
    clientId: data.clientId || clientId,
    grantType: data.grantType || 'password'
  };
  return request<LoginResult>({
    url: '/auth/login',
    method: 'post',
    headers: {
      isToken: false,
      isEncrypt: true,
      repeatSubmit: false
    },
    data: params
  });
}

/** 注销 */
export function logout() {
  return request<null>({
    url: '/auth/logout',
    method: 'post'
  });
}

/** 获取验证码 */
export function getCodeImg() {
  return request<CaptchaResult>({
    url: '/auth/code',
    method: 'get',
    headers: {
      isToken: false
    },
    timeout: 20000
  });
}

/** 获取当前登录用户信息 */
export function getInfo() {
  return request<UserInfoVo>({
    url: '/system/user/getInfo',
    method: 'get'
  });
}
