import React from 'react'
import { Redirect, Route } from 'react-router-dom';
import { Container, Loader } from 'rsuite';
import { useProfiles } from '../context/profile.context';

const PublicRoute = ({children, ...routeProps}) => {

  const { isLoading, profile} = useProfiles();

  if(isLoading && !profile){
    return <Container>
      <Loader center vertical size='md' content='Loading' speed='slow'/>;
    </Container>
  }

  if(profile && !isLoading){
      return <Redirect to='/'/>
  }

  return (
    <Route {...routeProps}>
        {children}    
    </Route>
  )
}

export default PublicRoute