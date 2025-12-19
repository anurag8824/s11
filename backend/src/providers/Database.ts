import mongoose from 'mongoose'
import bluebird from 'bluebird'

import Locals from './Locals'
import Log from '../middlewares/Log'
import { CallbackError } from 'mongoose'
import cachegoose from 'recachegoose'

export class Database {
  // Initialize your database pool
  public static init(): void {
    // const dsn = Locals.config().mongooseUrl
    // const dsn = Locals.config().mongooseUrl + `?retryWrites=false&replicaSet=myReplicaSet`

  //  const dsn = "mongodb+srv://365infayou:Jv9lwv6csl7J1Jp5@cluster365.sxln4q8.mongodb.net/infa?retryWrites=true&w=majority&appName=Cluster0"
    const dsn = "mongodb://admin:Diamond11123@72.61.19.197:27017/infa?authSource=admin&replicaSet=rs0";


    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      retryWrites: false,
      useCreateIndex: true,
    }
    ;(<any>mongoose).Promise = bluebird

    //mongoose.set('useCreateIndex', true);
    this.redisCache()
    mongoose.connect(dsn, options, (error: CallbackError) => {
      // handle the error case
      if (error) {
        Log.info('Failed to connect to the Mongo server!!')
        console.log(error)
        throw error
      } else {
        Log.info('connected to mongo server at: ' + dsn)
      }
    })
  }

  public static redisCache = () => {
    cachegoose(mongoose, {
      engine: 'redis',
      port: +process.env.REDIS_QUEUE_PORT!,
      host: process.env.REDIS_QUEUE_HOST,
    })
  }

  public static getInstance = () => {
    return mongoose.connection
  }
}

export default mongoose
