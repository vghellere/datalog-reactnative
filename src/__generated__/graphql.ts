/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** An ISO 8601-encoded datetime */
  ISO8601DateTime: { input: any; output: any; }
};

/** Attributes for creating a TemperatureSample */
export type CreateTemperatureSampleInput = {
  eventTimestamp: Scalars['ISO8601DateTime']['input'];
  value: Scalars['Float']['input'];
};

export type CreateTemperatureSamplesMutationVariables = Exact<{
  samples: Array<CreateTemperatureSampleInput> | CreateTemperatureSampleInput;
}>;


export type CreateTemperatureSamplesMutation = { __typename?: 'Mutation', createTemperatureSamples: Array<{ __typename?: 'TemperatureSample', id: string }> };

export type GetTemperatureSamplesQueryVariables = Exact<{
  nSamples: Scalars['Int']['input'];
}>;


export type GetTemperatureSamplesQuery = { __typename?: 'Query', temperatureSamples: Array<{ __typename?: 'TemperatureSample', id: string, value: number, eventTimestamp: any }> };


export const CreateTemperatureSamplesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTemperatureSamples"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"samples"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTemperatureSampleInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTemperatureSamples"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"temperatureSamples"},"value":{"kind":"Variable","name":{"kind":"Name","value":"samples"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateTemperatureSamplesMutation, CreateTemperatureSamplesMutationVariables>;
export const GetTemperatureSamplesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTemperatureSamples"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nSamples"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"temperatureSamples"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"nSamples"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nSamples"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"eventTimestamp"}}]}}]}}]} as unknown as DocumentNode<GetTemperatureSamplesQuery, GetTemperatureSamplesQueryVariables>;