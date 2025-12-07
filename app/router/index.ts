import { createChannel, getChannel, listChannels } from "./channel";
import { createMessage, listMessages, updateMessage, listThreadReplies, toggleReaction } from "./message";
import { createWorkspace, listWorkspaces } from "./workspace";
import { generateThreadSummary, generateCompose } from "./ai";
import { inviteMember, listMembers } from "./member";

export const router = {
  workspace: {
    list: listWorkspaces,
    create: createWorkspace,
    member: {
      invite: inviteMember,
      list: listMembers,
    },
  },
  channel: {
    create: createChannel,
    list: listChannels,
    get: getChannel,
  },
  message: {
    create: createMessage,
    list: listMessages,
    update: updateMessage,
    thread: {
      list: listThreadReplies,
    },
    reaction: {
      toggle: toggleReaction,
    },
  },
  ai: {
    thread: {
      summary: {
        generate: generateThreadSummary,
      },
    },
    compose: {
      generate: generateCompose,
    },
  },
};