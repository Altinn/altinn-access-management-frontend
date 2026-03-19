const isValidSsnFormat = (personIdentifier: string) => /^\d{11}$/.test(personIdentifier);
const isDigitsOnly = (personIdentifier: string) => /^\d+$/.test(personIdentifier);
const containsWhitespace = (personIdentifier: string) => /\s/.test(personIdentifier);

export const getPersonIdentifierErrorKey = (
  identifier: string,
  allowUsername: boolean,
): string | null => {
  const trimmedIdentifier = identifier.trim();

  if (!trimmedIdentifier.length) {
    return null;
  }

  if (!allowUsername) {
    return !isValidSsnFormat(trimmedIdentifier)
      ? 'new_user_modal.person_identifier_ssn_format_error'
      : null;
  }

  if (containsWhitespace(trimmedIdentifier)) {
    return 'new_user_modal.person_identifier_whitespace_forbidden_error';
  }

  if (isDigitsOnly(trimmedIdentifier) && !isValidSsnFormat(trimmedIdentifier)) {
    return 'new_user_modal.person_identifier_ssn_format_error';
  }

  if (!isDigitsOnly(trimmedIdentifier) && trimmedIdentifier.length < 6) {
    return 'new_user_modal.person_identifier_username_format_error';
  }

  return null;
};
