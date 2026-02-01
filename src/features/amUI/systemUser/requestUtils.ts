import { ProblemDetail } from './types';

export const getApiBaseUrl = (): string => {
  return `${import.meta.env.BASE_URL}accessmanagement/api/v1/systemuser`;
};
