import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  DOCUMENT_TYPES: '@document_types',
  DAILY_DATA: '@daily_data',
  SELECTED_DATE: '@selected_date',
  RATE_PER_POINT: '@rate_per_point',
};

const DEFAULT_DOCUMENT_TYPES = [
  { id: '1', name: 'Право', points: 2.5 },
  { id: '2', name: 'Таск', points: 4 },
];

const DEFAULT_RATE = 13.5;

const ACTIONS = {
  SET_DOCUMENT_TYPES: 'SET_DOCUMENT_TYPES',
  ADD_DOCUMENT_TYPE: 'ADD_DOCUMENT_TYPE',
  UPDATE_DOCUMENT_TYPE: 'UPDATE_DOCUMENT_TYPE',
  DELETE_DOCUMENT_TYPE: 'DELETE_DOCUMENT_TYPE',
  SET_DAILY_DATA: 'SET_DAILY_DATA',
  UPDATE_DOCUMENT_COUNT: 'UPDATE_DOCUMENT_COUNT',
  RESET_DAILY_DATA: 'RESET_DAILY_DATA',
  SET_SELECTED_DATE: 'SET_SELECTED_DATE',
  SET_RATE: 'SET_RATE',
  SET_LOADING: 'SET_LOADING',
};

const initialState = {
  documentTypes: [],
  dailyData: {},
  selectedDate: new Date().toISOString().split('T')[0],
  ratePerPoint: DEFAULT_RATE,
  isLoading: true,
};

