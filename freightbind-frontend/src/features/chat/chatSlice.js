import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import chatService from "../../services/chatService";
import { parseApiError } from "../../utils/helpers";

// Shipment-scoped operational chat state (Carrier Dispatcher <-> Hub
// Operator). Messages are held per open chat; realtime `chat:message` events
// are appended by the chat page hook via `realtimeMessageReceived` — the
// slice never touches the socket itself.

const initialState = {
  context: null,
  contextLoading: false,
  contextError: null,
  messages: [],
  messagesLoading: false,
  messagesError: null,
  sending: false,
  sendError: null,
};

export const fetchChatContext = createAsyncThunk(
  "chat/fetchContext",
  async (shipmentId, { rejectWithValue }) => {
    try {
      return await chatService.getChatContext(shipmentId);
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (shipmentId, { rejectWithValue }) => {
    try {
      return await chatService.listMessages(shipmentId);
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const sendChatMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ shipmentId, message }, { rejectWithValue }) => {
    try {
      return await chatService.sendMessage(shipmentId, message);
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    resetChat: (state) => {
      state.context = null;
      state.contextLoading = false;
      state.contextError = null;
      state.messages = [];
      state.messagesLoading = false;
      state.messagesError = null;
      state.sending = false;
      state.sendError = null;
    },
    clearSendError: (state) => {
      state.sendError = null;
    },
    realtimeMessageReceived: (state, action) => {
      const message = action.payload;
      if (!message || !message.id) return;
      const exists = state.messages.some((m) => m._id === message.id || m.id === message.id);
      if (!exists) {
        state.messages.push({
          _id: message.id,
          sender: message.sender,
          message: message.message,
          createdAt: message.createdAt,
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Context
      .addCase(fetchChatContext.pending, (state) => {
        state.contextLoading = true;
        state.contextError = null;
      })
      .addCase(fetchChatContext.fulfilled, (state, action) => {
        state.contextLoading = false;
        state.context = action.payload;
      })
      .addCase(fetchChatContext.rejected, (state, action) => {
        state.contextLoading = false;
        state.contextError = action.payload?.message || "Failed to load chat";
      })
      // Messages
      .addCase(fetchMessages.pending, (state) => {
        state.messagesLoading = true;
        state.messagesError = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.messages = action.payload.messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.messagesError = action.payload?.message || "Failed to load messages";
      })
      // Send
      .addCase(sendChatMessage.pending, (state) => {
        state.sending = true;
        state.sendError = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.sending = false;
        const sent = action.payload;
        const exists = state.messages.some(
          (m) => m._id === sent._id || m.id === sent._id
        );
        if (!exists) {
          state.messages.push(sent);
        }
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.sending = false;
        state.sendError = action.payload || { message: "Failed to send message" };
      });
  },
});

export const { resetChat, clearSendError, realtimeMessageReceived } = chatSlice.actions;
export default chatSlice.reducer;
