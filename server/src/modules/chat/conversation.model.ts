import mongoose, {
  Schema,
  model,
  Types,
  type HydratedDocument,
  type Model,
} from "mongoose";

export interface Conversation {
  participants: [Types.ObjectId, Types.ObjectId];
  pairKey: string;
  lastMessageText: string | null;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ConversationDocument = HydratedDocument<Conversation>;

type ConversationModelType = Model<Conversation>;

const conversationSchema = new Schema<Conversation, ConversationModelType>(
  {
    participants: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      ],
      required: true,
      validate: [
        {
          validator(value: Types.ObjectId[]) {
            return value.length === 2;
          },
          message: "Conversation must have exactly 2 participants",
        },
        {
          validator(value: Types.ObjectId[]) {
            if (value.length !== 2) {
              return false;
            }

            const [firstParticipant, secondParticipant] = value;

            if (!firstParticipant || !secondParticipant) {
              return false;
            }

            return firstParticipant.toString() !== secondParticipant.toString();
          },
          message: "Conversation participants must be different users",
        },
      ],
    },
    pairKey: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    lastMessageText: {
      type: String,
      default: null,
      maxlength: 1000,
    },
    lastMessageAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

export const ConversationModel =
  (mongoose.models.Conversation as ConversationModelType | undefined) ??
  model<Conversation, ConversationModelType>("Conversation", conversationSchema);