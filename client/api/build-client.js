//this is basically a helper function that is used to create a preconfigured version of axios, when we are trying to use getInitiaalProps of the component
import axios from "axios";

const buildClient = ({req}) => {
    if(typeof window === 'undefined') {
        //we are on the server side
        return axios.create({
            baseURL: 'http://www.vyne.online/',
            headers: req.headers
        })

    } else {
        //we are on the browser side
        return axios.create({
            baseURL: '/'
        })
    }
}

export default buildClient