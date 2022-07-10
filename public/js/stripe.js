/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51LK4eGAmRd9ExWukLyDReOsMjQnWOxoyiRCgNqa2dVACMLH4r34ZL7VEgBoTDfa4ZZZ1g8vpbOobcmiJcBYeEj4A002dsaVfNs'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get session from the API endpoint
    const session = await axios(`/api/v1/bookings/checkout-sessions/${tourId}`);

    // console.log(session);
    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
