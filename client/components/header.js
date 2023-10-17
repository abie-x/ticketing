import Link from "next/link"

const Header = ({currentUser}) => {

    //simple trick if we gonna deal with a collection of li elements as header
    const links  = [
        !currentUser && {label: 'sign up', href: '/auth/signup'},
        !currentUser && {label: 'sign in', href: '/auth/signin'},
        currentUser && {label: 'sell tickets', href: '/tickets/new'},
        currentUser && {label: 'my orders', href: '/orders'},
        currentUser && {label: 'sign out', href: '/auth/signout'}
    ]   //the output of links will be [true/false/{label: ''', href: ''}, true/false/{label: ''', href: ''}, v]
        //filter the false entries
        .filter(linkConfig => linkConfig)
        .map(({label, href}) => {
            return <li key={href} className="nav-item">
                <Link className="nav-link" href={href}>
                    {label}
                </Link>
            </li>
        })
    return (
        <nav className="navbar navbar-light bg-light">
            <Link className="navbar-brand" href="/">
                GitTix
            </Link>

            <div className="d-flex justify-content-end">
                <ul className="nav d-flex align-items-center">
                    {links}
                </ul>
            </div>
        </nav>
    )
}

export default Header