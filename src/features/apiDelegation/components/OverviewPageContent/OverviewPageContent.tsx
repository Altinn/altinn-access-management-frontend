import { Panel } from '@altinn/altinn-design-system';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  Spinner,
} from '@digdir/design-system-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as React from 'react';
import { FolderFileFillIcon, ChevronRightDoubleCircleFillIcon } from '@navikt/aksel-icons';

import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { ReactComponent as Add } from '@/assets/Add.svg';
import { ReactComponent as Edit } from '@/assets/Edit.svg';
import { ReactComponent as Error } from '@/assets/Error.svg';
import { resetDelegationRequests } from '@/rtk/features/apiDelegation/delegationRequest/delegationRequestSlice';
import { resetDelegableOrgs } from '@/rtk/features/apiDelegation/delegableOrg/delegableOrgSlice';
import {
  fetchOverviewOrgsOffered,
  fetchOverviewOrgsReceived,
  restoreAllSoftDeletedItems,
  softDeleteAll,
  softRestoreAll,
  deleteOfferedApiDelegation,
  deleteReceivedApiDelegation,
  type OverviewOrg,
  type DeletionRequest,
} from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgSlice';
import { resetDelegableApis } from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import { useMediaQuery } from '@/resources/hooks';
import common from '@/resources/css/Common.module.css';
import { ActionBar, ErrorPanel, SelectionBar } from '@/components';
import { ApiDelegationPath } from '@/routes/paths';

import { LayoutState } from '../LayoutState';

import { OrgDelegationActionBar } from './OrgDelegationActionBar';
import classes from './OverviewPageContent.module.css';

export interface OverviewPageContentInterface {
  layout: LayoutState;
}

