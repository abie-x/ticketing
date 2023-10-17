import Link from 'next/link'


const LandingPage = ({currentUser, tickets}) => {

    const ticketList = tickets.map(ticket => {
        return (
            <tr key={ticket.id}>
                <td>{ticket.title}</td>
                <td>{ticket.price}</td>
                <td>
                    <Link href='/tickets/[ticketId]' as={`/tickets/${ticket.id}`}>View</Link>
                </td>
            </tr>
        )
    })

    return (
        <div>
            <h1>Tickets</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                    {ticketList}
                </tbody>
            </table>
        </div>
    )
}

//this is the server side rendered code. the code underneath this will execute before the component executes, adn the data we return can be destructured in the component level;
//cookie might not be there automatically in the server side rendering request. so we need to have some mechanism to include cookie in the seerver side rendering request
LandingPage.getInitialProps = async (context, client, currentUser) => {
    //req.headers contains the host: ticketing.dev and the cookie that should be passed inorder to get the details of the current user
    //context is the initial props that getInitialProps owns
    const {data} = await client.get('/api/tickets')

    return {tickets: data}
}

export default LandingPage