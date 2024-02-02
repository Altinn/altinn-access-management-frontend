export const header = {
  languageChangeButton: 'button[class*=a-languageSwitcher]',
  languageOptionsList: 'li[class^="nav-item dropdown"]',
  languageSelect: {
    english: 'a[onclick^="return changeLanguage(1033)"]',
    bokmål: 'a[onclick^="return changeLanguage(1044)"]',
    nynorsk: 'a[onclick^="return changeLanguage(2068)"]',
  },
  nav: '#primary-nav',
  navList: {
    profile: 'a[href="/ui/Profile"]',
  },
};
