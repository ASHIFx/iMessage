import { configureStore, createSlice } from "@reduxjs/toolkit";
import { io } from "socket.io-client";
import { axiosInstance } from "../lib/axios.js";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    authUser: null,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,
    error: null,
  },
  reducers: {
    setAuthUser: (state, action) => {
      state.authUser = action.payload;
    },
    setCheckingAuth: (state, action) => {
      state.isCheckingAuth = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    clearAuthState: (state) => {
      Object.assign(state, {
        authUser: null,
        isCheckingAuth: false,
        onlineUsers: [],
        socket: null,
      });
    },
  },
});

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
    setChat: (state, action) => Object.assign(state, action.payload),
    appendMessage: (state, action) => {
      state.messages.push(action.payload);
    },
  },
});

export const store = configureStore({
  reducer: { auth: authSlice.reducer, chat: chatSlice.reducer },
});
export const authActions = authSlice.actions;
export const chatActions = chatSlice.actions;
const socketBaseUrl =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : window.location.origin;

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
    dispatch(authActions.clearAuthState());
  } finally {
    dispatch(authActions.setCheckingAuth(false));
  }
};

export const connectSocket = (user) => (dispatch, getState) => {
  if (!user || getState().auth.socket?.connected) return;
  const socket = io(socketBaseUrl, {
    withCredentials: true,
    query: { userId: user._id },
  });
  socket.on("getOnlineUsers", (userIds) =>
    dispatch(authActions.setOnlineUsers(userIds)),
  );
  dispatch(authActions.setSocket(socket));
};

export const clearAuth = () => (dispatch, getState) => {
  getState().auth.socket?.disconnect();
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
  await axiosInstance.post("/auth/logout");
  localStorage.removeItem("accessToken");
  dispatch(clearAuth());
};
export const register = (credentials) => async (dispatch) => {
  const response = await axiosInstance.post("/auth/register", credentials);
  if (response.data.accessToken) {
    localStorage.setItem("accessToken", response.data.accessToken);
    dispatch(authActions.setAuthUser(response.data.user));
  }
  return response.data;
};

export const getUsers = () => async (dispatch) => {
  dispatch(chatActions.setChat({ isUsersLoading: true }));
  try {
    const response = await axiosInstance.get("/messages/users");
    dispatch(chatActions.setChat({ users: response.data }));
  } finally {
    dispatch(chatActions.setChat({ isUsersLoading: false }));
  }
};
export const getConversations = () => async (dispatch) => {
  dispatch(chatActions.setChat({ isConversationsLoading: true }));
  try {
    const response = await axiosInstance.get("/messages/conversations");
    dispatch(chatActions.setChat({ conversations: response.data }));
  } finally {
    dispatch(chatActions.setChat({ isConversationsLoading: false }));
  }
};
export const getMessages = (userId) => async (dispatch) => {
  if (!userId) return;
  dispatch(chatActions.setChat({ isMessagesLoading: true }));
  try {
    const response = await axiosInstance.get(`/messages/${userId}`);
    dispatch(chatActions.setChat({ messages: response.data }));
  } finally {
    dispatch(chatActions.setChat({ isMessagesLoading: false }));
  }
};
export const sendMessage = (payload) => async (dispatch, getState) => {
  const userId = getState().chat.selectedUser?._id;
  if (!userId) return false;
  const response = await axiosInstance.post(
    `/messages/send/${userId}`,
    payload,
  );
  dispatch(chatActions.appendMessage(response.data));
  dispatch(getConversations());
  return true;
};

export default store;
