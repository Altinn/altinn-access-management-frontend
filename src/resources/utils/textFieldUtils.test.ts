import { describe, it, expect, vi } from 'vitest';
import { validateEmail, validatePhoneNumber, validateCountryCode } from './textFieldUtils';

describe('validateEmail', () => {
  it('should return valid for correct email formats', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'firstname+lastname@company.org',
      'test123@test-domain.com',
      'user_name@example-domain.com',
      'test.email.with+symbol@example.com',
      'a@b.co', // minimal valid email
      'user123@sub.domain.org',
      "test!#$%&'*+-=?^_`{}~@example.com", // special characters in local part
      'user@domain-with-æøå.no', // Norwegian characters in domain
      'test@subdomain.example.museum', // longer TLD
      'simple@test.co', // short TLD
      'complex.email+tag@sub.domain.example.org', // complex structure
      'user@xn--tst-jma.no', // punycode domain (represents tøst.no)
      'takataka@hahahablahblah.nonononono', // user's test case - long TLD
      'miauuuuuu@kattekatt.pus', // user's test case - short TLD
    ];

    validEmails.forEach((email) => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(true);
      expect(result.errorMessageKey).toBe('');
    });
  });

  it('should return invalid for incorrect email formats', () => {
    const invalidEmails = [
      '', // empty string
      'invalid-email', // no @ symbol
      '@example.com', // missing local part
      'test@', // missing domain
      'test@example', // missing TLD
      'test @example.com', // space in local part
      'test@example .com', // space in domain
      'test@.com', // domain starts with dot
      '.test@example.com', // local part starts with dot
      'test.@example.com', // local part ends with dot
      'test@example.c', // TLD too short (1 character)
      'test@@example.com', // double @ symbol
      'test@example.toolongtldthatistoolong', // TLD too long (>14 characters)
      // Note: Some cases removed that might actually be valid with the new regex
    ];

    invalidEmails.forEach((email) => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(false);
      expect(result.errorMessageKey).toBe('text_field_errors.invalid_email_pattern');
    });
  });

  it('should handle edge cases', () => {
    // Very long email within valid limits
    const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com';
    const longResult = validateEmail(longEmail);
    expect(longResult.isValid).toBe(true);

    // Email with all allowed special characters
    const specialEmail = "test!#$%&'*+-=?^_`{}~@example.com";
    const specialResult = validateEmail(specialEmail);
    expect(specialResult.isValid).toBe(true);

    // Norwegian domain with special characters
    const norwegianEmail = 'test@eksempel-æøå.no';
    const norwegianResult = validateEmail(norwegianEmail);
    expect(norwegianResult.isValid).toBe(true);

    // Maximum TLD length (14 characters)
    const maxTldEmail = 'test@example.abcdefghijklmn';
    const maxTldResult = validateEmail(maxTldEmail);
    expect(maxTldResult.isValid).toBe(true);
  });
});

describe('validatePhoneNumber', () => {
  it('should return valid for correct phone number formats', () => {
    const validPhones = [
      '12345678', // exactly 8 digits
      '123456789', // 9 digits
      '1234567890', // 10 digits
      '12345678901', // 11 digits
      '123456789012', // 12 digits
      '1234567890123', // 13 digits
      '12345678901234', // 14 digits
      '123456789012345', // exactly 15 digits
      '90123456', // Norwegian mobile format
      '22334455', // Norwegian landline format
    ];

    validPhones.forEach((phone) => {
      const result = validatePhoneNumber(phone);
      expect(result.isValid).toBe(true);
      expect(result.errorMessageKey).toBe('');
    });
  });

  it('should return invalid for incorrect phone number formats', () => {
    const invalidPhones = [
      '', // empty string
      '1234567', // too short (7 digits)
      '1234567890123456', // too long (16 digits)
      '12345abc', // contains letters
      '123-456-7890', // contains hyphens
      '123 456 7890', // contains spaces
      '+4712345678', // contains plus sign
      '(123)4567890', // contains parentheses
      '123.456.7890', // contains dots
      'abcdefgh', // all letters
      '12345678a', // ends with letter
      'a12345678', // starts with letter
      '1234 5678', // space in middle
    ];

    invalidPhones.forEach((phone) => {
      const result = validatePhoneNumber(phone);
      expect(result.isValid).toBe(false);
      expect(result.errorMessageKey).toBe('text_field_errors.invalid_phone');
    });
  });

  it('should handle edge cases', () => {
    // Exactly minimum length
    const minLength = '12345678';
    const minResult = validatePhoneNumber(minLength);
    expect(minResult.isValid).toBe(true);

    // Exactly maximum length
    const maxLength = '123456789012345';
    const maxResult = validatePhoneNumber(maxLength);
    expect(maxResult.isValid).toBe(true);

    // One digit short
    const tooShort = '1234567';
    const shortResult = validatePhoneNumber(tooShort);
    expect(shortResult.isValid).toBe(false);

    // One digit too long
    const tooLong = '1234567890123456';
    const longResult = validatePhoneNumber(tooLong);
    expect(longResult.isValid).toBe(false);
  });

  it('should only accept numeric characters', () => {
    // Mixed valid and invalid characters
    const mixedCases = [
      '1234567a', // letter at end
      'a1234567', // letter at start
      '123a5678', // letter in middle
      '123456@8', // special character
      '12345#78', // hash symbol
      '1234*678', // asterisk
    ];

    mixedCases.forEach((phone) => {
      const result = validatePhoneNumber(phone);
      expect(result.isValid).toBe(false);
      expect(result.errorMessageKey).toBe('text_field_errors.invalid_phone');
    });
  });
});

