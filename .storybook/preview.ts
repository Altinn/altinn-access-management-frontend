import type { Preview } from '@storybook/react';

import '@digdir/designsystemet-theme/altinn.css';
import '@digdir/designsystemet-css';
import '@/resources/css/Common.module.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
