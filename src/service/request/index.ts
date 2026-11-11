import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { BACKEND_ERROR_CODE, createFlatRequest, createRequest } from '@sa/axios';
import { useAuthStore } from '@/store/modules/auth';
import { getToken } from '@/store/modules/auth/shared';
import { getServiceBaseURL } from '@/utils/service';
import { tansParams } from '@/utils/ruoyi';
import { encrypt } from '@/utils/jsencrypt';
import { encryptBase64, encryptWithAes, generateAesKey } from '@/utils/crypto';
import { showErrorMsg } from './shared';
import type { RequestInstanceState } from './type';

const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
const { baseURL, otherBaseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);

/** The ruoyi unified response body `R<T>`. */
interface RuoYiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

function parseCodes(codes?: string) {
  return (codes || '')
    .split(',')
    .map(code => code.trim())
    .filter(Boolean);
}

const successCodes = new Set([import.meta.env.VITE_SERVICE_SUCCESS_CODE, '200', '0000']);
const logoutCodes = new Set(parseCodes(import.meta.env.VITE_SERVICE_LOGOUT_CODES));
const modalLogoutCodes = new Set(parseCodes(import.meta.env.VITE_SERVICE_MODAL_LOGOUT_CODES));

function getResponseBody(response: AxiosResponse<any>): RuoYiResponse | null {
  const body = response.data as any;

  if (body && typeof body === 'object' && 'code' in body) {
    return body as RuoYiResponse;
  }

  return null;
}

/** Extract the payload of a ruoyi response; binary data is returned as-is. */
function transformResponse(response: AxiosResponse<any>) {
  const body = response.data;

  if (body && typeof body === 'object' && 'code' in body && 'data' in body) {
    return (body as RuoYiResponse).data;
  }

  return body;
}

function isBackendSuccess(response: AxiosResponse<any>) {
  const responseType = response.config?.responseType;

  if (responseType && responseType !== 'json') {
    return true;
  }

  const body = getResponseBody(response);

  if (!body) {
    return true;
  }

  return successCodes.has(String(body.code));
}

function handleLogout() {
  const authStore = useAuthStore();

  authStore.resetStore();
}

function showModalLogout(message: string) {
  window.$dialog?.error({
    title: '系统提示',
    content: message,
    positiveText: '重新登录',
    maskClosable: false,
    closeOnEsc: false,
    onPositiveClick() {
      handleLogout();
    },
    onClose() {
      handleLogout();
    }
  });
}

async function onRequest(config: InternalAxiosRequestConfig) {
  const headers = config.headers as any;
  const token = getToken();
  const isToken = headers.isToken !== false;

  if (token && isToken) {
    headers.Authorization = `Bearer ${token}`;
  }

  headers.clientid = import.meta.env.VITE_APP_CLIENT_ID;

  const isEncrypt = headers.isEncrypt === true || headers.isEncrypt === 'true';

  if (
    import.meta.env.VITE_APP_ENCRYPT === 'Y' &&
    isEncrypt &&
    (config.method === 'post' || config.method === 'put') &&
    !(config.data instanceof FormData)
  ) {
    const aesKey = generateAesKey();

    headers['encrypt-key'] = encrypt(encryptBase64(aesKey));
    config.data =
      typeof config.data === 'string'
        ? encryptWithAes(config.data, aesKey)
        : encryptWithAes(JSON.stringify(config.data ?? {}), aesKey);
  }

  // axios leaves the `[]` of bracket keys (e.g. `params[beginTime]`) unencoded which is rejected
  // by the gateway, so serialize the query string ourselves like the official plus-ui does.
  if (config.method?.toLowerCase() === 'get' && config.params) {
    const queryString = tansParams(config.params).replace(/&$/, '');

    if (queryString) {
      const baseUrl = config.url || '';
      config.url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${queryString}`;
    }

    config.params = undefined;
  }

  if (config.data instanceof FormData) {
    delete headers['Content-Type'];
  }

  // remove the custom flags so they are not sent to the backend
  delete headers.isToken;
  delete headers.isEncrypt;
  delete headers.repeatSubmit;

  return config;
}

async function onBackendFail(response: AxiosResponse<any>) {
  const body = getResponseBody(response);

  if (!body) {
    return null;
  }

  const responseCode = String(body.code);
  const message = body.msg || '请求失败';

  if (logoutCodes.has(responseCode)) {
    handleLogout();

    return null;
  }

  if (modalLogoutCodes.has(responseCode) && !request.state.errMsgStack?.includes(message)) {
    showModalLogout(message);

    return null;
  }

  // show the message in onError
  return null;
}

function onError(error: any) {
  const response = error.response as AxiosResponse<any> | undefined;
  const body = response ? getResponseBody(response) : null;
  const responseCode = body ? String(body.code) : '';
  const httpStatus = response?.status;

  if (httpStatus === 401 || logoutCodes.has(responseCode)) {
    handleLogout();

    return;
  }

  if (modalLogoutCodes.has(responseCode)) {
    showModalLogout(body?.msg || '登录状态已过期，请重新登录');

    return;
  }

  let message: string = error.message || '网络异常';

  if (body) {
    message = body.msg || message;
  }

  if (message === 'Network Error') {
    message = '后端接口连接异常';
  } else if (message.includes('timeout')) {
    message = '系统接口请求超时';
  } else if (message.includes('Request failed with status code')) {
    message = `系统接口${message.slice(-3)}异常`;
  }

  showErrorMsg(request.state, message);
}

export const request = createFlatRequest<any, any, RequestInstanceState>(
  {
    baseURL,
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    }
  },
  {
    defaultState: {
      errMsgStack: []
    } as RequestInstanceState,
    transform: transformResponse,
    isBackendSuccess,
    onRequest,
    onBackendFail,
    onError
  }
);

export default request;

/** Demo request instance used by the legacy `/function/request` page. */
export const demoRequest = createRequest(
  {
    baseURL: otherBaseURL.demo
  },
  {
    transform(response: AxiosResponse<App.Service.DemoResponse>) {
      return response.data.result;
    },
    async onRequest(config) {
      const { headers } = config;

      // set token
      const token = getToken();
      const Authorization = token ? `Bearer ${token}` : null;
      Object.assign(headers, { Authorization });

      return config;
    },
    isBackendSuccess(response) {
      return response.data.status === '200';
    },
    async onBackendFail() {
      // noop: the demo api does not need token refresh
    },
    onError(error) {
      // show backend error message
      let message = error.message;

      if (error.code === BACKEND_ERROR_CODE) {
        message = error.response?.data?.message || message;
      }

      window.$message?.error(message);
    }
  }
);