function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_DOCUMENT_TYPES:
      return { ...state, documentTypes: action.payload };
    case ACTIONS.ADD_DOCUMENT_TYPE:
      return { ...state, documentTypes: [...state.documentTypes, action.payload] };
    case ACTIONS.UPDATE_DOCUMENT_TYPE:
      return {
        ...state,
        documentTypes: state.documentTypes.map(dt =>
          dt.id === action.payload.id ? action.payload : dt
        ),
      };
    case ACTIONS.DELETE_DOCUMENT_TYPE:
      return {
        ...state,
        documentTypes: state.documentTypes.filter(dt => dt.id !== action.payload),
      };
    case ACTIONS.SET_DAILY_DATA:
      return { ...state, dailyData: action.payload };
    case ACTIONS.UPDATE_DOCUMENT_COUNT: {
      const { date, docId, count } = action.payload;
      const dateData = state.dailyData[date] || {};
      return {
        ...state,
        dailyData: {
          ...state.dailyData,
          [date]: { ...dateData, [docId]: count },
        },
      };
    }
    case ACTIONS.RESET_DAILY_DATA: {
      const { date } = action.payload;
      const newDailyData = { ...state.dailyData };
      if (newDailyData[date]) newDailyData[date] = {};
      return { ...state, dailyData: newDailyData };
    }
    case ACTIONS.SET_SELECTED_DATE:
      return { ...state, selectedDate: action.payload };
    case ACTIONS.SET_RATE:
      return { ...state, ratePerPoint: action.payload };
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext();

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (!state.isLoading) saveData();
  }, [state.documentTypes, state.dailyData, state.selectedDate, state.ratePerPoint]);

  const loadData = async () => {
    try {
      const [docTypes, dailyData, selectedDate, rate] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.DOCUMENT_TYPES),
        AsyncStorage.getItem(STORAGE_KEYS.DAILY_DATA),
        AsyncStorage.getItem(STORAGE_KEYS.SELECTED_DATE),
        AsyncStorage.getItem(STORAGE_KEYS.RATE_PER_POINT),
      ]);

      dispatch({ type: ACTIONS.SET_DOCUMENT_TYPES, payload: docTypes ? JSON.parse(docTypes) : DEFAULT_DOCUMENT_TYPES });
      dispatch({ type: ACTIONS.SET_DAILY_DATA, payload: dailyData ? JSON.parse(dailyData) : {} });
      if (selectedDate) dispatch({ type: ACTIONS.SET_SELECTED_DATE, payload: selectedDate });
      if (rate) dispatch({ type: ACTIONS.SET_RATE, payload: parseFloat(rate) });
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    } catch (error) {
      console.error('Error loading data:', error);
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  const saveData = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.DOCUMENT_TYPES, JSON.stringify(state.documentTypes)),
        AsyncStorage.setItem(STORAGE_KEYS.DAILY_DATA, JSON.stringify(state.dailyData)),
        AsyncStorage.setItem(STORAGE_KEYS.SELECTED_DATE, state.selectedDate),
        AsyncStorage.setItem(STORAGE_KEYS.RATE_PER_POINT, state.ratePerPoint.toString()),
      ]);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const addDocumentType = (name, points) => {
    dispatch({ type: ACTIONS.ADD_DOCUMENT_TYPE, payload: { id: Date.now().toString(), name: name.trim(), points: parseFloat(points) } });
  };

  const updateDocumentType = (id, name, points) => {
    dispatch({ type: ACTIONS.UPDATE_DOCUMENT_TYPE, payload: { id, name: name.trim(), points: parseFloat(points) } });
  };

  const deleteDocumentType = (id) => {
    dispatch({ type: ACTIONS.DELETE_DOCUMENT_TYPE, payload: id });
  };

  const updateDocumentCount = (docId, count) => {
    dispatch({ type: ACTIONS.UPDATE_DOCUMENT_COUNT, payload: { date: state.selectedDate, docId, count } });
  };

  const resetDailyData = () => {
    dispatch({ type: ACTIONS.RESET_DAILY_DATA, payload: { date: state.selectedDate } });
  };

  const setSelectedDate = (date) => {
    dispatch({ type: ACTIONS.SET_SELECTED_DATE, payload: date });
  };

  const setRate = (rate) => {
    dispatch({ type: ACTIONS.SET_RATE, payload: parseFloat(rate) });
  };

  const getCurrentDayData = () => state.dailyData[state.selectedDate] || {};

  const calculateDayTotal = (date) => {
    const dayData = state.dailyData[date] || {};
    let totalPoints = 0;
    state.documentTypes.forEach(docType => {
      const count = parseFloat(dayData[docType.id]) || 0;
      totalPoints += count * docType.points;
    });
    return totalPoints * state.ratePerPoint;
  };

  const calculateDailyTotal = () => calculateDayTotal(state.selectedDate);

  const calculateMonthlyTotal = () => {
    const currentMonth = state.selectedDate.substring(0, 7);
    let total = 0;
    Object.entries(state.dailyData).forEach(([date, dayData]) => {
      if (date.startsWith(currentMonth)) {
        Object.entries(dayData).forEach(([docId, count]) => {
          const docType = state.documentTypes.find(dt => dt.id === docId);
          if (docType) total += (parseFloat(count) || 0) * docType.points * state.ratePerPoint;
        });
      }
    });
    return total;
  };

  const calculateMonthlyDetails = () => {
    const currentMonth = state.selectedDate.substring(0, 7);
    const details = {};
    state.documentTypes.forEach(docType => {
      details[docType.id] = { name: docType.name, count: 0, points: 0, reward: 0 };
    });
    Object.entries(state.dailyData).forEach(([date, dayData]) => {
      if (date.startsWith(currentMonth)) {
        Object.entries(dayData).forEach(([docId, count]) => {
          const docType = state.documentTypes.find(dt => dt.id === docId);
          if (docType && details[docId]) {
            const numCount = parseFloat(count) || 0;
            details[docId].count += numCount;
            details[docId].points += numCount * docType.points;
            details[docId].reward += numCount * docType.points * state.ratePerPoint;
          }
        });
      }
    });
    return Object.values(details).filter(d => d.count > 0);
  };

  const getMonthCalendarData = () => {
    const currentMonth = state.selectedDate.substring(0, 7);
    const result = {};
    Object.entries(state.dailyData).forEach(([date, dayData]) => {
      if (date.startsWith(currentMonth)) {
        let total = 0;
        Object.entries(dayData).forEach(([docId, count]) => {
          const docType = state.documentTypes.find(dt => dt.id === docId);
          if (docType) total += (parseFloat(count) || 0) * docType.points * state.ratePerPoint;
        });
        if (total > 0) result[date] = total;
      }
    });
    return result;
  };

  const exportData = async () => {
    return JSON.stringify({
      documentTypes: state.documentTypes,
      dailyData: state.dailyData,
      ratePerPoint: state.ratePerPoint,
      exportDate: new Date().toISOString(),
    }, null, 2);
  };

  const importData = async (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.documentTypes) dispatch({ type: ACTIONS.SET_DOCUMENT_TYPES, payload: data.documentTypes });
      if (data.dailyData) dispatch({ type: ACTIONS.SET_DAILY_DATA, payload: data.dailyData });
      if (data.ratePerPoint) dispatch({ type: ACTIONS.SET_RATE, payload: data.ratePerPoint });
      return true;
    } catch (error) {
      console.error('Import error:', error);
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      ...state, addDocumentType, updateDocumentType, deleteDocumentType,
      updateDocumentCount, resetDailyData, setSelectedDate, setRate,
      getCurrentDayData, calculateDailyTotal, calculateMonthlyTotal,
      calculateMonthlyDetails, calculateDayTotal, getMonthCalendarData,
      exportData, importData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}