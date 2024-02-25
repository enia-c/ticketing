import { Ticket } from '../tickets';

it('楽観的並行制御', async () => {
    const ticket = Ticket.build({
        title:'concert',
        price: 20,
        userId: 'alejflaea'
      });
      await ticket.save();

      const instance1 = await Ticket.findById(ticket.id);
      const instance2 = await Ticket.findById(ticket.id);
      

      instance1!.title = "concert2";
      instance2!.price = 15;

      await instance1!.save();

      try {
        await instance2!.save();
      }
      catch(err) {
        return;
      }
      throw new Error('should not reach this point');
    
})

it('バージョンインクリメント', async () => {
    const ticket = Ticket.build({
        title:'concert',
        price: 20,
        userId: 'alejflaea'
      });
      await ticket.save();

      expect(ticket.version).toEqual(0);

      await ticket.save();
      expect(ticket.version).toEqual(1);
})