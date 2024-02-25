import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';
import jwt from 'jsonwebtoken';

let mongo: MongoMemoryServer;

beforeAll(async () => {
    process.env.JWT_KEY = 'asdf';
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();
    await mongoose.connect(mongoUri, {});
});

beforeEach(async () => { 
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();
    for(const collection of collections) {
        await collection.deleteMany({});
    }
})

afterAll(async () => {
    if (mongo) {
      await mongo.stop();
    }
    await mongoose.connection.close();
});

declare global {
    var signin: (id?: string) => string[];
}
  
  
global.signin =  (id: string = new mongoose.Types.ObjectId().toHexString()) => {
    const payload = {
        id,
        email: "test@test.com"
    }
    const token =  jwt.sign(payload, process.env.JWT_KEY!);

    const session = { jwt: token };

    const sessionJSON = JSON.stringify(session);

    const base64 = Buffer.from(sessionJSON).toString('base64');
    
    return [`session=${base64}`];
}


jest.mock('../nats-wrapper');
process.env.STRIPE_KEY = 'sk_test_51OnJgGAqrtvQSfNDaxTVSIlRk0pYuSRZxmR8d5v6YZgJ5bK3XCx1mZdzE4TPLNdkDkr3NSOhDuTBAvIkzohId7Zk00PiXaqOq7';

