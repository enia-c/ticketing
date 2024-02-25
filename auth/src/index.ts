import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
    console.log('Starting up...');
    if(!process.env.JWT_KEY) {
        throw new Error("JWT_KEY must be dfined");
    }
    
    if(!process.env.MONGO_URI) {
        throw new Error("MONGO_URI must be dfined");
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
    }
    catch(err) {
        console.error(err);
    }
    
    app.listen(3000, () => {
        console.log('listening on port 3000!');
    });
}

start();
