import React from 'react'
import { Route, Redirect } from 'react-router-dom';
import { Container, Loader } from 'rsuite';
import { useProfile } from '../context/profile.context';

const PrivateRoute = ({children, ...routeProps}) => {

  const {isLoading, profile} = useProfile();

  if(isLoading && !profile){
    return <Container>
      <Loader center vertical size='md' content='Loading' speed='slow'/>;
    </Container>
  }

  if(!profile && !isLoading){
      return <Redirect to='/signin'/>
  }

  return (
    <Route {...routeProps}>
        {children}    
    </Route>
  )
}

export default PrivateRoute