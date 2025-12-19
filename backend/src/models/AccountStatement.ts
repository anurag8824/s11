// import mongoose, { model, ObjectId, PopulatedDoc, Schema, Types, Model } from 'mongoose'
// import paginate from 'mongoose-paginate-v2'
// import { IUser } from './User'
// import { Double, TxnType } from './UserChip'
// import { IBet } from './Bet'

// export enum ChipsType {
//   fc = 'fc', // Freechip
//   pnl = 'pnl',
//   stm = 'stm', // settlement
// }

// interface IAccoutStatement {
//   userId: PopulatedDoc<IUser>
//   type: ChipsType
//   narration?: string
//   txnType: TxnType
//   amount: number
//   openBal: number
//   closeBal: number
//   betId?: PopulatedDoc<IBet>
//   matchId?: number
//   selectionId?: number
//   sportId?: number
//   txnId?: any
//   txnBy?: string
// }

// interface IAccoutStatementModel extends IAccoutStatement, Document {}

// const AccoutStatementSchema = new Schema(
//   {
//     userId: { type: Types.ObjectId, ref: 'User', index: true },
//     type: {
//       type: String,
//       enum: ChipsType,
//     },
//     narration: String,
//     txnType: {
//       type: String,
//       enum: TxnType,
//     },
//     amount: Number,
//     openBal: Number,
//     closeBal: Number,
//     betId: { type: Types.ObjectId, index: true },
//     matchId: { type: Number, index: true },
//     selectionId: { type: Number, index: true },
//     sportId: { type: Number, index: true },
//     txnId: { type: Types.ObjectId },
//     txnBy: { type: String, index: true },
//   },
//   {
//     toJSON: { getters: true }, //this right here
//     timestamps: true,
//   },
// )

// // AccoutStatementSchema.plugin(paginate)


// const AccoutStatement: Model<IAccoutStatementModel> = model<IAccoutStatementModel>('AccoutStatement', AccoutStatementSchema)

// // const AccountStatementNew = model<
// //   IAccoutStatementModel,
// //   mongoose.PaginateModel<IAccoutStatementModel>
// // >('acNew', AccoutStatementSchema)

// export { IAccoutStatement, AccoutStatement, IAccoutStatementModel }


// import mongoose, { Schema, Types, model, Document, Model } from 'mongoose';

// export enum ChipsType {
//   fc = 'fc', // Freechip
//   pnl = 'pnl', // Profit/Loss
//   stm = 'stm', // Settlement
// }

// interface IAccoutStatement {
//   userId: PopulatedDoc<IUser>
//   type: ChipsType
//   narration?: string
//   txnType: TxnType
//   amount: number
//   openBal: number
//   closeBal: number
//   betId?: PopulatedDoc<IBet>
//   matchId?: number
//   selectionId?: number
//   sportId?: number
//   txnId?: any
//   txnBy?: string
// }
// // Account Statement Schema
// const AccoutStatementSchema = new Schema(
//   {
//     userId: { type: Types.ObjectId, ref: 'User', index: true },  // User reference
//     betId: { type: Types.ObjectId, index: true },  // Bet ID (unique key)
//     txnId: { type: Types.ObjectId },  // Transaction ID (optional)
//     type: { type: String, enum: ChipsType },  // Transaction Type (e.g., Freechip, Profit/Loss)
//     amount: Number,
//     openBal: Number,
//     closeBal: Number,
//     narration: String,
//     matchId: { type: Number, index: true },
//     selectionId: { type: Number, index: true },
//     sportId: { type: Number, index: true },
//     txnBy: { type: String, index: true },
//   },
//   {
//     toJSON: { getters: true },
//     timestamps: true,
//   }
// );

// // Create a partial index to avoid duplicate entries for betId
// AccoutStatementSchema.index(
//   { betId: 1 ,userId:1},
//   {
//     unique: true,  // Enforce uniqueness for betId
//     partialFilterExpression: { betId: { $exists: true } }  // Only enforce uniqueness for documents where betId exists
//   }
// );

