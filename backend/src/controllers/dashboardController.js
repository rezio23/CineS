const dashboardService = require('../services/dashboardService');

async function getKpi(req, res) {
  const data = await dashboardService.getKpi();
  res.json(data);
}

async function getSessions(req, res) {
  const data = await dashboardService.getSessions();
  res.json(data);
}

async function getStaticCharts(req, res) {
  const data = await dashboardService.getStaticCharts();
  res.json(data);
}

async function getDailyChart(req, res) {
  const { session, date } = req.query;
  const data = await dashboardService.getDailyChart(session, date);
  res.json(data);
}

async function getMonthlyIncome(req, res) {
  const { session, dateFrom, dateTo } = req.query;
  const data = await dashboardService.getMonthlyIncome(session, dateFrom, dateTo);
  res.json(data);
}

async function getMonthlyBooking(req, res) {
  const { session, dateFrom, dateTo } = req.query;
  const data = await dashboardService.getMonthlyBooking(session, dateFrom, dateTo);
  res.json(data);
}

module.exports = {
  getKpi,
  getSessions,
  getStaticCharts,
  getDailyChart,
  getMonthlyIncome,
  getMonthlyBooking,
};
