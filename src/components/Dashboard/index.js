import React from 'react'
import { Button, Drawer, Divider, Alert } from 'rsuite'
import { useProfile } from '../../context/profile.context';
import { database } from '../../misc/firebase';
import EditableInput from '../EditableInput';
import AvatarUploadBtn from './AvatarUploadBtn';
import ProviderBlock from './ProviderBlock';
import { getUserUpdate } from '../../misc/helper';

const Dashboard = ({ onSignOut }) => {

  const { profile } = useProfile();

  const onSave = async (newData) => {
    //const userNickName = database.ref(`/profiles/${profile.uid}`).child('name');
    try {
      //await userNickName.set(newData);

      const updates = await getUserUpdate(profile.uid, 'name', newData, database); 
      await database.ref().update(updates);
      Alert.success('Nickname has been updated', 4000);
    } catch (error) {
      Alert.error(error.message, 4000);
    }
  }

  return (
    <> 
      <Drawer.Header>
        <Drawer.Title>
          Dashboard
        </Drawer.Title>
      </Drawer.Header>

      <Drawer.Body>
        <h3>Hey, {profile.name}</h3>
        <ProviderBlock/>
        <Divider />
        <EditableInput
          name='nickname'
          initialValue={profile.name}
          onSave={onSave}
          label={<h6 className='mb-2'>Nickname</h6>}
        />
        <AvatarUploadBtn/>
      </Drawer.Body>

      <Drawer.Footer>
        <Button block color='red' onClick={onSignOut}>
          Sign out
        </Button>
      </Drawer.Footer>
    </>
  )
}

export default Dashboard