// // Model definition
// const AccoutStatement: Model<Document> = model('AccoutStatement', AccoutStatementSchema);

// // export { AccoutStatement };
// export { IAccoutStatement, AccoutStatement, IAccoutStatementModel }


// import mongoose, { Schema, Types, model, Document, Model } from 'mongoose';

// export enum ChipsType {
//   fc = 'fc',
//   pnl = 'pnl',
//   stm = 'stm',
// }

// interface IAccoutStatement {
//   userId: Types.ObjectId;
//   type: ChipsType;
//   narration?: string;
//   txnType: string;
//   amount: number;
//   openBal: number;
//   closeBal: number;
//   betId?: Types.ObjectId;
//   matchId?: number;
//   selectionId?: number;
//   sportId?: number;
//   txnId?: any;
//   txnBy?: string;
// }

// interface IAccoutStatementModel extends IAccoutStatement, Document {}

// const AccoutStatementSchema = new Schema(
//   {
//     userId: { type: Types.ObjectId, ref: 'User', index: true },
//     betId: { type: Types.ObjectId, index: true },
//     txnId: { type: Types.ObjectId },
//     type: { type: String, enum: ChipsType },
//     amount: Number,
//     openBal: Number,
//     closeBal: Number,
//     narration: String,
//     matchId: { type: Number, index: true },
//     selectionId: { type: Number, index: true },
//     sportId: { type: Number, index: true },
//     txnBy: { type: String, index: true },
//   },
//   {
//     toJSON: { getters: true },
//     timestamps: true,
//   }
// );

// // AccoutStatementSchema.index(
// //   { betId: 1, userId: 1 },
// //   {
// //     unique: true,
// //     partialFilterExpression: { betId: { $exists: true } }
// //   }
// // );

// const AccoutStatement: Model<IAccoutStatementModel> = model<IAccoutStatementModel>('AccoutStatement', AccoutStatementSchema);

// export { IAccoutStatement, IAccoutStatementModel, AccoutStatement };



import mongoose, { model, ObjectId, PopulatedDoc, Schema, Types, Model } from 'mongoose'
import paginate from 'mongoose-paginate-v2'
import { IUser } from './User'
import { Double, TxnType } from './UserChip'
import { IBet } from './Bet'

export enum ChipsType {
  fc = 'fc', // Freechip
  pnl = 'pnl',
  stm = 'stm', // settlement
}

interface IAccoutStatement {
  userId: PopulatedDoc<IUser>
  type: ChipsType
  narration?: string
  txnType: TxnType
  amount: number
  openBal: number
  closeBal: number
  betId?: PopulatedDoc<IBet>
  matchId?: number
  selectionId?: number
  sportId?: number
  txnId?: any
  txnBy?: string
}

interface IAccoutStatementModel extends IAccoutStatement, Document {}

const AccoutStatementSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', index: true },
    type: {
      type: String,
      enum: ChipsType,
    },
    narration: String,
    txnType: {
      type: String,
      enum: TxnType,
    },
    amount: Number,
    openBal: Number,
    closeBal: Number,
    betId: { type: Types.ObjectId, index: true },
    matchId: { type: Number, index: true },
    selectionId: { type: Number, index: true },
    sportId: { type: Number, index: true },
    txnId: { type: Types.ObjectId },
    txnBy: { type: String, index: true },
  },
  {
    toJSON: { getters: true }, //this right here
    timestamps: true,
  },
)

// AccoutStatementSchema.plugin(paginate)


const AccoutStatement: Model<IAccoutStatementModel> = model<IAccoutStatementModel>('AccoutStatement', AccoutStatementSchema)

// const AccountStatementNew = model<
//   IAccoutStatementModel,
//   mongoose.PaginateModel<IAccoutStatementModel>
// >('acNew', AccoutStatementSchema)


// Creating a compound partial index
AccoutStatementSchema.index(
  { UserId: 1, betId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      betId: { $exists: true, $ne: null }
    }
  }
);

export { IAccoutStatement, AccoutStatement, IAccoutStatementModel }

