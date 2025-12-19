import { model, PopulatedDoc, Schema } from 'mongoose'
import { IUser } from './User'
import { Types } from 'mongoose'

interface ILenah extends Document {
    ParentId: PopulatedDoc<IUser>
    money: Number
    ChildId:PopulatedDoc<IUser>
    Username:String
  }

  const Lenah = new Schema({
     ParentId:{type: Types.ObjectId, ref: 'User'},
     money :Number,
     ChildId:{type:Types.ObjectId,ref:"User"},
     Username:String
  })
const lenah = model<typeof Lenah>('lenah', Lenah)

export { ILenah, lenah }