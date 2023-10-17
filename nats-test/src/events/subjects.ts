//what we are trying to acheive with this enum names subjects is that when ever we type in the subject name it should pull out the data properties it has attached to work on to eliminate typos

export enum Subjects {  //enums are similar to working with objects. it should have different properties that are seperated by commas
    TicketCreated = 'ticket:created',
    OrderUpdated = 'order:updated'
}