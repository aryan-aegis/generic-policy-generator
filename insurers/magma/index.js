import od1tp5 from './policyTypes/od1tp5/index.js';
// import od1 from './policyTypes/od1/index.js';
import od1tp1 from './policyTypes/od1tp1/index.js';
import { INSURER_DOES_NOT_SUPPORT_POLICY_TYPE } from '../../shared/errors.js';

const magma = async(request) => {
  const {insuranceDetails : {policyType}} = request;
  switch(policyType) {
    case 'od1tp5':
      await od1tp5(request);
      break;
    // case 'od1':
    //   await od1(request);
    //   break;
    case 'od1tp1':
      await od1tp1(request);
      break;
    default:
      throw new Error(INSURER_DOES_NOT_SUPPORT_POLICY_TYPE);
  }
};

export default magma;
