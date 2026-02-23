import { ResourceListItemResource } from './types';

export const extractResourceName = (resource: ResourceListItemResource): string => {
  if ('name' in resource && typeof resource.name === 'string' && resource.name.trim().length > 0) {
    return resource.name;
  }

  if ('title' in resource && typeof resource.title === 'string') {
    return resource.title;
  }

  if (
    'resourceName' in resource &&
    typeof (resource as { resourceName?: string }).resourceName === 'string'
  ) {
    return (resource as { resourceName?: string }).resourceName ?? '';
  }

  return '';
};

export const extractOwnerName = (resource: ResourceListItemResource): string => {
  if ('provider' in resource && resource.provider?.name) {
    return resource.provider.name;
  }

  if ('resourceOwnerName' in resource && resource.resourceOwnerName) {
    return resource.resourceOwnerName;
  }

  return '';
};

export const extractDescription = (resource: ResourceListItemResource): string => {
  if ('description' in resource && typeof resource.description === 'string') {
    return resource.description;
  }

  return '';
};

export const extractOrgCode = (resource: ResourceListItemResource): string => {
  if ('provider' in resource && resource.provider?.code) {
    return resource.provider.code;
  }

  if ('resourceOwnerOrgcode' in resource && resource.resourceOwnerOrgcode) {
    return resource.resourceOwnerOrgcode;
  }

  return '';
};

export const extractLogoUrl = (resource: ResourceListItemResource): string | undefined => {
  if ('provider' in resource && resource.provider?.logoUrl) {
    return resource.provider.logoUrl;
  }

  if ('resourceOwnerLogoUrl' in resource && resource.resourceOwnerLogoUrl) {
    return resource.resourceOwnerLogoUrl;
  }

  return undefined;
};

export const extractLogoAlt = (resource: ResourceListItemResource): string | undefined =>
  extractOwnerName(resource);

export const extractResourceId = (resource: ResourceListItemResource): string | undefined => {
  if ('id' in resource && resource.id) {
    return resource.id;
  }

  if ('identifier' in resource && resource.identifier) {
    return resource.identifier;
  }

  return undefined;
};
