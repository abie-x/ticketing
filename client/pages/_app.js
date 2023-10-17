import 'bootstrap/dist/css/bootstrap.css'
import buildClient from '../api/build-client'
import Header from '../components/header'

const AppComponent =  ({Component, pageProps, currentUser}) => {
    return (
        <div>
            <Header currentUser={currentUser} />
            <div className='container'>
                <Component currentUser={currentUser} {...pageProps} />
            </div>
        </div>
    )
}

//we are doing this because the elements of the header component varies depending on whether, the user is loggedin or not and also the text on the Landingpage also varies based on weather the user is loggedin or not
AppComponent.getInitialProps = async (appContext) => {
    //appContext has slightly different context compared to component context. it has appcontext = {Component, ctx: {req, res}}, whereas component context has ={req, res}
    const client  = buildClient(appContext.ctx)
    //getting the value from the api since the header component nees different values depending whether the user is signedin or not.
    const {data} = await client.get('/api/users/currentuser')
    
    //invokingg the getInitialProps of indivitual components, since the getindivitualProps of the Coponents doesnt invoke when there is getInitialProps on the app component
    let pageProps
    if(appContext.Component.getInitialProps) {  //handling the case of pages that doesnt have any getinitialProps method. currently LandingPage only has getInitialProps invoked. Other pages like signup and signin page doesnt have getInitialProps function invoked!!
        pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser)
    }
    console.log(pageProps)
    return {
        pageProps,
        ...data     //this data property contains the currentUser field that we gona restructure in the AppComponent
    }
}

export default AppComponent