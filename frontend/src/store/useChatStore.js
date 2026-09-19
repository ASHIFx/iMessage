import { useDispatch, useSelector } from "react-redux";
import {
  chatActions,
  getConversations,
  getMessages,
  getUsers,
  getSocket,
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
    const socket = getSocket();
    if (!socket || !userId) return;
    socket.off("newMessage");
    socket.on("newMessage", (message) => {
      // Only append if the message belongs to the active conversation
      if (String(message.senderId) === String(userId)) {
        dispatch(chatActions.appendMessage(message));
      }
    });
  },
  unsubscribeFromMessages: () => getSocket()?.off("newMessage"),

  setActiveConversationId: (id) => {
    // Find the user in both lists so selectedUser is always set
    const user = id
      ? state.chat.users.find((u) => u._id === id) ||
        state.chat.conversations.find((u) => u._id === id) ||
        null
      : null;

    dispatch(
      chatActions.setChat({
        activeConversationId: id,
        selectedUser: user,
        // Don't clear messages here — getMessages thunk clears them
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

  // Sends the current composerText — store.sendMessage handles clearing
  sendTextMessage: () => {
    const text = state.chat.composerText.trim();
    if (!text) return Promise.resolve(false);
    return dispatch(sendMessage({ text }));
  },

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
