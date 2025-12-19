import { model, Schema } from 'mongoose'

interface IFancy {
  matchId: number
  sportId: number
  marketId: string
  fancyName: string
  active?: boolean
  gtype: string
  sr_no: number
  result?: string
  ballByBall?: string
  status?:string
}

interface IFancyModel extends Document {}

const FancySchema = new Schema<IFancy>(
  {
    matchId: { type: Number, index: true },
    sportId: { type: Number, index: true },
    marketId: { type: String, index: true },
    fancyName: { type: String, index: true },
    active: { type: Boolean, index: true },
    gtype: { type: String, index: true },
    isSuspend: { type: Boolean, index: true, default: false },
    GameStatus: { type: String, index: true },
    sr_no: { type: Number, index: true },
    result: { type: String, index: false, default: '' },
    ballByBall: { type: String, index: true },
    status:{type:String}
  },
  {
    timestamps: true,
  },
)

const Fancy = model<typeof FancySchema>('Fancy', FancySchema)

export { IFancy, Fancy, IFancyModel }
