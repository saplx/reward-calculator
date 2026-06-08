import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useApp } from '../store/AppContext';

export default function HomeScreen() {
  const {
    documentTypes,
    selectedDate,
    ratePerPoint,
    getCurrentDayData,
    updateDocumentCount,
    resetDailyData,
    setSelectedDate,
    calculateDailyTotal,
    isLoading,
  } = useApp();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const dayData = getCurrentDayData();

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const isToday = (dateString) => dateString === new Date().toISOString().split('T')[0];

  const changeDate = (days) => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleReset = () => {
    Alert.alert(
      'Подтверждение',
      `Сбросить все значения за ${formatDate(selectedDate)}?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сбросить',
          style: 'destructive',
          onPress: () => resetDailyData(),
        },
      ]
    );
  };

  const handleCountChange = (docId, value) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      updateDocumentCount(docId, value);
    }
  };

  const dailyTotal = calculateDailyTotal();

  // Calendar helpers
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const [pickerMonth, setPickerMonth] = useState(() => {
    const d = new Date(selectedDate + 'T00:00:00');
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const changePickerMonth = (delta) => {
    setPickerMonth((prev) => {
      const newMonth = prev.month + delta;
      if (newMonth > 11) return { year: prev.year + 1, month: 0 };
      if (newMonth < 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: newMonth };
    });
  };

  const selectDateFromPicker = (day) => {
    const dateStr = `${pickerMonth.year}-${String(pickerMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setShowDatePicker(false);
  };

  const monthNames = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(pickerMonth.year, pickerMonth.month);
    const firstDay = getFirstDayOfMonth(pickerMonth.year, pickerMonth.month);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDayCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${pickerMonth.year}-${String(pickerMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = dateStr === selectedDate;
      const isTodayDate = dateStr === new Date().toISOString().split('T')[0];

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDayCell,
            isSelected && styles.calendarDaySelected,
            isTodayDate && !isSelected && styles.calendarDayToday,
          ]}
          onPress={() => selectDateFromPicker(day)}
        >
          <Text
            style={[
              styles.calendarDayText,
              isSelected && styles.calendarDayTextSelected,
              isTodayDate && !isSelected && styles.calendarDayTextToday,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Date Navigation */}
          <View style={styles.dateContainer}>
            <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateButton}>
              <ChevronLeft size={24} color="#2563eb" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.dateInfo} onPress={() => {
              const d = new Date(selectedDate + 'T00:00:00');
              setPickerMonth({ year: d.getFullYear(), month: d.getMonth() });
              setShowDatePicker(true);
            }}>
              <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
              {isToday(selectedDate) && (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayText}>Сегодня</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateButton}>
              <ChevronRight size={24} color="#2563eb" />
            </TouchableOpacity>
          </View>

          {/* Document Inputs */}
          <View style={styles.inputsContainer}>
            <Text style={styles.sectionTitle}>Внесите количество документов</Text>
            {documentTypes.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  Нет типов документов. Добавьте их в настройках.
                </Text>
              </View>
            ) : (
              documentTypes.map((docType) => (
                <View key={docType.id} style={styles.inputCard}>
                  <View style={styles.inputHeader}>
                    <Text style={styles.inputLabel}>{docType.name}</Text>
                    <View style={styles.pointsBadge}>
                      <Text style={styles.pointsText}>{docType.points} балл</Text>
                    </View>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={dayData[docType.id] || ''}
                    onChangeText={(value) => handleCountChange(docType.id, value)}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    maxLength={10}
                  />
                  {dayData[docType.id] && parseFloat(dayData[docType.id]) > 0 && (
                    <Text style={styles.inputReward}>
                      = {(parseFloat(dayData[docType.id]) * docType.points * ratePerPoint).toFixed(2)} ₽
                    </Text>
                  )}
                </View>
              ))
            )}
          </View>

          {/* Daily Total */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Итого за день</Text>
            <Text style={styles.totalAmount}>{dailyTotal.toFixed(2)} ₽</Text>
            <Text style={styles.totalPoints}>
              {(dailyTotal / ratePerPoint).toFixed(2)} баллов
            </Text>
          </View>

          {/* Reset Button */}
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
            activeOpacity={0.8}
          >
            <RotateCcw size={20} color="#dc2626" />
            <Text style={styles.resetText}>Сбросить значения</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => changePickerMonth(-1)}>
                <ChevronLeft size={24} color="#2563eb" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {monthNames[pickerMonth.month]} {pickerMonth.year}
              </Text>
              <TouchableOpacity onPress={() => changePickerMonth(1)}>
                <ChevronRight size={24} color="#2563eb" />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarGrid}>
              {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map((d) => (
                <Text key={d} style={styles.calendarWeekDay}>{d}</Text>
              ))}
              {renderCalendarDays()}
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.modalCloseButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#6b7280' },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dateButton: { padding: 8, borderRadius: 8, backgroundColor: '#eff6ff' },
  dateInfo: { alignItems: 'center' },
  dateText: { fontSize: 16, fontWeight: '600', color: '#111827' },
  todayBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginTop: 4 },
  todayText: { fontSize: 11, color: '#2563eb', fontWeight: '500' },
  inputsContainer: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '500', color: '#6b7280', marginBottom: 12, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyState: { backgroundColor: '#ffffff', borderRadius: 16, padding: 24, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
  inputCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  inputHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#111827' },
  pointsBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  pointsText: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  input: { backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 18, color: '#111827', fontWeight: '500', borderWidth: 1, borderColor: '#e5e7eb' },
  inputReward: { fontSize: 13, color: '#059669', marginTop: 8, fontWeight: '500' },
  totalCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, borderWidth: 2, borderColor: '#dbeafe' },
  totalLabel: { fontSize: 14, color: '#6b7280', fontWeight: '500', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  totalAmount: { fontSize: 36, fontWeight: '700', color: '#2563eb', marginBottom: 4 },
  totalPoints: { fontSize: 14, color: '#6b7280' },
  resetButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef2f2', borderRadius: 12, paddingVertical: 14, borderWidth: 1, borderColor: '#fecaca' },
  resetText: { fontSize: 15, fontWeight: '600', color: '#dc2626', marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20, width: '100%', maxWidth: 360 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarWeekDay: { width: '14.28%', textAlign: 'center', fontSize: 12, fontWeight: '600', color: '#9ca3af', paddingVertical: 8 },
  calendarDayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginBottom: 4 },
  calendarDayText: { fontSize: 14, color: '#374151' },
  calendarDaySelected: { backgroundColor: '#2563eb' },
  calendarDayTextSelected: { color: '#ffffff', fontWeight: '600' },
  calendarDayToday: { borderWidth: 1.5, borderColor: '#2563eb' },
  calendarDayTextToday: { color: '#2563eb', fontWeight: '700' },
  modalCloseButton: { backgroundColor: '#f3f4f6', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  modalCloseButtonText: { fontSize: 15, fontWeight: '600', color: '#374151' },
});