import { useDispatch, useSelector } from "react-redux";
import {
  checkAuth,
  clearAuth,
  login,
  logout,
  register,
  store,
} from "./store.js";

const facade = (authState, dispatch) => ({
  ...authState,
  checkAuth: () => dispatch(checkAuth()),
  clearAuth: () => dispatch(clearAuth()),
  login: (credentials) => dispatch(login(credentials)),
  register: (credentials) => dispatch(register(credentials)),
  logout: () => dispatch(logout()),
});

export const useAuthStore = (selector = (state) => state) =>
  selector(
    facade(
      useSelector((state) => state.auth),
      useDispatch(),
    ),
  );

useAuthStore.getState = () => facade(store.getState().auth, store.dispatch);
