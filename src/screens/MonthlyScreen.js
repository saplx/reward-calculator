import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, FileText, Award } from 'lucide-react-native';
import { useApp } from '../store/AppContext';

export default function MonthlyScreen() {
  const { selectedDate, calculateMonthlyTotal, calculateMonthlyDetails } = useApp();
  const monthlyTotal = calculateMonthlyTotal();
  const monthlyDetails = calculateMonthlyDetails();

  const formatMonth = (dateString) => {
    const date = new Date(dateString + '-01T00:00:00');
    return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.monthHeader}>
          <Text style={styles.monthTitle}>{formatMonth(selectedDate)}</Text>
        </View>

        <View style={styles.totalCard}>
          <View style={styles.totalIcon}><TrendingUp size={28} color="#2563eb" /></View>
          <View style={styles.totalInfo}>
            <Text style={styles.totalLabel}>Всего за месяц</Text>
            <Text style={styles.totalAmount}>{monthlyTotal.toFixed(2)} ₽</Text>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Детализация по типам</Text>
          {monthlyDetails.length === 0 ? (
            <View style={styles.emptyCard}>
              <FileText size={40} color="#d1d5db" />
              <Text style={styles.emptyText}>Нет данных за этот месяц</Text>
              <Text style={styles.emptySubtext}>Внесите данные на главном экране</Text>
            </View>
          ) : (
            monthlyDetails.map((detail, index) => (
              <View key={index} style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <View style={styles.detailNameContainer}>
                    <Award size={18} color="#2563eb" />
                    <Text style={styles.detailName}>{detail.name}</Text>
                  </View>
                  <Text style={styles.detailReward}>{detail.reward.toFixed(2)} ₽</Text>
                </View>
                <View style={styles.detailStats}>
                  <View style={styles.statItem}><Text style={styles.statValue}>{detail.count}</Text><Text style={styles.statLabel}>документов</Text></View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}><Text style={styles.statValue}>{detail.points.toFixed(2)}</Text><Text style={styles.statLabel}>баллов</Text></View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}><Text style={styles.statValue}>{(detail.reward / detail.count).toFixed(2)} ₽</Text><Text style={styles.statLabel}>в среднем</Text></View>
                </View>
              </View>
            ))
          )}
        </View>

        {monthlyDetails.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Сводка</Text>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Типов документов</Text><Text style={styles.summaryValue}>{monthlyDetails.length}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Всего документов</Text><Text style={styles.summaryValue}>{monthlyDetails.reduce((sum, d) => sum + d.count, 0)}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Всего баллов</Text><Text style={styles.summaryValue}>{monthlyDetails.reduce((sum, d) => sum + d.points, 0).toFixed(2)}</Text></View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  monthHeader: { marginBottom: 16 },
  monthTitle: { fontSize: 24, fontWeight: '700', color: '#111827', textTransform: 'capitalize' },
  totalCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 24, flexDirection: 'row', alignItems: 'center', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  totalIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  totalInfo: { flex: 1 },
  totalLabel: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  totalAmount: { fontSize: 32, fontWeight: '700', color: '#2563eb' },
  detailsSection: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#6b7280', marginTop: 12, marginBottom: 4 },
  emptySubtext: { fontSize: 14, color: '#9ca3af' },
  detailCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  detailNameContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailName: { fontSize: 17, fontWeight: '600', color: '#111827' },
  detailReward: { fontSize: 18, fontWeight: '700', color: '#059669' },
  detailStats: { flexDirection: 'row', backgroundColor: '#f9fafb', borderRadius: 12, padding: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#9ca3af' },
  statDivider: { width: 1, backgroundColor: '#e5e7eb', marginHorizontal: 8 },
  summaryCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  summaryTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  summaryLabel: { fontSize: 14, color: '#6b7280' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
});