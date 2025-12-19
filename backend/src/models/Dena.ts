import { model, PopulatedDoc, Schema } from 'mongoose'
import { IUser } from './User'
import { Types } from 'mongoose'

interface IDenah extends Document {
    ParentId: PopulatedDoc<IUser>
    money: Number
    ChildId:PopulatedDoc<IUser>
    Username:String
  }

  const Denah = new Schema({
     ParentId:{type: Types.ObjectId, ref: 'User'},
     money :Number,
     ChildId:{type:Types.ObjectId,ref:"User"},
     Username:String
  })
const denah = model<typeof Denah>('denah', Denah)

export { IDenah, denah }

