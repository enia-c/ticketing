import request from 'supertest';
import { app } from '../../app';

it('responds with details about the current user', async () => {
    // const res1 = await request(app).post('/api/users/signup').send({email: 'test@test.com', password: 'password'}).expect(201);
    // const cookie = res1.get('Set-Cookie');

    const cookie = await signin();
    const res2 = await request(app).get('/api/users/currentuser').set('Cookie', cookie).send().expect(200);

    expect(res2.body.currentUser.email).toEqual('test@test.com');

})


it('responds with null if not authenticated', async () => {
 
    const res = await request(app).get('/api/users/currentuser').send().expect(200);

    expect(res.body.currentUser).toBeNull();

})
