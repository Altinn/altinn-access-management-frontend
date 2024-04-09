/**
 * Determines the appropriate icon size for a button based on whether it has text or not.
 *
 * @param {boolean} [buttonHasText] - boolean indicating whether the button has text.
 * @returns {string} - The size of the button's icon, measured in rem units.
 *
 * @example
 * setIconButtonIconSize(true); // Returns '1.75rem'
 */

export const getButtonIconSize = (buttonHasText: boolean) => (buttonHasText ? '1.75rem' : '2rem');
