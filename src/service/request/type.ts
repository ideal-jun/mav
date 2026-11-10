export interface RequestInstanceState {
  /** the request error message stack (used to avoid duplicated toasts) */
  errMsgStack: string[];
  [key: string]: unknown;
}

/** The custom flags supported by the ruoyi request config header. */
export interface RuoYiRequestHeaders {
  /** whether to attach the authorization token, defaults to true */
  isToken?: boolean;
  /** whether to encrypt the request body with AES + RSA, defaults to false */
  isEncrypt?: boolean | 'true' | 'false';
  /** whether to prevent duplicate submit, defaults to true */
  repeatSubmit?: boolean;
}
