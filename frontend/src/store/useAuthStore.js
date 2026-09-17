import { useDispatch, useSelector } from "react-redux";
import {
  checkAuth,
  clearAuth,
  connectSocket,
  login,
  logout,
  register,
  store,
} from "./store.js";

const facade = (state, dispatch) => ({
  ...state.auth,
  checkAuth: () => dispatch(checkAuth()),
  clearAuth: () => dispatch(clearAuth()),
  connectSocket: (user) => dispatch(connectSocket(user)),
  login: (credentials) => dispatch(login(credentials)),
  register: (credentials) => dispatch(register(credentials)),
  logout: () => dispatch(logout()),
});
export const useAuthStore = (selector = (state) => state) =>
  selector(
    facade(
      useSelector((state) => state),
      useDispatch(),
    ),
  );
useAuthStore.getState = () => facade(store.getState(), store.dispatch);
