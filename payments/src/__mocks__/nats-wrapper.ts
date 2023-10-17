//these are the steps that should be undergone while we are trying to mock our test by using fake nats-wrapper. our test suits fails actually and with out using it and we cannot actually connect nats-wrapper to the test environemnt too

//step1: find the file we wanna mock (in this case nats-wrapper.ts file)
//step2: in the same directory create a folder called __mocks__
//step3: In that folder, create a file with the identical name to the file we wanna fake(in this case nats-wrapper.ts)
//step4: write a fake implementation (which we are doing in this file)
//step5: Tell Jest to use that fake file in our test environment (we give jest.mock(../nats-wrapper) in tests/setup.ts file)

export const natswrapper = {
    client: {
        //jest.fn() is a mock function we creates, that basically ensures that a particular function is called with some parameters in test environment. Here it is used to ensure that the ticket event is published
        publish: jest.fn().mockImplementation((subject: string, data: string, callback: () => void) => {
            callback()
        })
    }
}