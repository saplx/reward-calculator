import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Trash2, Edit3, X, Save, Download, Upload } from 'lucide-react-native';
import { useApp } from '../store/AppContext';

export default function SettingsScreen() {
  const { documentTypes, ratePerPoint, addDocumentType, updateDocumentType, deleteDocumentType, setRate, exportData, importData } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [docName, setDocName] = useState('');
  const [docPoints, setDocPoints] = useState('');
  const [rateValue, setRateValue] = useState(ratePerPoint.toString());
  const [importText, setImportText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  const openAddModal = () => { setEditingDoc(null); setDocName(''); setDocPoints(''); setModalVisible(true); };
  const openEditModal = (doc) => { setEditingDoc(doc); setDocName(doc.name); setDocPoints(doc.points.toString()); setModalVisible(true); };
  const closeModal = () => { setModalVisible(false); setEditingDoc(null); setDocName(''); setDocPoints(''); };

  const handleSave = () => {
    const name = docName.trim();
    const points = parseFloat(docPoints);
    if (!name) { Alert.alert('Ошибка', 'Введите название документа'); return; }
    if (isNaN(points) || points <= 0) { Alert.alert('Ошибка', 'Введите корректное количество баллов'); return; }
    editingDoc ? updateDocumentType(editingDoc.id, name, points) : addDocumentType(name, points);
    closeModal();
  };

  const handleDelete = (doc) => {
    Alert.alert('Подтверждение', `Удалить "${doc.name}"?`, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => deleteDocumentType(doc.id) },
    ]);
  };

  const handleRateChange = (value) => {
    setRateValue(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) setRate(numValue);
  };

  const handleExport = async () => {
    try {
      const data = await exportData();
      Alert.alert('Экспорт', 'Данные готовы для копирования', [{ text: 'OK' }]);
      console.log(data);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось экспортировать данные');
    }
  };

  const handleImport = async () => {
    try {
      const success = await importData(importText);
      if (success) {
        setShowImportModal(false);
        setImportText('');
        Alert.alert('Готово', 'Данные успешно импортированы');
      } else {
        Alert.alert('Ошибка', 'Неверный формат данных');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось импортировать данные');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Настройки расчета</Text>
          <View style={styles.rateCard}>
            <Text style={styles.rateLabel}>Стоимость 1 балла</Text>
            <View style={styles.rateInputContainer}>
              <TextInput style={styles.rateInput} value={rateValue} onChangeText={handleRateChange} keyboardType="decimal-pad" placeholder="13.5" />
              <Text style={styles.rateCurrency}>₽</Text>
            </View>
            <Text style={styles.rateHint}>Формула: баллы × {ratePerPoint} ₽</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Типы документов</Text>
            <TouchableOpacity style={styles.addButton} onPress={openAddModal}><Plus size={20} color="#ffffff" /></TouchableOpacity>
          </View>
          {documentTypes.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Нет типов документов</Text>
              <Text style={styles.emptySubtext}>Нажмите + чтобы добавить</Text>
            </View>
          ) : (
            documentTypes.map((doc) => (
              <View key={doc.id} style={styles.docCard}>
                <View style={styles.docInfo}>
                  <Text style={styles.docName}>{doc.name}</Text>
                  <View style={styles.docPointsBadge}><Text style={styles.docPointsText}>{doc.points} балл</Text></View>
                </View>
                <View style={styles.docActions}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(doc)}><Edit3 size={18} color="#2563eb" /></TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(doc)}><Trash2 size={18} color="#dc2626" /></TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Управление данными</Text>
          <TouchableOpacity style={styles.dataButton} onPress={handleExport}>
            <Download size={20} color="#2563eb" />
            <View style={styles.dataButtonContent}>
              <Text style={styles.dataButtonTitle}>Экспорт данных</Text>
              <Text style={styles.dataButtonDesc}>Сохранить резервную копию</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dataButton} onPress={() => setShowImportModal(true)}>
            <Upload size={20} color="#059669" />
            <View style={styles.dataButtonContent}>
              <Text style={styles.dataButtonTitle}>Импорт данных</Text>
              <Text style={styles.dataButtonDesc}>Восстановить из резервной копии</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingDoc ? 'Редактировать' : 'Новый тип документа'}</Text>
              <TouchableOpacity onPress={closeModal}><X size={24} color="#6b7280" /></TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Название</Text>
                <TextInput style={styles.modalInput} value={docName} onChangeText={setDocName} placeholder="Например: Право" placeholderTextColor="#9ca3af" autoFocus />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Баллы за документ</Text>
                <TextInput style={styles.modalInput} value={docPoints} onChangeText={setDocPoints} keyboardType="decimal-pad" placeholder="2.5" placeholderTextColor="#9ca3af" />
              </View>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Save size={20} color="#ffffff" />
              <Text style={styles.saveButtonText}>Сохранить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent visible={showImportModal} onRequestClose={() => setShowImportModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Импорт данных</Text>
              <TouchableOpacity onPress={() => setShowImportModal(false)}><X size={24} color="#6b7280" /></TouchableOpacity>
            </View>
            <Text style={styles.importHint}>Вставьте содержимое JSON-файла:</Text>
            <TextInput style={styles.importInput} value={importText} onChangeText={setImportText} multiline numberOfLines={6} placeholder="{...}" placeholderTextColor="#9ca3af" />
            <TouchableOpacity style={styles.saveButton} onPress={handleImport}>
              <Upload size={20} color="#ffffff" />
              <Text style={styles.saveButtonText}>Импортировать</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  addButton: { backgroundColor: '#2563eb', width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  rateCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  rateLabel: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  rateInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 16 },
  rateInput: { flex: 1, fontSize: 20, fontWeight: '600', color: '#111827', paddingVertical: 14 },
  rateCurrency: { fontSize: 20, fontWeight: '600', color: '#2563eb' },
  rateHint: { fontSize: 13, color: '#9ca3af', marginTop: 8 },
  emptyCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#9ca3af', marginBottom: 4 },
  emptySubtext: { fontSize: 13, color: '#d1d5db' },
  docCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  docInfo: { flex: 1 },
  docName: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 6 },
  docPointsBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  docPointsText: { fontSize: 13, color: '#2563eb', fontWeight: '500' },
  docActions: { flexDirection: 'row', gap: 8 },
  actionButton: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  deleteButton: { backgroundColor: '#fef2f2' },
  dataButton: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  dataButtonContent: { marginLeft: 12 },
  dataButtonTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 2 },
  dataButtonDesc: { fontSize: 13, color: '#9ca3af' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 32 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  modalBody: { marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  modalInput: { backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#111827', borderWidth: 1, borderColor: '#e5e7eb' },
  saveButton: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  saveButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  importHint: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  importInput: { backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 13, color: '#111827', borderWidth: 1, borderColor: '#e5e7eb', height: 120, textAlignVertical: 'top' },
});