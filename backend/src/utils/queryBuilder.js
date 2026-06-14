function buildWhere(session, dateFrom, dateTo) {
  const conditions = ['1=1'];
  const binds      = {};
  if (session)  { conditions.push('d.show_time = :sessionTime');                            binds.sessionTime = session; }
  if (dateFrom) { conditions.push('d.show_date >= TO_DATE(:dateFrom, \'YYYY-MM-DD\')');     binds.dateFrom    = dateFrom; }
  if (dateTo)   { conditions.push('d.show_date <= TO_DATE(:dateTo,   \'YYYY-MM-DD\')');     binds.dateTo      = dateTo;   }
  return { where: conditions.join(' AND '), binds };
}

module.exports = { buildWhere };
