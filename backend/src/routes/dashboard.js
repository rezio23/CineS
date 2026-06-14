const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/kpi',                asyncHandler(dashboardController.getKpi));
router.get('/sessions',             asyncHandler(dashboardController.getSessions));
router.get('/charts/static',        asyncHandler(dashboardController.getStaticCharts));
router.get('/charts/daily',         asyncHandler(dashboardController.getDailyChart));
router.get('/charts/monthly-income', asyncHandler(dashboardController.getMonthlyIncome));
router.get('/charts/monthly-booking', asyncHandler(dashboardController.getMonthlyBooking));

module.exports = router;
