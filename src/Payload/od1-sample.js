const request = {
  requestId: '1000004747',
  riskStartDate: '2023/01/17 00:00:00',
  customerDetails: {
    customerType: 'Individual',
    salutation: 'Mr.',
    firstName: 'KAPIL',
    lastName: 'VASHIST',
    gender: 'Male',
    dob: '2000/07/02',
    mobile: '7027207006',
    email: 'test@example.com',
    address: 'TETS ADDRESS 1, TETS ADDRESS 2',
    addressLine1: 'TETS ADDRESS 1',
    addressLine2: 'TETS ADDRESS 2',
    city: 'NEW DELHI',
    state: 'DELHI',
    pincode: '110035',
    aadhaar: '813035800949',
    aadhaarFileId: '1hkfSxhd4wbVsgGGBTlJHS21zrMEIAkDu',
    pan: 'BQIPA8062P',
    panFileId: '1Ioc4g37XpbzX3L47XjgUHx45se456VFT'
  },
  vehicleDetails: {
    vehicleType: 'TW',
    newVehicle: 'No',
    rto: 'DL04',
    zone: 'A',
    manufacturingYear: '2017',
    registrationNumber: 'DL9SF9280',
    registrationDate: '2017/12/20',
    manufacturer: 'BAJAJ',
    model: 'BOXER',
    variant: '2000 K TECH',
    bodyType: 'BIKE',
    engineNumber: 'TESTENGINE923222',
    chassisNumber: 'CHASSIS2132278898',
    hypothecated: 'No'
  },
  dealerDetails: {
    name: 'MPS',
    code: 'ACPL00001'
  },
  nomineeDetails: {
    nomineeName: 'TEST NOMINEE',
    nomineeAge: '56',
    nomineeRelation: 'Father',
    nomineeGender: 'Male'
  },
  insuranceDetails: {
    insurer: {
      name: 'Magma HDI General Insurance Limited',
      code: 'magma',
      branch: 'Hubli, Karnataka',
      type: 'GENERIC - BIKE',
      data: {
        area: 'SARAI ROHILLA',
        noOfClaimInPreviousPolicy: '0'
      }
    },
    uid: '1000004747',
    policyType: 'od1',
    policyTypeName: 'Rollover Comprehensive - 1 Year OD + 1 Year TP',
    periodOfOdInsurance: '21/12/2022 (00:00 HRS) - 20/12/2023 Midnight',
    periodOfTpInsurance: '21/12/2022 (00:00 HRS) - 20/12/2023 Midnight',
    addonOdCoverages: '',
    addonTpCoverages: '',
    previousOdInsurer: 'BAJAJ',
    previousOdPolicyNumber: 'TESTPOLICY2131',
    previousOdEndDate: '2023/02/09',
    claimInPreviousPolicy: 'No',
    previousNcb: '25',
    transferCase: 'No',
    premiumDetails: {
      idv: {
        basic: 18000,
        basicFormatted: '18,000.00',
        electrical: 0,
        nonElectrical: 0,
        total: 18000,
        totalFormatted: '18,000.00'
      },
      od: {
        basic: 322.74,
        discountAmount: 123.81,
        discountPercentage: -35,
        odAfterDiscount: 198.93,
        ncbAmount: 62.93,
        ncbPercentage: 30,
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
        netPremium: 136,
        gstOnPremium: 24.48,
        grossPremium: 160.48
      },
      tp: {
        basic: 714,
        tppdRestrictionAmount: -50,
        basicPremiumAfterTppd: 664,
        cpa: 0,
        passenger: 0,
        llpd: 0,
        otherCoveragesPremium: 0,
        netPremium: 664,
        gstOnPremium: 119.52,
        grossPremium: 783.52
      },
      netPremium: 800,
      gstOnPremium: 144,
      grossPremium: 944
    }
  },
  timestamp: '2022/12/15 14:15:22',
  environment: 'production',
  slackMessageId: '1671093934.765889',
  clickupTaskId: '8676xp42g'
};

export { request };
