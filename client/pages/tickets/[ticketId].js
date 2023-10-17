import useRequest from "../../books/use-request"
import Router from "next/router"

const TicketShow = ({ticket}) => {

    const {doRequest, errors}  = useRequest({
        url: '/api/orders',
        method: 'post',
        body: {
            ticketId: ticket.id
        },
        onSuccess: (order) => Router.push('/orders/[orderId]', `/orders/${order.id}`)
    })

    return (
        <div>
            <h3>{ticket.title}</h3>
            <h4>price: {ticket.price}</h4>
            {errors}
            <button onClick={() => doRequest()} className="btn btn-primary">Purchase</button>
        </div>
    )
}

//implementing the getinitialprops of the TicketShow component
TicketShow.getInitialProps = async (context, client) => {
    const {ticketId} = context.query

    const {data} = await client.get(`/api/tickets/${ticketId}`)
    return {ticket: data}
}

export default TicketShow