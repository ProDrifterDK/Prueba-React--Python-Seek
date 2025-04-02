import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Title, ActivityIndicator, Button } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';
import { useTaskService } from '../services/taskService';
import { APP_CONFIG } from '../utils/config';

const TaskChartScreen = () => {
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { getTaskStats, loading, error } = useTaskService();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const data = await getTaskStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching task stats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getChartData = () => {
    if (!stats) return [];

    return [
      {
        name: 'To Do',
        count: stats.statusCounts.todo,
        color: APP_CONFIG.theme.error,
        legendFontColor: '#7F7F7F',
        legendFontSize: 15,
      },
      {
        name: 'In Progress',
        count: stats.statusCounts.in_progress,
        color: APP_CONFIG.theme.info,
        legendFontColor: '#7F7F7F',
        legendFontSize: 15,
      },
      {
        name: 'Completed',
        count: stats.statusCounts.completed,
        color: APP_CONFIG.theme.success,
        legendFontColor: '#7F7F7F',
        legendFontSize: 15,
      },
    ];
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const renderPieChart = () => {
    const chartData = getChartData();
    
    // If there are no tasks, show a message
    if (stats && stats.totalTasks === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tasks available to display</Text>
        </View>
      );
    }

    // If there are tasks but all are in one status, adjust the data
    // to avoid chart rendering issues
    if (stats && stats.totalTasks > 0 && chartData.filter(item => item.count > 0).length === 1) {
      const statusWithTasks = chartData.find(item => item.count > 0);
      return (
        <View style={styles.singleStatusContainer}>
          <Text style={styles.singleStatusText}>
            All tasks ({stats.totalTasks}) are in "{statusWithTasks.name}" status
          </Text>
          <View style={[styles.colorIndicator, { backgroundColor: statusWithTasks.color }]} />
        </View>
      );
    }

    return (
      <PieChart
        data={chartData}
        width={Dimensions.get('window').width - 40}
        height={220}
        chartConfig={chartConfig}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchStats} />
      }
    >
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Task Statistics</Title>
          
          {loading && !refreshing && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={APP_CONFIG.theme.primary} />
            </View>
          )}
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Button mode="contained" onPress={fetchStats} style={styles.retryButton}>
                Retry
              </Button>
            </View>
          )}
          
          {!loading && !error && stats && (
            <>
              <View style={styles.chartContainer}>
                {renderPieChart()}
              </View>
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total Tasks</Text>
                  <Text style={styles.statValue}>{stats.totalTasks}</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>To Do</Text>
                  <Text style={[styles.statValue, { color: APP_CONFIG.theme.error }]}>
                    {stats.statusCounts.todo}
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>In Progress</Text>
                  <Text style={[styles.statValue, { color: APP_CONFIG.theme.info }]}>
                    {stats.statusCounts.in_progress}
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Completed</Text>
                  <Text style={[styles.statValue, { color: APP_CONFIG.theme.success }]}>
                    {stats.statusCounts.completed}
                  </Text>
                </View>
                
                {stats.totalTasks > 0 && (
                  <View style={styles.percentageContainer}>
                    <View style={styles.percentageItem}>
                      <Text style={styles.percentageLabel}>Completion Rate</Text>
                      <Text style={styles.percentageValue}>
                        {Math.round((stats.statusCounts.completed / stats.totalTasks) * 100)}%
                      </Text>
                    </View>
                    
                    <View style={styles.percentageItem}>
                      <Text style={styles.percentageLabel}>Progress Rate</Text>
                      <Text style={styles.percentageValue}>
                        {Math.round((stats.statusCounts.in_progress / stats.totalTasks) * 100)}%
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONFIG.theme.background,
  },
  contentContainer: {
    padding: 20,
  },
  card: {
    elevation: 4,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: APP_CONFIG.theme.primary,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    marginTop: 20,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  percentageContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  percentageItem: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  percentageLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  percentageValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: APP_CONFIG.theme.primary,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: APP_CONFIG.theme.error,
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    width: 150,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  singleStatusContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleStatusText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});

export default TaskChartScreen;