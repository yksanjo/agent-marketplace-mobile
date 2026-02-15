import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  SafeAreaView,
  StatusBar,
  ActivityIndicator
} from 'react-native';

const API_BASE = 'http://localhost:3001/api';

const categories = ['All', 'Development', 'Data', 'Creative', 'Security', 'Productivity', 'Communication'];

function AgentCard({ agent, onDeploy, isDeployed }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.agentIcon}>{agent.icon}</Text>
        <View style={styles.agentInfo}>
          <Text style={styles.agentName}>{agent.name}</Text>
          <Text style={styles.agentVendor}>{agent.vendor}</Text>
        </View>
      </View>
      
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{agent.category}</Text>
      </View>
      
      <Text style={styles.description} numberOfLines={2}>{agent.description}</Text>
      
      <View style={styles.cardFooter}>
        <View style={styles.rating}>
          <Text style={styles.stars}>{'★'.repeat(Math.floor(agent.rating))}</Text>
          <Text style={styles.ratingText}>{agent.rating}</Text>
        </View>
        <Text style={[styles.price, agent.price === 0 && styles.freePrice]}>
          {agent.price === 0 ? 'Free' : `$${agent.price}/mo`}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.deployButton, isDeployed && styles.deployedButton]}
        onPress={() => onDeploy(agent)}
        disabled={isDeployed}
      >
        <Text style={styles.deployButtonText}>
          {isDeployed ? '✓ Deployed' : 'Deploy'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  const [agents, setAgents] = useState([]);
  const [category, setCategory] = useState('All');
  const [deployedIds, setDeployedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAgents();
    fetchDeployed();
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [category, searchQuery]);

  const fetchAgents = async () => {
    try {
      const params = new URLSearchParams();
      if (category !== 'All') params.append('category', category);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`${API_BASE}/agents?${params}`);
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeployed = async () => {
    try {
      const response = await fetch(`${API_BASE}/deployed`);
      const data = await response.json();
      setDeployedIds(data.map(d => d.agentId));
    } catch (error) {
      console.error('Failed to fetch deployed:', error);
    }
  };

  const handleDeploy = async (agent) => {
    try {
      const response = await fetch(`${API_BASE}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: agent.id })
      });
      
      if (response.ok) {
        setDeployedIds([...deployedIds, agent.id]);
      }
    } catch (error) {
      console.error('Failed to deploy:', error);
    }
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryPill, category === item && styles.categoryPillActive]}
      onPress={() => setCategory(item)}
    >
      <Text style={[styles.categoryPillText, category === item && styles.categoryPillTextActive]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤖 AgentHub</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search agents..."
          placeholderTextColor="#8888a0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={categories}
          renderItem={renderCategory}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00d4aa" />
        </View>
      ) : (
        <FlatList
          data={agents}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <AgentCard
              agent={item}
              onDeploy={handleDeploy}
              isDeployed={deployedIds.includes(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    padding: 16,
    backgroundColor: '#12121a',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f0f0f5',
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 12,
    color: '#f0f0f5',
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  categoriesContainer: {
    backgroundColor: '#12121a',
    paddingVertical: 12,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2a2a3e',
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: 'linear-gradient(135deg, #00d4aa 0%, #7c3aed 100%)',
    borderColor: '#00d4aa',
  },
  categoryPillText: {
    color: '#8888a0',
    fontWeight: '500',
  },
  categoryPillTextActive: {
    color: '#00d4aa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  agentIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f0f0f5',
  },
  agentVendor: {
    fontSize: 14,
    color: '#8888a0',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    marginBottom: 12,
  },
  categoryText: {
    color: '#7c3aed',
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#8888a0',
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    color: '#fbbf24',
    marginRight: 4,
  },
  ratingText: {
    color: '#f0f0f5',
    fontWeight: '600',
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f0f0f5',
  },
  freePrice: {
    color: '#22c55e',
  },
  deployButton: {
    backgroundColor: '#00d4aa',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  deployedButton: {
    backgroundColor: '#2a2a3e',
  },
  deployButtonText: {
    color: '#0a0a0f',
    fontWeight: '600',
    fontSize: 16,
  },
});
