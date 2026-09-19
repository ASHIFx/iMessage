import { useDispatch, useSelector, shallowEqual } from "react-redux";
import {
  chatActions,
  getConversations,
  getMessages,
  getUsers,
  getSocket,
  sendMessage,
  store,
} from "./store.js";

const facade = (chatState, dispatch) => ({
  ...chatState,
  getUsers: () => dispatch(getUsers()),
  getConversations: () => dispatch(getConversations()),
  getMessages: (id) => dispatch(getMessages(id)),
  sendMessage: (payload) => dispatch(sendMessage(payload)),

  subscribeToMessages: (userId) => {
    const socket = getSocket();
    if (!socket || !userId) return;
    socket.off("newMessage");
    socket.on("newMessage", (message) => {
      if (String(message.senderId) === String(userId)) {
        dispatch(chatActions.appendMessage(message));
      }
    });
  },
  unsubscribeFromMessages: () => getSocket()?.off("newMessage"),

  setActiveConversationId: (id) => {
    const user = id
      ? chatState.users.find((u) => u._id === id) ||
        chatState.conversations.find((u) => u._id === id) ||
        null
      : null;
    dispatch(
      chatActions.setChat({
        activeConversationId: id,
        selectedUser: user,
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

  sendTextMessage: () => {
    const text = chatState.composerText.trim();
    if (!text) return Promise.resolve(false);
    return dispatch(sendMessage({ text }));
  },

  sendMediaMessage: ({ file }) => {
    const formData = new FormData();
    formData.append("media", file);
    return dispatch(sendMessage(formData));
  },
});

// Use shallowEqual + subscribe to only chat slice — fixes the
// "Selector returned the root state" warning from react-redux.
export const useChatStore = (selector = (s) => s) => {
  const chatState = useSelector((s) => s.chat, shallowEqual);
  const dispatch = useDispatch();
  return selector(facade(chatState, dispatch));
};

useChatStore.getState = () =>
  facade(store.getState().chat, store.dispatch);
