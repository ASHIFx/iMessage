import { useDispatch, useSelector } from "react-redux";
import {
  chatActions,
  getConversations,
  getMessages,
  getUsers,
  sendMessage,
  store,
} from "./store.js";

const facade = (state, dispatch) => ({
  ...state.chat,
  getUsers: () => dispatch(getUsers()),
  getConversations: () => dispatch(getConversations()),
  getMessages: (id) => dispatch(getMessages(id)),
  sendMessage: (payload) => dispatch(sendMessage(payload)),
  subscribeToMessages: (userId) => {
    const socket = state.auth.socket;
    if (!socket || !userId) return;
    socket.off("newMessage");
    socket.on("newMessage", (message) => {
      if (String(message.senderId) === String(userId))
        dispatch(chatActions.appendMessage(message));
    });
  },
  unsubscribeFromMessages: () => state.auth.socket?.off("newMessage"),
  setActiveConversationId: (id) => {
    const user =
      state.chat.users.find((item) => item._id === id) ||
      state.chat.conversations.find((item) => item._id === id) ||
      null;
    dispatch(
      chatActions.setChat({
        activeConversationId: id,
        selectedUser: user,
        messages: id ? state.chat.messages : [],
      }),
    );
  },
  setSearchQuery: (value) =>
    dispatch(chatActions.setChat({ searchQuery: value })),
  setSidebarTab: (value) =>
    dispatch(chatActions.setChat({ sidebarTab: value })),
  setComposerText: (value) =>
    dispatch(chatActions.setChat({ composerText: value })),
  setSoundEnabled: (value) =>
    dispatch(chatActions.setChat({ isSoundEnabled: value })),
  sendTextMessage: () =>
    dispatch(sendMessage({ text: state.chat.composerText.trim() })),
  sendMediaMessage: ({ file }) => {
    const formData = new FormData();
    formData.append("media", file);
    return dispatch(sendMessage(formData));
  },
});
export const useChatStore = (selector = (state) => state) =>
  selector(
    facade(
      useSelector((state) => state),
      useDispatch(),
    ),
  );
useChatStore.getState = () => facade(store.getState(), store.dispatch);
