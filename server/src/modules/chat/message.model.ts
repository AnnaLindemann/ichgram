import mongoose, {
  Schema,
  model,
  Types,
  type HydratedDocument,
  type Model,
} from "mongoose";

export interface Message {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  text: string;
  isRead: boolean;
  isEdited: boolean;
  editedAt: Date | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageDocument = HydratedDocument<Message>;

type MessageModelType = Model<Message>;

const messageSchema = new Schema<Message, MessageModelType>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 1000,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    isEdited:{
      type: Boolean,
      default: false,   
    },
    editedAt: {
      type: Date,
      default: null,
    }, 
    isDeleted: {
      type: Boolean,
      default: false,
    },       
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, isRead: 1 });

export const MessageModel =
  (mongoose.models.Message as MessageModelType | undefined) ??
  model<Message, MessageModelType>("Message", messageSchema);