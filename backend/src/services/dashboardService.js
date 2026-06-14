const dashboardDao = require('../dao/dashboardDao');
const mockDataService = require('./mockDataService');

async function getKpi() {
  try {
    return await dashboardDao.getKpiCounts();
  } catch (err) {
    console.warn('[MOCK] /api/kpi falling back to mock data:', err.message);
    return mockDataService.getKpi();
  }
}

async function getSessions() {
  try {
    return await dashboardDao.getSessions();
  } catch (err) {
    console.warn('[MOCK] /api/sessions falling back to mock data:', err.message);
    return mockDataService.getSessions();
  }
}

async function getStaticCharts() {
  try {
    return await dashboardDao.getStaticCharts();
  } catch (err) {
    console.warn('[MOCK] /api/charts/static falling back to mock data:', err.message);
    return mockDataService.getStaticCharts();
  }
}

async function getDailyChart(session, date) {
  try {
    return await dashboardDao.getDailyChart(session, date);
  } catch (err) {
    console.warn('[MOCK] /api/charts/daily falling back to mock data:', err.message);
    return mockDataService.getDailyChart(session, date);
  }
}

async function getMonthlyIncome(session, dateFrom, dateTo) {
  try {
    const rows = await dashboardDao.getMonthlyIncome(session, dateFrom, dateTo);
    const mockRows = mockDataService.getMonthlyIncome(session, dateFrom, dateTo);

    // Merge live DB rows with generated mock rows so every month in the range has data.
    const merged = new Map();
    mockRows.forEach(r => merged.set(r.LABEL, r));
    (rows || []).forEach(r => merged.set(r.LABEL, r));
    return [...merged.values()].sort((a, b) => new Date('1 ' + a.LABEL) - new Date('1 ' + b.LABEL));
  } catch (err) {
    console.warn('[MOCK] /api/charts/monthly-income falling back to mock data:', err.message);
    return mockDataService.getMonthlyIncome(session, dateFrom, dateTo);
  }
}

async function getMonthlyBooking(session, dateFrom, dateTo) {
  try {
    const rows = await dashboardDao.getMonthlyBooking(session, dateFrom, dateTo);
    const mockRows = mockDataService.getMonthlyBooking(session, dateFrom, dateTo);

    const merged = new Map();
    mockRows.forEach(r => merged.set(r.LABEL, r));
    (rows || []).forEach(r => merged.set(r.LABEL, r));
    return [...merged.values()].sort((a, b) => new Date('1 ' + a.LABEL) - new Date('1 ' + b.LABEL));
  } catch (err) {
    console.warn('[MOCK] /api/charts/monthly-booking falling back to mock data:', err.message);
    return mockDataService.getMonthlyBooking(session, dateFrom, dateTo);
  }
}

module.exports = {
  getKpi,
  getSessions,
  getStaticCharts,
  getDailyChart,
  getMonthlyIncome,
  getMonthlyBooking,
};