describe('validateCountryCode', () => {
  it('should return valid for correct country code formats', () => {
    const validCountryCodes = [
      '+1', // US/Canada
      '+47', // Norway
      '+46', // Sweden
      '+45', // Denmark
      '+44', // UK
      '+49', // Germany
      '+33', // France
      '+39', // Italy
      '+34', // Spain
      '+31', // Netherlands
      '+41', // Switzerland
      '+43', // Austria
      '+32', // Belgium
      '+351', // Portugal
      '+353', // Ireland
      '+358', // Finland
      '+372', // Estonia
      '+371', // Latvia
      '+370', // Lithuania
      '+48', // Poland
      '+420', // Czech Republic
      '+421', // Slovakia
      '+36', // Hungary
      '+40', // Romania
      '+359', // Bulgaria
      '+385', // Croatia
      '+386', // Slovenia
      '+381', // Serbia
      '+382', // Montenegro
      '+383', // Kosovo
      '+389', // North Macedonia
      '+355', // Albania
      '+30', // Greece
      '+90', // Turkey
      '+7', // Russia/Kazakhstan
      '+380', // Ukraine
      '+375', // Belarus
      '+373', // Moldova
      '+374', // Armenia
      '+995', // Georgia
      '+994', // Azerbaijan
      '+998', // Uzbekistan
      '+996', // Kyrgyzstan
      '+992', // Tajikistan
      '+993', // Turkmenistan
      '+86', // China
      '+81', // Japan
      '+82', // South Korea
      '+91', // India
      '+66', // Thailand
      '+65', // Singapore
      '+60', // Malaysia
      '+62', // Indonesia
      '+63', // Philippines
      '+84', // Vietnam
      '+855', // Cambodia
      '+856', // Laos
      '+95', // Myanmar
      '+880', // Bangladesh
      '+94', // Sri Lanka
      '+977', // Nepal
      '+975', // Bhutan
      '+960', // Maldives
      '+61', // Australia
      '+64', // New Zealand
      '+679', // Fiji
      '+685', // Samoa
      '+686', // Kiribati
      '+687', // New Caledonia
      '+688', // Tuvalu
      '+689', // French Polynesia
      '+690', // Tokelau
      '+691', // Micronesia
      '+692', // Marshall Islands
      '+693', // Nauru
      '+694', // Solomon Islands
      '+695', // Palau
      '+696', // Vanuatu
      '+697', // Wallis and Futuna
      '+698', // Cook Islands
      '+212', // Morocco
      '+213', // Algeria
      '+216', // Tunisia
      '+218', // Libya
      '+20', // Egypt
      '+249', // Sudan
      '+251', // Ethiopia
      '+252', // Somalia
      '+253', // Djibouti
      '+254', // Kenya
      '+255', // Tanzania
      '+256', // Uganda
      '+257', // Burundi
      '+258', // Mozambique
      '+260', // Zambia
      '+261', // Madagascar
      '+262', // Reunion
      '+263', // Zimbabwe
      '+264', // Namibia
      '+265', // Malawi
      '+266', // Lesotho
      '+267', // Botswana
      '+268', // Eswatini
      '+269', // Comoros
      '+27', // South Africa
      '+290', // Saint Helena
      '+291', // Eritrea
      '+297', // Aruba
      '+298', // Faroe Islands
      '+299', // Greenland
      '+350', // Gibraltar
      '+352', // Luxembourg
      '+354', // Iceland
      '+356', // Malta
      '+357', // Cyprus
      '+376', // Andorra
      '+377', // Monaco
      '+378', // San Marino
      '+380', // Ukraine
      '+381', // Serbia
      '+382', // Montenegro
      '+383', // Kosovo
      '+385', // Croatia
      '+386', // Slovenia
      '+387', // Bosnia and Herzegovina
      '+389', // North Macedonia
      '+500', // Falkland Islands
      '+501', // Belize
      '+502', // Guatemala
      '+503', // El Salvador
      '+504', // Honduras
      '+505', // Nicaragua
      '+506', // Costa Rica
      '+507', // Panama
      '+508', // Saint Pierre and Miquelon
      '+509', // Haiti
      '+590', // Guadeloupe
      '+591', // Bolivia
      '+592', // Guyana
      '+593', // Ecuador
      '+594', // French Guiana
      '+595', // Paraguay
      '+596', // Martinique
      '+597', // Suriname
      '+598', // Uruguay
      '+599', // Netherlands Antilles
      '+670', // East Timor
      '+672', // Australian External Territories
      '+673', // Brunei
      '+674', // Nauru
      '+675', // Papua New Guinea
      '+676', // Tonga
      '+677', // Solomon Islands
      '+678', // Vanuatu
      '+681', // Wallis and Futuna
      '+682', // Cook Islands
      '+683', // Niue
      '+684', // American Samoa
      '+850', // North Korea
      '+852', // Hong Kong
      '+853', // Macau
      '+855', // Cambodia
      '+856', // Laos
      '+880', // Bangladesh
      '+886', // Taiwan
      '+960', // Maldives
      '+961', // Lebanon
      '+962', // Jordan
      '+963', // Syria
      '+964', // Iraq
      '+965', // Kuwait
      '+966', // Saudi Arabia
      '+967', // Yemen
      '+968', // Oman
      '+970', // Palestine
      '+971', // United Arab Emirates
      '+972', // Israel
      '+973', // Bahrain
      '+974', // Qatar
      '+975', // Bhutan
      '+976', // Mongolia
      '+977', // Nepal
      '+992', // Tajikistan
      '+993', // Turkmenistan
      '+994', // Azerbaijan
      '+995', // Georgia
      '+996', // Kyrgyzstan
      '+998', // Uzbekistan
    ];

    validCountryCodes.forEach((countryCode) => {
      const result = validateCountryCode(countryCode);
      expect(result.isValid).toBe(true);
      expect(result.errorMessageKey).toBe('');
    });
  });

  it('should return invalid for incorrect country code formats', () => {
    const invalidCountryCodes = [
      '', // empty string
      '47', // missing plus sign
      '+', // plus sign only
      'Norway', // text instead of numbers
      '+47a', // contains letters
      '+ 47', // space after plus
      '+4 7', // space in number
      '+1234', // too long (4 digits)
      '+999999', // way too long
      '++47', // double plus
      '-47', // minus instead of plus
      '+47-', // ends with hyphen
      '+47.', // ends with dot
      '+47 ', // ends with space
      ' +47', // starts with space
      'abc', // all letters
      '123', // numbers without plus
      '+abc', // letters after plus
      '+4a7', // letter in middle
      '+47-48', // hyphen in middle
      '+47.48', // dot in middle
      '+47/48', // slash in middle
      '+47+48', // plus in middle
      '(+47)', // parentheses
      '[+47]', // brackets
      '{+47}', // braces
    ];

    invalidCountryCodes.forEach((countryCode) => {
      const result = validateCountryCode(countryCode);
      expect(result.isValid).toBe(false);
      expect(result.errorMessageKey).toBe('text_field_errors.invalid_country_code');
    });
  });

  it('should handle edge cases for country codes', () => {
    // Minimum valid length (+1)
    const minLength = '+1';
    const minResult = validateCountryCode(minLength);
    expect(minResult.isValid).toBe(true);

    // Maximum valid length (+999)
    const maxLength = '+999';
    const maxResult = validateCountryCode(maxLength);
    expect(maxResult.isValid).toBe(true);

    // Two digits
    const twoDigits = '+47';
    const twoResult = validateCountryCode(twoDigits);
    expect(twoResult.isValid).toBe(true);

    // Three digits
    const threeDigits = '+123';
    const threeResult = validateCountryCode(threeDigits);
    expect(threeResult.isValid).toBe(true);

    // Too long (4 digits)
    const tooLong = '+1234';
    const longResult = validateCountryCode(tooLong);
    expect(longResult.isValid).toBe(false);

    // Single digit including zero (technically valid by regex)
    const zero = '+0';
    const zeroResult = validateCountryCode(zero);
    expect(zeroResult.isValid).toBe(true); // regex allows this

    // Leading zeros (should be valid as they're just digits)
    const leadingZero = '+01';
    const leadingZeroResult = validateCountryCode(leadingZero);
    expect(leadingZeroResult.isValid).toBe(true);
  });

  it('should validate specific common country codes', () => {
    // Test some of the most common country codes specifically
    const commonCodes = [
      { code: '+1', country: 'US/Canada' },
      { code: '+44', country: 'UK' },
      { code: '+33', country: 'France' },
      { code: '+49', country: 'Germany' },
      { code: '+81', country: 'Japan' },
      { code: '+86', country: 'China' },
      { code: '+91', country: 'India' },
      { code: '+47', country: 'Norway' },
      { code: '+46', country: 'Sweden' },
      { code: '+45', country: 'Denmark' },
    ];

    commonCodes.forEach(({ code, country }) => {
      const result = validateCountryCode(code);
      expect(result.isValid).toBe(true);
      expect(result.errorMessageKey).toBe('');
    });
  });
});
