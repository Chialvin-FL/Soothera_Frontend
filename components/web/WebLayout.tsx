import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import Sidebar from './Sidebar';
import ProfileScreenWeb from '../../screens/web/ProfileScreen.web';
import LandingScreenWeb from '../../screens/web/LandingScreen.web';
import LoginScreenWeb from '../../screens/web/LoginScreen.web';
import UsersManagementWeb from '../../screens/web/UsersManagement.web';
import { useSessionLoader } from '../../navigation/hooks/useSessionLoader';

type Screen = 'landing' | 'login' | 'profile' | 'users-management';

export default function WebLayout() {
  const session = useSessionLoader();
  const { isLoggedIn, isLoadingSession, userRole, logout } = session;
  const [activeScreen, setActiveScreen] = useState<Screen>('landing');

  // Sync activeScreen with login status
  useEffect(() => {
    if (isLoggedIn) {
      if (userRole === 'superadmin') {
        setActiveScreen('users-management');
      } else {
        setActiveScreen('profile');
      }
    } else if (activeScreen !== 'login') {
      setActiveScreen('landing');
    }
  }, [isLoggedIn, userRole]);

  if (isLoadingSession) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4C7A6C" />
      </View>
    );
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'landing':
        return <LandingScreenWeb onAdminLogin={() => setActiveScreen('login')} />;
      case 'login':
        return (
          <LoginScreenWeb
            onLoginSuccess={() => setActiveScreen('users-management')}
            onBack={() => setActiveScreen('landing')}
            session={session}
          />
        );
      case 'users-management':
        return <UsersManagementWeb />;
      case 'profile':
        return <ProfileScreenWeb />;
      default:
        return <LandingScreenWeb onAdminLogin={() => setActiveScreen('login')} />;
    }
  };

  const showSidebar = isLoggedIn && (activeScreen === 'profile' || activeScreen === 'users-management');

  return (
    <View className="flex-1 flex-row bg-gray-50 min-h-screen">
      {/* Sidebar Navigation */}
      {showSidebar && (
        <Sidebar 
          activeScreen={activeScreen as any} 
          onNavigate={setActiveScreen} 
          onLogout={logout}
          userRole={userRole as string}
        />
      )}

      {/* Main Content Area */}
      <View className="flex-1 overflow-auto">
        {renderScreen()}
      </View>
    </View>
  );
}
