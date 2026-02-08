import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/Text';

export default function HomeScreenWeb() {
  return (
    <ScrollView className="flex-1">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-8 py-6">
        <Text className="text-3xl font-bold text-gray-900">Dashboard</Text>
        <Text className="text-gray-600 mt-2">Welcome back to Soothera Web</Text>
      </View>

      {/* Main Content */}
      <View className="p-8">
        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-6 mb-8">
          <View className="bg-white rounded-lg shadow-sm p-6 flex-1 min-w-[250px] border border-gray-200">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-600 font-medium">Total Users</Text>
              <View className="bg-blue-100 rounded-full w-10 h-10 items-center justify-center">
                <Text className="text-blue-600 text-lg">👥</Text>
              </View>
            </View>
            <Text className="text-3xl font-bold text-gray-900">1,234</Text>
            <Text className="text-green-600 text-sm mt-2">↑ 12% from last month</Text>
          </View>

          <View className="bg-white rounded-lg shadow-sm p-6 flex-1 min-w-[250px] border border-gray-200">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-600 font-medium">Active Sessions</Text>
              <View className="bg-green-100 rounded-full w-10 h-10 items-center justify-center">
                <Text className="text-green-600 text-lg">📊</Text>
              </View>
            </View>
            <Text className="text-3xl font-bold text-gray-900">456</Text>
            <Text className="text-green-600 text-sm mt-2">↑ 8% from yesterday</Text>
          </View>

          <View className="bg-white rounded-lg shadow-sm p-6 flex-1 min-w-[250px] border border-gray-200">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-600 font-medium">Completion Rate</Text>
              <View className="bg-purple-100 rounded-full w-10 h-10 items-center justify-center">
                <Text className="text-purple-600 text-lg">✓</Text>
              </View>
            </View>
            <Text className="text-3xl font-bold text-gray-900">87%</Text>
            <Text className="text-green-600 text-sm mt-2">↑ 3% improvement</Text>
          </View>
        </View>

        {/* Recent Activity Section */}
        <View className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <Text className="text-xl font-bold text-gray-900 mb-4">Recent Activity</Text>
          <View className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <View key={item} className="flex-row items-center py-3 border-b border-gray-100">
                <View className="w-2 h-2 rounded-full bg-primary mr-4" />
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium">Activity Update {item}</Text>
                  <Text className="text-gray-500 text-sm mt-1">Just now</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="bg-gradient-to-r from-primary to-primary-700 rounded-lg p-6 shadow-sm">
          <Text className="text-white text-2xl font-bold mb-2">Quick Actions</Text>
          <Text className="text-white/90 mb-4">Access frequently used features</Text>
          <View className="flex-row gap-4">
            <View className="bg-white/20 rounded-lg px-4 py-3">
              <Text className="text-white font-medium">New Report</Text>
            </View>
            <View className="bg-white/20 rounded-lg px-4 py-3">
              <Text className="text-white font-medium">View Analytics</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
