const MOCK_KPI = {
  totalMovies: 5,
  totalBookings: 7,
  totalRevenue: "30.00",
};

const MOCK_SESSIONS = ["10:00", "14:00", "15:30", "19:00", "20:00", "21:00"];

const MOCK_STATIC = {
  theatreType: [
    { LABEL: "Hall A", VALUE: 1 },
    { LABEL: "Hall B", VALUE: 1 },
    { LABEL: "IMAX Hall", VALUE: 1 },
  ],
  movie: [
    { LABEL: "Spider-Man: Beyond the Spider-Verse", VALUE: 1 },
    { LABEL: "Black Panther 3", VALUE: 1 },
    { LABEL: "Interstellar 2", VALUE: 1 },
  ],
  seatType: [
    { LABEL: "STANDARD", VALUE: 1 },
    { LABEL: "VIP", VALUE: 1 },
    { LABEL: "IMAX", VALUE: 1 },
  ],
};

const MOCK_DAILY = [
  { LABEL: "08 Jun", VALUE: 1 },
  { LABEL: "09 Jun", VALUE: 1 },
  { LABEL: "10 Jun", VALUE: 1 },
];

const MOCK_MONTHLY_INCOME = [
  { LABEL: "Jun 2026", VALUE: 30.00 },
];

const MOCK_MONTHLY_BOOKING = [
  { LABEL: "Jun 2026", VALUE: 3 },
];

module.exports = {
  MOCK_KPI,
  MOCK_SESSIONS,
  MOCK_STATIC,
  MOCK_DAILY,
  MOCK_MONTHLY_INCOME,
  MOCK_MONTHLY_BOOKING,
};
