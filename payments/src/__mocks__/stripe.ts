//it is a a mock function to build a new stripe object in test environment

export const stripe = {
    charges: {
        create: jest.fn().mockResolvedValue({})
    }
}