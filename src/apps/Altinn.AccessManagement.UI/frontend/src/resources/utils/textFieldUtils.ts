export const validateEmail = (email: string) => {
  // Email validation regex from Core that handles most common cases
  // - Prevents consecutive dots, dots at start/end of local and domain parts
  // - Allows common special characters in local part
  // - Requires proper domain structure with TLD
  // - Supports Norwegian characters (æøåÆØÅ) in domain names
  const emailRegex =
    /^([a-zA-Z0-9!#$%&'*+\-=?^_`{}~]+(\.[a-zA-Z0-9!#$%&'*+\-=?^_`{}~]+)*)@([a-zA-Z0-9æøåÆØÅ]([a-zA-Z0-9\-æøåÆØÅ]{0,61}[a-zA-Z0-9æøåÆØÅ])?\.)*[a-zA-Z0-9æøåÆØÅ]([a-zA-Z0-9\-æøåÆØÅ]{0,61}[a-zA-Z0-9æøåÆØÅ])?\.[a-zA-Z]{2,14}$/;
  const isValid = emailRegex.test(email);

  return {
    isValid,
    errorMessageKey: isValid ? '' : 'text_field_errors.invalid_email_pattern',
  };
};

export const validatePhoneNumber = (phone: string, countryCode: string) => {
  if (countryCode === '+47') {
    const isValid = /^[49]\d{7}$/.test(phone);

    return {
      isValid,
      errorMessageKey: isValid ? '' : 'text_field_errors.invalid_norwegian_phone',
    };
  }

  // The length rules for other countries are checked by Core when saving
  const isValid = /^\d{1,15}$/.test(phone);

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
