import { DsHeading, DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import { ResourceHeading } from '../common/DelegationModal/SingleRights/ResourceHeading';
import classes from './MaskinportenScopeInfo.module.css';

export const MaskinportenScopeInfo = ({ resource }: { resource: ServiceResource }) => {
  const { t } = useTranslation();
  const scopes =
    resource?.resourceReferences
      ?.filter(
        (reference) =>
          reference.referenceType === 'MaskinportenScope' && reference.reference?.trim(),
      )
      .map((reference) => reference) ?? [];

  return (
    <div className={classes.container}>
      <ResourceHeading resource={resource} />
      <div className={classes.description}>
        {resource.description && <DsParagraph>{resource.description}</DsParagraph>}
        {resource.rightDescription && <DsParagraph>{resource.rightDescription}</DsParagraph>}
      </div>
      <div className={classes.scopes}>
        <DsHeading
          level={4}
          data-size='2xs'
        >
          {t('api_delegation.scopes')}
        </DsHeading>
        {scopes.length > 0 ? (
          <ul className={classes.scopeList}>
            {scopes.map((scope) => (
              <li key={`${scope.reference}`}>{scope.reference}</li>
            ))}
          </ul>
        ) : (
          <DsParagraph>{t('maskinporten_page.no_scopes')}</DsParagraph>
        )}
      </div>
    </div>
  );
};
