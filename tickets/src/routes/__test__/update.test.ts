import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from "../../models/tickets";

const createTicket = (cookie: string[] = global.signin()) => {
  return request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "asldkf", price: 20 });
};

it("returns a 404 if the provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .post(`/api/tickets/${id}`)
    .set("Cookie", signin())
    .send({
      title: "ljelajfaljal",
      price: -10,
    })
    .expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const res = await createTicket();
  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .send({
      title: "ljelajfaljal",
      price: 10,
    })
    .expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
  const res = await createTicket();

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title: "ljelajfaljal",
      price: 100,
    })
    .expect(401);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  const cookie = global.signin();
  const res = await createTicket(cookie);

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: -10,
    })
    .expect(400);
});

it("updates the ticket provided valid inputs", async () => {
  const cookie = global.signin();
  const postRes = await createTicket(cookie);

  const putRes = await request(app)
    .put(`/api/tickets/${postRes.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "abcdefg",
      price: 1000,
    })
    .expect(200);

    const getRes = await request(app)
    .get(`/api/tickets/${postRes.body.id}`)
    .send();

    expect(getRes.body.price).toEqual(1000);


});


it('publishes an event', async () => {
  const cookie = global.signin();
  const postRes = await createTicket(cookie);

  const putRes = await request(app)
    .put(`/api/tickets/${postRes.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "abcdefg",
      price: 1000,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

});


it('予約中のチケットは編集できない', async () => {
  const cookie = global.signin();
  const postRes = await createTicket(cookie);

  const ticket = await Ticket.findById(postRes.body.id);
  ticket!.orderId = new mongoose.Types.ObjectId().toHexString();
  await ticket?.save();


  const putRes = await request(app)
    .put(`/api/tickets/${postRes.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "abcdefg",
      price: 1000,
    })
    .expect(400);

  
})