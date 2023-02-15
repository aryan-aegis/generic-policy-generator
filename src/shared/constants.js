// Dayjs
import dayjs from 'dayjs';

// Response OD premium details template
const odPremiumDetails = {
  basic: 0,
  discountAmount: 0,
  discountPercentage: 0,
  odAfterDiscount: 0,
  ncbAmount: 0,
  ncbPercentage: 0,
  loadingPercentage: 0,
  loadingAmount: 0,
  nilDepAmount: 0,
  nilDepPercentage: 0,
  consumables: 0,
  engineProtect: 0,
  rti: 0,
  electricalAccessoriesPremium: 0,
  nonElectricalAccessoriesPremium: 0,
  otherCoveragesPremium: 0,
  netPremium: 0,
  gstOnPremium: 0,
  grossPremium: 0
};

// Response TP premium details template
const tpPremiumDetails = {
  basic: 0,
  tppdRestrictionAmount: 0,
  basicPremiumAfterTppd: 0,
  cpa: 0,
  passenger: 0,
  llpd: 0,
  otherCoveragesPremium: 0,
  netPremium: 0,
  gstOnPremium: 0,
  grossPremium: 0
};

// Response Final premium details template
const finalPremiumDetails = {
  netPremium: 0,
  gstOnPremium: 0,
  grossPremium: 0
};

// Company contact details for filling in portal
const mobile = '9654490589';
const email = 'insurance@aegiscovenant.com';

// Integromat Upload PDF Buffer webhook
const integromatSendBufferHook =
  'https://hook.integromat.com/olwog4nmr62r36xkbk1n90fm28smuj6j';

// Sample datetimes START

const now = dayjs();
const notExpired = now.add(1, 'day');
const expired = now.add(3, 'days');

// OD1 + TP5
const od1tp5Timestamp = now.format('YYYY/MM/DD HH:mm:ss');
const od1tp5RiskStartDate = now.format('YYYY/MM/DD HH:mm:ss');
const od1tp5ManufacturingYear = now.format('YYYY');
const od1tp5RegistrationDate = now.format('YYYY/MM/DD');
const od1tp5PeriodOfOdInsurance =
  now.format('DD/MM/YYYY (HH:mm) [HRS]') +
  ' - ' +
  now.add(1, 'year').subtract(1, 'day').format('DD/MM/YYYY [Midnight]');
const od1tp5PeriodOfTpInsurance =
  now.format('DD/MM/YYYY (HH:mm) [HRS]') +
  ' - ' +
  now.add(5, 'years').subtract(1, 'day').format('DD/MM/YYYY [Midnight]');

// OD1
const od1Timestamp = od1tp5Timestamp;
const od1ManufacturingYear = notExpired.subtract(1, 'year').format('YYYY');
const od1RegistrationDate = notExpired.subtract(1, 'year').format('YYYY/MM/DD');

// OD1 - Not expired
const od1NotExpiredRiskStartDate = notExpired.format('YYYY/MM/DD HH:mm:ss');
const od1NotExpiredPeriodOfOdInsurance =
  notExpired.format('DD/MM/YYYY (HH:mm) [HRS]') +
  ' - ' +
  notExpired.add(1, 'year').subtract(1, 'day').format('DD/MM/YYYY [Midnight]');

// OD1 - Expired
const od1ExpiredRiskStartDate = expired.format('YYYY/MM/DD HH:mm:ss');
const od1ExpiredPeriodOfOdInsurance =
  expired.format('DD/MM/YYYY (HH:mm) [HRS]') +
  ' - ' +
  expired.add(1, 'year').subtract(1, 'day').format('DD/MM/YYYY [Midnight]');

// OD1 + TP1
const od1tp1Timestamp = od1Timestamp;
const od1tp1ManufacturingYear = od1ManufacturingYear;
const od1tp1RegistrationDate = od1RegistrationDate;

// OD1 + TP1 - Not expired
const od1tp1NotExpiredRiskStartDate = od1NotExpiredRiskStartDate;
const od1tp1NotExpiredPeriodOfOdInsurance = od1NotExpiredPeriodOfOdInsurance;
const od1tp1NotExpiredPeriodOfTpInsurance = od1tp1NotExpiredPeriodOfOdInsurance;

// OD1 + TP1 - Expired
const od1tp1ExpiredRiskStartDate = od1ExpiredRiskStartDate;
const od1tp1ExpiredPeriodOfOdInsurance = od1ExpiredPeriodOfOdInsurance;
const od1tp1ExpiredPeriodOfTpInsurance = od1tp1ExpiredPeriodOfOdInsurance;

// Sample datetimes END

// Export modules
export {
  odPremiumDetails,
  tpPremiumDetails,
  finalPremiumDetails,
  mobile,
  email,
  integromatSendBufferHook,
  od1tp5Timestamp,
  od1tp5RiskStartDate,
  od1tp5ManufacturingYear,
  od1tp5RegistrationDate,
  od1tp5PeriodOfOdInsurance,
  od1tp5PeriodOfTpInsurance,
  od1Timestamp,
  od1ManufacturingYear,
  od1RegistrationDate,
  od1NotExpiredRiskStartDate,
  od1NotExpiredPeriodOfOdInsurance,
  od1ExpiredRiskStartDate,
  od1ExpiredPeriodOfOdInsurance,
  od1tp1Timestamp,
  od1tp1ManufacturingYear,
  od1tp1RegistrationDate,
  od1tp1NotExpiredRiskStartDate,
  od1tp1NotExpiredPeriodOfOdInsurance,
  od1tp1NotExpiredPeriodOfTpInsurance,
  od1tp1ExpiredRiskStartDate,
  od1tp1ExpiredPeriodOfOdInsurance,
  od1tp1ExpiredPeriodOfTpInsurance
};
