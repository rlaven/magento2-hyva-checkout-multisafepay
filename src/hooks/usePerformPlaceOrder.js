import { useCallback, useContext } from 'react';
import _get from 'lodash.get';
import _set from 'lodash.set';

import { __ } from '../../../../i18n';
import { performRedirect } from '../utility';
import { LOGIN_FORM } from '../../../../config';
import AppContext from '../../../../context/App/AppContext';
import CartContext from '../../../../context/Cart/CartContext';

export default function usePerformPlaceOrder(paymentMethodCode) {
  const { cartId, setRestPaymentMethod, setOrderInfo } =
    useContext(CartContext);
  const { isLoggedIn, setPageLoader, setErrorMessage } = useContext(AppContext);

  return useCallback(
    async (values, additionalData) => {
      try {
        const email = _get(values, `${LOGIN_FORM}.email`);
        const paymentMethodData = {
          paymentMethod: {
            method: paymentMethodCode,
            additional_data: additionalData,
          },
        };

        if (!isLoggedIn) {
          _set(paymentMethodData, 'email', email);
        } else {
          _set(paymentMethodData, 'cartId', cartId);
        }

        setPageLoader(true);
        const order = await setRestPaymentMethod(paymentMethodData, isLoggedIn);
        setPageLoader(false);
        performRedirect(order);

        if (order) {
          setOrderInfo(order);
        }
      } catch (error) {
        console.error(error);
        setErrorMessage(
          __(
            'This transaction could not be performed. Please select another payment method.'
          )
        );
        setPageLoader(false);
      }
    },
    [
      cartId,
      isLoggedIn,
      setOrderInfo,
      setPageLoader,
      setErrorMessage,
      paymentMethodCode,
      setRestPaymentMethod,
    ]
  );
}