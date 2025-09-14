import mongoose, { Schema, Document, Types } from 'mongoose';

export interface TransactionSplit {
  userId: string;
  amount: number;
  paid: boolean;
}

export interface TransactionDocument extends Document {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string; // could also be Date if you want
  groupId?: string;
  splits?: TransactionSplit[];
}

const TransactionSplitSchema = new Schema<TransactionSplit>(
  {
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    paid: { type: Boolean, required: true },
  },
  { _id: false } // don't create separate _id for splits
);

const TransactionSchema = new Schema<TransactionDocument>(
  {
    amount: { type: Number, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    groupId: { type: String }, // optional
    splits: { type: [TransactionSplitSchema], default: [] },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

// Virtual for mapping _id to id in TS
TransactionSchema.virtual('id').get(function (this: any) {
  return this._id.toString();
});

// Ensure virtuals are included when converting to JSON
TransactionSchema.set('toJSON', { virtuals: true });
TransactionSchema.set('toObject', { virtuals: true });

export const TransactionModel = mongoose.model<TransactionDocument>(
  'Transaction',
  TransactionSchema
);
