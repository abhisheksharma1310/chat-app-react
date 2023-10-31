import React from "react";
import firebase from "firebase/app";
import { Container, Grid, Row, Col, Panel, Button, Icon, Alert } from "rsuite";
import { auth, database } from "../misc/firebase";

const SignIn = () => {
  const signInWithProvider = async (provider) => {
    try {
      const { additionalUserInfo, user } = await auth.signInWithPopup(provider);
      if (additionalUserInfo.isNewUser) {
        registerNewUser(user);
      }
      Alert.success("Signed in", 4000);
    } catch (error) {
      Alert.error(error.message, 4000);
    }
  };

  const onFacebookSignIn = () => {
    signInWithProvider(new firebase.auth.FacebookAuthProvider());
  };
  const onGoogleSignIn = () => {
    signInWithProvider(new firebase.auth.GoogleAuthProvider());
  };

  const signInAsGuest = async () => {
    try {
      await auth.signInAnonymously();
      const user = auth.currentUser;
      if (user && user.uid) {
        const newUser = {
          uid: user.uid,
          displayName: "Guest",
        };
        registerNewUser(newUser);
        Alert.success("Signed in as a guest success", 4000);
      } else {
        Alert.success("Signed in as a guest failed", 4000);
      }
    } catch (error) {
      Alert.error(error.message, 4000);
    }
  };

  const registerNewUser = async (user) => {
    try {
      await database.ref(`/profiles/${user.uid}`).set({
        name: user.displayName,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
      });
    } catch (error) {
      Alert.error(error.message, 4000);
    }
  };

  return (
    <Container>
      <Grid className="mt-page">
        <Row>
          <Col xs={24} md={12} mdOffset={6}>
            <Panel>
              <div className="text-center">
                <h2>Welcome to Chat</h2>
                <p>Progressive chat platform</p>
              </div>
              <div className="mt-3">
                <Button block color="orange" onClick={signInAsGuest}>
                  <Icon icon="user" /> Sign in as Guest
                </Button>

                <Button block color="green" onClick={onGoogleSignIn}>
                  <Icon icon="google" /> Continue with Google
                </Button>

                <Button block color="blue" onClick={onFacebookSignIn}>
                  <Icon icon="facebook" /> Continue with Facebook
                </Button>
              </div>
            </Panel>
          </Col>
        </Row>
      </Grid>
    </Container>
  );
};

export default SignIn;
