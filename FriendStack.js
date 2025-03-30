import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import FriendsScreen from '../screens/Friends/FriendsScreen';
import FriendDetailScreen from '../screens/Friends/FriendDetailScreen';
import ChatScreen from '../screens/Friends/ChatScreen';
import ConversationDetailScreen from '../screens/Friends/ConversationDetailScreen'; 
import ConversationListScreen from '../screens/Friends/ConversationListScreen';

const Stack = createStackNavigator();

const FriendStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FriendsMain"
        component={FriendsScreen}
        options={{ title: "Bạn bè" }}
      />
      <Stack.Screen
        name="FriendDetailScreen"
        component={FriendDetailScreen}
        options={{ title: "Chi tiết bạn bè" }}
      />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{ title: "Chat" }}
      />
      <Stack.Screen 
        name="ConversationList"
        component={ConversationListScreen} 
        options={{ title: 'Hội thoại' }} 
      />
      <Stack.Screen
        name="ConversationDetailScreen"
        component={ConversationDetailScreen}
        options={({ route }) => ({ title: `Chat với ${route.params.friendName}` })}
      />
    </Stack.Navigator>
  );
};

export default FriendStack;