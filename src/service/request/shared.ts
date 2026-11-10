import { localStg } from '@/utils/storage';

/** Get the ruoyi access token. */
export function getAuthorization() {
  const token = localStg.get('token');
  const Authorization = token ? `Bearer ${token}` : null;

  return Authorization;
}

/** Show a backend error message, the same message is shown only once within a short time. */
export function showErrorMsg(state: { errMsgStack?: string[] }, message: string) {
  if (!state.errMsgStack?.length) {
    state.errMsgStack = [];
  }

  const isExist = state.errMsgStack.includes(message);

  if (!isExist) {
    state.errMsgStack.push(message);

    window.$message?.error(message, {
      onLeave: () => {
        state.errMsgStack = state.errMsgStack?.filter(msg => msg !== message) ?? [];

        setTimeout(() => {
          state.errMsgStack = [];
        }, 5000);
      }
    });
  }
}
