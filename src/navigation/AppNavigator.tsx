import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SportSelectionScreen from '../screens/SportSelectionScreen';
import MatchSetupScreen from '../screens/MatchSetupScreen';
import PlatformSelectionScreen from '../screens/PlatformSelectionScreen';
import StreamConfigScreen from '../screens/StreamConfigScreen';
import StreamingScreen from '../screens/StreamingScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="History" component={HistoryScreen} />
                <Stack.Screen name="SportSelection" component={SportSelectionScreen} />
                <Stack.Screen name="MatchSetup" component={MatchSetupScreen} />
                <Stack.Screen name="PlatformSelection" component={PlatformSelectionScreen} />
                <Stack.Screen name="StreamConfig" component={StreamConfigScreen} />
                <Stack.Screen name="Streaming" component={StreamingScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}