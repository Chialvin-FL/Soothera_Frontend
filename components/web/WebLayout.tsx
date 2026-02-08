import React, { useState } from 'react';
import { View } from 'react-native';
import Sidebar from './Sidebar';
import HomeScreenWeb from '../../screens/web/HomeScreen.web';
import ExploreScreenWeb from '../../screens/web/ExploreScreen.web';
import ProfileScreenWeb from '../../screens/web/ProfileScreen.web';
import LandingScreenWeb from '../../screens/web/LandingScreen.web';

type Screen = 'landing' | 'home' | 'explore' | 'profile';

export default function WebLayout() {
  const [activeScreen, setActiveScreen] = useState<Screen>('landing');

  const renderScreen = () => {
    switch (activeScreen) {
      case 'landing':
        return <LandingScreenWeb onAdminLogin={() => setActiveScreen('home')} />;
      case 'home':
        return <HomeScreenWeb />;
      case 'explore':
        return <ExploreScreenWeb />;
      case 'profile':
        return <ProfileScreenWeb />;
      default:
        return <LandingScreenWeb onAdminLogin={() => setActiveScreen('home')} />;
    }
  };

  const showSidebar = activeScreen !== 'landing';

  return (
    <View className="flex-1 flex-row bg-gray-50 min-h-screen">
      {/* Sidebar Navigation */}
      {showSidebar && (
        <Sidebar activeScreen={activeScreen as any} onNavigate={setActiveScreen} />
      )}

      {/* Main Content Area */}
      <View className="flex-1 overflow-auto">
        {renderScreen()}
      </View>
    </View>
  );
}
