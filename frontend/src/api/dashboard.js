import axios from 'axios';

const BASE = '/api';

export const fetchKpi          = ()                                              => axios.get(`${BASE}/kpi`);
export const fetchSessions     = ()                                              => axios.get(`${BASE}/sessions`);
export const fetchStaticCharts = ()                                              => axios.get(`${BASE}/charts/static`);
export const fetchDaily        = (session, date)                               => axios.get(`${BASE}/charts/daily`,           { params: { session, date } });
export const fetchMonthlyIncome  = (session, dateFrom, dateTo)                   => axios.get(`${BASE}/charts/monthly-income`,  { params: { session, dateFrom, dateTo } });
export const fetchMonthlyBooking = (session, dateFrom, dateTo)                   => axios.get(`${BASE}/charts/monthly-booking`, { params: { session, dateFrom, dateTo } });