export const OverviewPageContent = ({
  layout = LayoutState.Offered,
}: OverviewPageContentInterface) => {
  const [saveDisabled, setSaveDisabled] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const overviewOrgs = useAppSelector((state) => state.overviewOrg.overviewOrgs);
  const error = useAppSelector((state) => state.overviewOrg.error);
  const loading = useAppSelector((state) => state.overviewOrg.loading);
  const isSm = useMediaQuery('(max-width: 768px)');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchData: () => any;
  let overviewText: string;
  let accessesHeader: string;
  let noDelegationsInfoText: string;

  useEffect(() => {
    if (loading) {
      void fetchData();
    }
    handleSaveDisabled();
    dispatch(resetDelegableApis());
    dispatch(resetDelegableOrgs());
    dispatch(resetDelegationRequests());
  }, [overviewOrgs, error]);

  switch (layout) {
    case LayoutState.Offered:
      fetchData = async () => await dispatch(fetchOverviewOrgsOffered());
      overviewText = t('api_delegation.api_overview_text');
      accessesHeader = t('api_delegation.you_have_delegated_accesses');
      noDelegationsInfoText = t('api_delegation.no_offered_delegations');
      break;
    case LayoutState.Received:
      fetchData = async () => await dispatch(fetchOverviewOrgsReceived());
      overviewText = t('api_delegation.api_received_overview_text');
      accessesHeader = t('api_delegation.you_have_received_accesses');
      noDelegationsInfoText = t('api_delegation.no_received_delegations');
      break;
  }

  const goToStartDelegation = () => {
    dispatch(restoreAllSoftDeletedItems());
    navigate('/' + ApiDelegationPath.OfferedApiDelegations + '/' + ApiDelegationPath.ChooseOrg);
  };

  const handleSaveDisabled = () => {
    for (const org of overviewOrgs) {
      if (org.isAllSoftDeleted) {
        setSaveDisabled(false);
        return;
      }
      for (const api of org.apiList) {
        if (api.isSoftDelete) {
          setSaveDisabled(false);
          return;
        }
      }
    }
    setSaveDisabled(true);
  };

  const handleSetIsEditable = () => {
    if (isEditable) {
      dispatch(restoreAllSoftDeletedItems());
    }
    setIsEditable(!isEditable);
  };

  const mapToDeletionRequest = (orgNr: string, apiId: string) => {
    const deletionRequest: DeletionRequest = {
      orgNr,
      apiId,
    };
    return deletionRequest;
  };

  const handleSave = () => {
    for (const org of overviewOrgs) {
      for (const item of org.apiList) {
        if (item.isSoftDelete) {
          if (layout === LayoutState.Offered) {
            void dispatch(deleteOfferedApiDelegation(mapToDeletionRequest(org.orgNr, item.id)));
          } else if (layout === LayoutState.Received) {
            void dispatch(deleteReceivedApiDelegation(mapToDeletionRequest(org.orgNr, item.id)));
          }
        }
      }
    }
    setIsEditable(false);
  };

  const activeDelegations = () => {
    if (error.message) {
      return (
        <div className={classes.errorPanel}>
          <ErrorPanel
            title={t('api_delegation.data_retrieval_failed')}
            message={error.message}
            statusCode={error.statusCode}
          ></ErrorPanel>
        </div>
      );
    } else if (loading) {
      return (
        <div className={classes.spinnerContainer}>
          <Spinner
            title={String(t('common.loading'))}
            size='large'
          />
        </div>
      );
    } else if (overviewOrgs.length < 1) {
      return <h3 className={classes.noActiveDelegations}>{noDelegationsInfoText}</h3>;
    }
    return overviewOrgs.map((org: OverviewOrg) => (
      <div
        key={org.id}
        className={classes.actionBarWrapper}
      >
        <OrgDelegationActionBar
          organization={org}
          isEditable={isEditable}
          softDeleteAllCallback={() => dispatch(softDeleteAll(org.id))}
          softRestoreAllCallback={() => dispatch(softRestoreAll(org.id))}
          key={org.id}
        ></OrgDelegationActionBar>
      </div>
    ));
  };

  // TEST!
  const [isTestOpen, setTestIsOpen] = useState(false);
  const [isTestOpen2, setTestIsOpen2] = useState(false);
  const [testCollection, setTestCollection] = useState([
    'Løven',
    'Heksa',
    'Klesskapet',
    'Julenissen',
    '4 barn',
  ]);

  const testCollectionActionBars = testCollection.map((title, index) => (
    <ActionBar
      key={index}
      title={title}
      size='small'
      color='success'
      actions={
        <Button
          variant='quiet'
          onClick={() => {
            setTestCollection(testCollection.filter((i) => i !== title));
          }}
        >
          Angre
        </Button>
      }
    >
      Test
    </ActionBar>
  ));

  return (
    <div className={common.pageContent}>
      <ActionBar
        title={'Valgte rettigheter'}
        open={isTestOpen}
        onClick={() => {
          setTestIsOpen(!isTestOpen);
        }}
        additionalText={
          <div className={classes.testText}>
            <FolderFileFillIcon /> 3 tjenester lagt til
          </div>
        }
        actions={
          <Button
            variant='quiet'
            icon={<ChevronRightDoubleCircleFillIcon />}
          >
            Gå videre
          </Button>
        }
        size='large'
        color='light'
      >
        <div className={classes.testContent}>
          <ActionBar
            title='Automatiker'
            color='light'
            size='small'
            actions={<Button variant='quiet'>Angre</Button>}
            open={isTestOpen2}
            onClick={() => {
              setTestIsOpen2(!isTestOpen2);
            }}
          >
            <p>Tester her</p>
          </ActionBar>
          <ActionBar
            title='Brannbilen'
            color='light'
            size='small'
            actions={<Button variant='quiet'>Angre</Button>}
          ></ActionBar>
          <ActionBar
            title='Sverdet i steinen'
            color='light'
            size='small'
            actions={<Button variant='quiet'>Angre</Button>}
          ></ActionBar>
        </div>
      </ActionBar>
      {'tester'}
      <ActionBar
        title={'Valgte rettigheter'}
        open={isTestOpen}
        onClick={() => {
          setTestIsOpen(!isTestOpen);
        }}
        additionalText={
          <div className={classes.testText}>
            <FolderFileFillIcon /> 3 tjenester lagt til
          </div>
        }
        actions={
          <Button
            variant='quiet'
            color='inverted'
            icon={<ChevronRightDoubleCircleFillIcon />}
          >
            Gå videre
          </Button>
        }
        size='large'
        color='dark'
      >
        <div className={classes.testContent}>
          <ActionBar
            title='Automatiker'
            color='dark'
            size='small'
            actions={
              <Button
                color='inverted'
                variant='quiet'
              >
                Angre
              </Button>
            }
          >
            <p>Tester her</p>
          </ActionBar>
          <ActionBar
            title='Brannbilen'
            color='dark'
            size='small'
            actions={
              <Button
                color='inverted'
                variant='quiet'
              >
                Angre
              </Button>
            }
          ></ActionBar>
          <ActionBar
            title='Sverdet i steinen'
            color='dark'
            size='small'
            actions={
              <Button
                color='inverted'
                variant='quiet'
              >
                Angre
              </Button>
            }
          ></ActionBar>
        </div>
      </ActionBar>
      {'tester'}
      <ActionBar
        title={'Valgte rettigheter'}
        open={isTestOpen}
        onClick={() => {
          setTestIsOpen(!isTestOpen);
        }}
        additionalText={
          <div className={classes.testText}>
            <FolderFileFillIcon /> 3 tjenester lagt til
          </div>
        }
        actions={
          <Button
            variant='quiet'
            icon={<ChevronRightDoubleCircleFillIcon />}
          >
            Gå videre
          </Button>
        }
        size='large'
        color='neutral'
      >
        <div className={classes.testContent}>
          <ActionBar
            title='Automatiker'
            color='neutral'
            size='small'
            subtitle='Tester'
            actions={<Button variant='quiet'>Angre</Button>}
            open={isTestOpen2}
            onClick={() => {
              setTestIsOpen2(!isTestOpen2);
            }}
          >
            <p>Tester her</p>
          </ActionBar>
          <ActionBar
            title='Brannbilen'
            color='neutral'
            subtitle='Tester'
            size='small'
            actions={<Button variant='quiet'>Angre</Button>}
          ></ActionBar>
          <ActionBar
            title='Sverdet i steinen'
            color='neutral'
            subtitle='Tester'
            size='small'
            actions={<Button variant='quiet'>Angre</Button>}
          ></ActionBar>
        </div>
      </ActionBar>
      {'tester'}
      <ActionBar
        title={'Valgte rettigheter'}
        open={isTestOpen}
        onClick={() => {
          setTestIsOpen(!isTestOpen);
        }}
        additionalText={
          <div className={classes.testText}>
            <FolderFileFillIcon /> 3 tjenester lagt til
          </div>
        }
        actions={
          <Button
            variant='quiet'
            icon={<ChevronRightDoubleCircleFillIcon />}
          >
            Gå videre
          </Button>
        }
        size='large'
        color='danger'
      >
        <div className={classes.testContent}>
          <ActionBar
            title='Automatiker'
            color='danger'
            size='small'
            subtitle='Tester'
            actions={<Button variant='quiet'>Angre</Button>}
            open={isTestOpen2}
            onClick={() => {
              setTestIsOpen2(!isTestOpen2);
            }}
          >
            <p>Tester her</p>
          </ActionBar>
          <ActionBar
            title='Brannbilen'
            color='danger'
            subtitle='Tester'
            size='small'
            actions={<Button variant='quiet'>Angre</Button>}
          ></ActionBar>
          <ActionBar
            title='Sverdet i steinen'
            color='danger'
            subtitle='Tester'
            size='small'
            actions={<Button variant='quiet'>Angre</Button>}
          ></ActionBar>
        </div>
      </ActionBar>
      {'tester'}
      <ActionBar
        title={'Valgte rettigheter'}
        open={isTestOpen}
        onClick={() => {
          setTestIsOpen(!isTestOpen);
        }}
        additionalText={
          <div className={classes.testText}>
            <FolderFileFillIcon /> 3 tjenester lagt til
          </div>
        }
        actions={
          <Button
            variant='quiet'
            icon={<ChevronRightDoubleCircleFillIcon />}
          >
            Gå videre
          </Button>
        }
        size='large'
        color='warning'
      >
        <div className={classes.testContent}>
          <ActionBar
            title='Automatiker'
            color='warning'
            size='small'
            subtitle='Tester'
            actions={<Button variant='quiet'>Angre</Button>}
            open={isTestOpen2}
            onClick={() => {
              setTestIsOpen2(!isTestOpen2);
            }}
          >
            <p>Tester her</p>
          </ActionBar>
          <ActionBar
            title='Brannbilen'
            color='warning'
            subtitle='Tester'
            size='small'
            actions={<Button variant='quiet'>Angre</Button>}
          ></ActionBar>
          <ActionBar
            title='Sverdet i steinen'
            color='warning'
            subtitle='Tester'
            size='small'
            actions={<Button variant='quiet'>Angre</Button>}
          ></ActionBar>
        </div>
      </ActionBar>
      {'tester'}
      <ActionBar
        title={'Valgte rettigheter'}
        open={isTestOpen}
        onClick={() => {
          setTestIsOpen(!isTestOpen);
        }}
        additionalText={
          <div className={classes.testText}>
            <FolderFileFillIcon /> 3 tjenester lagt til
          </div>
        }
        actions={
          <Button
            variant='quiet'
            icon={<ChevronRightDoubleCircleFillIcon />}
          >
            Gå videre
          </Button>
        }
        size='large'
        color='success'
      >
        <div className={classes.testContent}>
          <ActionBar
            title='Automatiker'
            color='success'
            size='small'
            subtitle='Tester'
            actions={<Button variant='quiet'>Angre</Button>}
            open={isTestOpen2}
            onClick={() => {
              setTestIsOpen2(!isTestOpen2);
            }}
          >
            <p>Tester her</p>
          </ActionBar>
          <ActionBar
            title='Brannbilen'
            color='success'
            subtitle='Tester'
            size='small'
            actions={<Button variant='quiet'>Angre</Button>}
          ></ActionBar>
          <ActionBar
            title='Sverdet i steinen'
            color='success'
            subtitle='Tester'
            size='small'
            actions={<Button variant='quiet'>Angre</Button>}
          ></ActionBar>
        </div>
      </ActionBar>
      <div className={classes.overviewActionBarContainer}>
        {!isSm && <h2 className={classes.pageContentText}>{overviewText}</h2>}
        {layout === LayoutState.Offered && (
          <div className={classes.delegateNewButton}>
            <Button
              variant={ButtonVariant.Outline}
              onClick={goToStartDelegation}
              icon={<Add />}
              fullWidth={isSm}
            >
              {t('api_delegation.delegate_new_org')}
            </Button>
          </div>
        )}
        <SelectionBar
          title={'Valgte rettigheter'}
          color='success'
          collection={testCollectionActionBars}
          compact={isSm}
        ></SelectionBar>
        <Panel
          title={t('api_delegation.card_title')}
          forceMobileLayout={isSm}
          showIcon={!isSm}
        >
          {t('api_delegation.api_panel_content')}{' '}
          <a
            className={classes.link}
            href='https://samarbeid.digdir.no/maskinporten/maskinporten/25'
            target='_blank'
            rel='noreferrer'
          >
            {t('common.maskinporten')}
          </a>
        </Panel>
        <div className={classes.explanatoryContainer}>
          {overviewOrgs.length > 0 && (
            <>
              {isSm ? (
                <h3 className={classes.apiSubheading}>{accessesHeader}</h3>
              ) : (
                <h2 className={classes.apiSubheading}>{accessesHeader}</h2>
              )}
              <div className={classes.editButton}>
                {!isEditable ? (
                  <Button
                    variant={ButtonVariant.Quiet}
                    icon={<Edit />}
                    onClick={handleSetIsEditable}
                    size={ButtonSize.Small}
                  >
                    {t('api_delegation.edit_accesses')}
                  </Button>
                ) : (
                  <Button
                    variant={ButtonVariant.Quiet}
                    icon={<Error />}
                    onClick={handleSetIsEditable}
                    size={ButtonSize.Small}
                  >
                    {t('api_delegation.cancel')}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
        <>{activeDelegations()}</>
        {isEditable && (
          <div className={classes.saveSection}>
            <Button
              disabled={saveDisabled}
              onClick={handleSave}
              color={ButtonColor.light}
              fullWidth={isSm}
            >
              {t('api_delegation.save')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
