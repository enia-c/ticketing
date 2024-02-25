import Link from 'next/link';
import buildClient from '../api/build-client';

const LandingPage = ({currentUser, tickets}) => {

    const ticketList = tickets.map(ticket => {
        return(
            <tr key={ticket.id}>
                <td>{ticket.title}</td>
                <td>{ticket.price}</td>
                <td className="nav-item">
                    <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`} className="nav-link">
                        View
                    </Link>
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

    return currentUser ? <h1> You are signed in </h1> : <h1>You are not signed in</h1>    
}

LandingPage.getInitialProps = async (context, client, currentUser) => {
    const { data } = await client.get('/api/tickets');

    return { tickets: data };
  
}

export default LandingPage;