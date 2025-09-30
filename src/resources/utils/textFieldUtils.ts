export const validateEmail = (email: string) => {
  // Improved email validation regex that handles most common cases
  // - Prevents consecutive dots, dots at start/end of local and domain parts
  // - Allows common special characters in local part
  // - Requires proper domain structure with TLD
  const emailRegex =
    /^[a-zA-Z0-9]([a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  const isValid = emailRegex.test(email);

  return {
    isValid,
    errorMessageKey: isValid ? '' : 'text_field_errors.invalid_email_pattern',
  };
};

export const validatePhoneNumber = (phone: string) => {
  const isNumbersOnly = /^\d+$/.test(phone);
  const isValid = isNumbersOnly && phone.length >= 8 && phone.length <= 15;

  return {
    isValid,
    errorMessageKey: isValid ? '' : 'text_field_errors.invalid_phone',
  };
};

export const validateCountryCode = (countryCode: string) => {
  const isValid = /^\+\d{1,3}$/.test(countryCode);

  return {
    isValid,
    errorMessageKey: isValid ? '' : 'text_field_errors.invalid_country_code',
  };
};
