import { model, Schema } from 'mongoose'
import { IUser } from './User'

interface ISport {
  sportId: number
  typeId?: number
  icon: string
  name: string
  otherName?: string
  marketCount?: Number
}

interface ISportModel extends Document {}

const SportSchema = new Schema<IUser>(
  {
    sportId: Number,
    typeId: Number,
    icon: String,
    name: String,
    otherName: String,
    marketCount: Number,
  },
  {
    timestamps: true,
  },
)

const Sport = model<typeof SportSchema>('Sport', SportSchema)

export { ISport, Sport, ISportModel }
