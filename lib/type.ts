import { Message } from "@prisma/client";
import { GroupedReactionSchemaType } from "@/app/schemas/message";

export type MessageListItem = Message & {
  replyCount: number;
  reactions: GroupedReactionSchemaType[];
}