import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Wallet } from 'lucide-react-native';
import { useApp } from '../store/AppContext';

export default function CalendarScreen() {
  const { selectedDate, setSelectedDate, getMonthCalendarData, ratePerPoint } = useApp();
  const [displayMonth, setDisplayMonth] = useState(() => {
    const d = new Date(selectedDate + 'T00:00:00');
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const monthData = getMonthCalendarData();

  const monthNames = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

  const changeMonth = (delta) => {
    setDisplayMonth((prev) => {
      const newMonth = prev.month + delta;
      if (newMonth > 11) return { year: prev.year + 1, month: 0 };
      if (newMonth < 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: newMonth };
    });
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const selectDate = (day) => {
    const dateStr = `${displayMonth.year}-${String(displayMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
  };

  const formatMoney = (amount) => amount.toFixed(0);

  const monthTotal = Object.values(monthData).reduce((sum, val) => sum + val, 0);

  const renderDays = () => {
    const daysInMonth = getDaysInMonth(displayMonth.year, displayMonth.month);
    const firstDay = getFirstDayOfMonth(displayMonth.year, displayMonth.month);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`e${i}`} style={styles.dayCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${displayMonth.year}-${String(displayMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTotal = monthData[dateStr] || 0;
      const isSelected = dateStr === selectedDate;
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const hasData = dayTotal > 0;

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            isSelected && styles.daySelected,
            isToday && !isSelected && styles.dayToday,
            hasData && !isSelected && styles.dayHasData,
          ]}
          onPress={() => selectDate(day)}
        >
          <Text style={[
            styles.dayNumber,
            isSelected && styles.dayNumberSelected,
            isToday && !isSelected && styles.dayNumberToday,
            hasData && !isSelected && styles.dayNumberHasData,
          ]}>
            {day}
          </Text>
          {hasData && (
            <Text style={[styles.dayAmount, isSelected && styles.dayAmountSelected]}>
              {formatMoney(dayTotal)}₽
            </Text>
          )}
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navButton}>
            <ChevronLeft size={24} color="#2563eb" />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {monthNames[displayMonth.month]} {displayMonth.year}
          </Text>
          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navButton}>
            <ChevronRight size={24} color="#2563eb" />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Wallet size={24} color="#2563eb" />
          </View>
          <View>
            <Text style={styles.summaryLabel}>Всего за месяц</Text>
            <Text style={styles.summaryAmount}>{monthTotal.toFixed(2)} ₽</Text>
          </View>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.weekDays}>
            {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map((d) => (
              <Text key={d} style={styles.weekDay}>{d}</Text>
            ))}
          </View>
          <View style={styles.daysGrid}>
            {renderDays()}
          </View>
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#2563eb' }]} />
            <Text style={styles.legendText}>Выбранный день</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#dbeafe' }]} />
            <Text style={styles.legendText}>Есть данные</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { borderWidth: 1, borderColor: '#2563eb', backgroundColor: 'transparent' }]} />
            <Text style={styles.legendText}>Сегодня</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  navButton: { padding: 8, borderRadius: 10, backgroundColor: '#ffffff' },
  monthTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  summaryCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  summaryIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  summaryLabel: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  summaryAmount: { fontSize: 24, fontWeight: '700', color: '#2563eb' },
  calendarCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  weekDays: { flexDirection: 'row', marginBottom: 8 },
  weekDay: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', color: '#9ca3af', paddingVertical: 8 },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 0.85, justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginBottom: 4 },
  dayNumber: { fontSize: 14, fontWeight: '500', color: '#374151' },
  dayAmount: { fontSize: 9, color: '#059669', fontWeight: '600', marginTop: 2 },
  daySelected: { backgroundColor: '#2563eb' },
  dayNumberSelected: { color: '#ffffff' },
  dayAmountSelected: { color: '#dbeafe' },
  dayToday: { borderWidth: 1.5, borderColor: '#2563eb' },
  dayNumberToday: { color: '#2563eb', fontWeight: '700' },
  dayHasData: { backgroundColor: '#dbeafe' },
  dayNumberHasData: { color: '#1e40af', fontWeight: '600' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12, color: '#6b7280' },
});