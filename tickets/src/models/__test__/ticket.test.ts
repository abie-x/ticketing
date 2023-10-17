import { Ticket } from "../ticket";

it('implements optimistic concurrency control', async () => {

    //create an instance of the ticket
    const ticket = Ticket.build({
        title: 'BTS concert',
        price: 99,
        userId: '123'
    })

    //save it to the database
    await ticket.save()

    //fetch the ticket twice
    const firstInstance = await Ticket.findById(ticket.id)
    const secondInstance = await Ticket.findById(ticket.id)

    //make two seperate changes to the tickets we fetched
    firstInstance!.set({price: 1999})
    secondInstance!.set({price: 5999})

    //save the first fetched ticket
    await firstInstance!.save()

    //save the second fetched ticket and save and just expect an error
    try {
        await secondInstance!.save()
    } catch(err) {
        return;
    }

    throw new Error('should not reach this point!!')

})

it('increments the version number on multiple saves', async () => {
    const ticket = Ticket.build({
        title: 'BTS concert',
        price: 500,
        userId: '1234'
    })
    await ticket.save()

    expect(ticket.version).toEqual(0)
    await ticket.save()
    expect(ticket.version).toEqual(1)
    await ticket.save()
    expect(ticket.version).toEqual(2)
})