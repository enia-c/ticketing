import React, { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const OrderShow = ({order, currentUser}) => {

    const [timeLeft, setTimeLeft] = useState('');
    const { doRequest, errors } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id,
        },
        onSuccess: (payment) => Router.push('/orders')
    })
    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLeft/1000));
        }
        findTimeLeft();
        const timerId = setInterval(findTimeLeft, 1000);

        return () => {
            clearInterval(timerId);
        }
    }, []);
    
    if(timeLeft < 0) {
        return <div>Order Expried</div>
    }
    
    return (
        <div>
            Time left to pay: {timeLeft} seconds
            <StripeCheckout
                token={({id}) => doRequest({token: id})}
                stripeKey="pk_test_51OnJgGAqrtvQSfNDnmhZeVRSpa0ZFjK5JbGIiczv0b41PVmtGihMuaA1sw08eACvenWW7JZbhZwrH1AeUWlybVuW005PtSb1Xk"
                amount={order.ticket.price}
                email={currentUser.email}
            />
            {errors}
        </div>
    );

}

OrderShow.getInitialProps = async (context, client) => {
    const { orderId } = context.query;
    
    const { data } = await client.get(`/api/orders/${orderId}`);
    return { order: data};

}

export default OrderShow;