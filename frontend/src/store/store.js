import { configureStore, createSlice } from "@reduxjs/toolkit";
import { io } from "socket.io-client";
import { axiosInstance } from "../lib/axios.js";

// ─── Socket kept OUTSIDE Redux (non-serializable) ─────────────────────────────
let _socket = null;

export function getSocket() {
  return _socket;
}

const socketBaseUrl =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : window.location.origin);

// ─── Auth Slice ───────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState: {
    authUser: null,
    isCheckingAuth: true,
    onlineUsers: [],
    isSocketConnected: false,
    error: null,
  },
  reducers: {
    setAuthUser: (state, action) => { state.authUser = action.payload; },
    setCheckingAuth: (state, action) => { state.isCheckingAuth = action.payload; },
    setOnlineUsers: (state, action) => { state.onlineUsers = action.payload; },
    setSocketConnected: (state, action) => { state.isSocketConnected = action.payload; },
    clearAuthState: (state) => {
      Object.assign(state, {
        authUser: null,
        isCheckingAuth: false,
        onlineUsers: [],
        isSocketConnected: false,
      });
    },
  },
});

// ─── Chat Slice ───────────────────────────────────────────────────────────────
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    users: [],
    conversations: [],
    messages: [],
    selectedUser: null,
    isConversationsLoading: false,
    isUsersLoading: false,
    isMessagesLoading: false,
    activeConversationId: null,
    searchQuery: "",
    sidebarTab: "chats",
    composerText: "",
    isSoundEnabled: true,
    isSendingMedia: false,
  },
  reducers: {
    setChat: (state, action) => { Object.assign(state, action.payload); },
    appendMessage: (state, action) => { state.messages.push(action.payload); },
    clearComposer: (state) => { state.composerText = ""; },
  },
});

// ─── Store ────────────────────────────────────────────────────────────────────
export const store = configureStore({
  reducer: { auth: authSlice.reducer, chat: chatSlice.reducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ["payload.createdAt", "payload.updatedAt"],
      },
    }),
});

export const authActions = authSlice.actions;
export const chatActions = chatSlice.actions;

// ─── Socket Thunks ────────────────────────────────────────────────────────────
export const connectSocket = (user) => (dispatch) => {
  if (!user) return;
  if (_socket?.connected) return;

  _socket = io(socketBaseUrl, {
    withCredentials: true,
    query: { userId: user._id },
  });

  _socket.on("connect", () => dispatch(authActions.setSocketConnected(true)));
  _socket.on("disconnect", () => dispatch(authActions.setSocketConnected(false)));
  _socket.on("getOnlineUsers", (userIds) =>
    dispatch(authActions.setOnlineUsers(userIds)),
  );
};

export const disconnectSocket = () => (dispatch) => {
  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }
  dispatch(authActions.setSocketConnected(false));
};

// ─── Auth Thunks ─────────────────────────────────────────────────────────────
export const checkAuth = () => async (dispatch) => {
  if (!localStorage.getItem("accessToken")) {
    dispatch(authActions.clearAuthState());
    return;
  }
  dispatch(authActions.setCheckingAuth(true));
  try {
    const response = await axiosInstance.get("/auth/me");
    const user = response.data.user || response.data;
    dispatch(authActions.setAuthUser(user));
    dispatch(connectSocket(user));
  } catch {
    localStorage.removeItem("accessToken");
    dispatch(authActions.clearAuthState());
  } finally {
    dispatch(authActions.setCheckingAuth(false));
  }
};

export const clearAuth = () => (dispatch) => {
  dispatch(disconnectSocket());
  dispatch(authActions.clearAuthState());
};

export const login = (credentials) => async (dispatch) => {
  const response = await axiosInstance.post("/auth/login", credentials);
  localStorage.setItem("accessToken", response.data.accessToken);
  dispatch(authActions.setAuthUser(response.data.user));
  dispatch(connectSocket(response.data.user));
  return response.data;
};

export const logout = () => async (dispatch) => {
  try {
    await axiosInstance.post("/auth/logout");
  } catch {
    // ignore
  }
  localStorage.removeItem("accessToken");
  dispatch(clearAuth());
};

export const register = (credentials) => async (dispatch) => {
  const response = await axiosInstance.post("/auth/register", credentials);
  if (response.data.accessToken) {
    localStorage.setItem("accessToken", response.data.accessToken);
    dispatch(authActions.setAuthUser(response.data.user));
    dispatch(connectSocket(response.data.user));
  }
  return response.data;
};

// ─── Chat Thunks ──────────────────────────────────────────────────────────────
export const getUsers = () => async (dispatch) => {
  dispatch(chatActions.setChat({ isUsersLoading: true }));
  try {
    const response = await axiosInstance.get("/messages/users");
    dispatch(chatActions.setChat({ users: response.data }));
  } catch {
    // ignore
  } finally {
    dispatch(chatActions.setChat({ isUsersLoading: false }));
  }
};

export const getConversations = () => async (dispatch) => {
  dispatch(chatActions.setChat({ isConversationsLoading: true }));
  try {
    const response = await axiosInstance.get("/messages/conversations");
    dispatch(chatActions.setChat({ conversations: response.data }));
  } catch {
    // ignore
  } finally {
    dispatch(chatActions.setChat({ isConversationsLoading: false }));
  }
};

export const getMessages = (userId) => async (dispatch) => {
  if (!userId) return;
  dispatch(chatActions.setChat({ isMessagesLoading: true, messages: [] }));
  try {
    const response = await axiosInstance.get(`/messages/${userId}`);
    dispatch(chatActions.setChat({ messages: response.data }));
  } catch {
    // ignore
  } finally {
    dispatch(chatActions.setChat({ isMessagesLoading: false }));
  }
};

export const sendMessage = (payload) => async (dispatch, getState) => {
  const { activeConversationId, selectedUser } = getState().chat;
  const userId = selectedUser?._id || activeConversationId;
  if (!userId) return false;

  const isMedia = typeof FormData !== "undefined" && payload instanceof FormData;
  if (isMedia) dispatch(chatActions.setChat({ isSendingMedia: true }));

  try {
    const response = await axiosInstance.post(`/messages/send/${userId}`, payload);
    dispatch(chatActions.appendMessage(response.data));
    dispatch(chatActions.clearComposer());
    dispatch(getConversations());
    return true;
  } catch (err) {
    console.error("sendMessage failed:", err?.response?.data?.message || err.message);
    return false;
  } finally {
    if (isMedia) dispatch(chatActions.setChat({ isSendingMedia: false }));
  }
};

export default store;
