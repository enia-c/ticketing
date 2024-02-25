import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/tickets";
import mongoose from "mongoose";

it("returns a 404 if the ticket is not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${id}`).send({}).expect(404);
});

it("returns the ticket if the ticket is found", async () => {
  const cookie = signin();
  const res1 = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "abce", price: 20 });

  const res2 = await request(app)
    .get(`/api/tickets/${res1.body.id}`)
    .set("Cookie", cookie)
    .send({})
    .expect(200);

  expect(res2.body.title).toEqual("abce");
});
