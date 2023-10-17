import {useEffect, useState} from 'react'
import StripeCheckout from 'react-stripe-checkout'
import useRequest from '../../books/use-request'
import Router from 'next/router'

const OrderShow = ({order, currentUser}) => {

    const [timeLeft, setTimeLeft] = useState(0)

    const {doRequest, errors} = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id
        },
        onSuccess: () => Router.push('/orders')
    })

    useEffect(() => {

        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date()
            setTimeLeft(Math.round(msLeft/1000))
        }

        findTimeLeft()
        const timerId = setInterval(findTimeLeft, 1000)

        return () => {
            clearInterval(timerId)
        }
    }, [order])

    if(timeLeft < 0) {
        return (
            <div>
                Order expired
            </div>
        )
    }

    return (
        <div>
            time left to pay {timeLeft} seconds
            <StripeCheckout 
                token={({id}) => doRequest({token: id})}
                stripeKey='pk_test_51O1MCkKoYFAYewxjw6Ixin0ZZlXHcPZcTT0jpUa0kiiiujMnytLX026cu2AVS2cChC4DKxEqGTQkuLby9Lt9dH5r00FXgudwPG'
                amount={order.ticket.price * 100}   //because we need to convert this thing in to cents
                email={currentUser.email}
            />
            {errors}
        </div>
    )
}

OrderShow.getInitialProps = async (context, client) => {
    const {orderId} = context.query

    const {data} = await client.get(`/api/orders/${orderId}`)

    return {order: data}
}

export default OrderShow