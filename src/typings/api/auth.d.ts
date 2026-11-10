declare namespace Api {
  /**
   * namespace Auth
   *
   * backend api module: "auth" (RuoYi-Cloud-Plus)
   */
  namespace Auth {
    /** the login response of `/auth/login` */
    interface LoginToken {
      access_token: string;
      refresh_token?: string;
      expire_in?: number;
      refresh_expire_in?: number;
      client_id?: string;
      scope?: string;
      /** legacy mock token field kept for the alova demo request */
      token?: string;
      /** legacy mock refresh token field kept for the alova demo request */
      refreshToken?: string;
    }

    /** the user info of `/system/user/getInfo` */
    interface UserInfo {
      userId: string;
      userName: string;
      nickName?: string;
      avatar?: string;
      roles: string[];
      buttons: string[];
    }
  }
}
