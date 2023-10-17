import {useEffect} from 'react'
import useRequest from '../../books/use-request'
import Router from 'next/router'

const SignOut = () => {
    const {doRequest} = useRequest({
        url: '/api/users/signout',
        method: 'post',
        body: {},
        onSuccess: () => Router.push('/')
    })

    useEffect(() => {
        doRequest()
    }, [])

    return (
        <h2>Signing you out...</h2>
    )
}

export default SignOut