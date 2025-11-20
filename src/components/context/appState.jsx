import React from 'react'
import AppContext from './appContext'
import { useState } from 'react'

const AppState = (props) => {
    const [helloworld, setHelloworld] = useState("Helloworld")
    
    return (
        <AppContext.Provider value={{helloworld}}>
            {props.children}
        </AppContext.Provider>
    )
}


export default AppState