const formatCurrency = (amount, currencySymbol = '$') => {
  if (typeof amount !== 'number') {
    return `${currencySymbol}0.00`;
  }
  return `${currencySymbol}${amount.toFixed(2)}`;
};

export default formatCurrency;
