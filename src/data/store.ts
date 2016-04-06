import {
  ApolloAction,
  isQueryResultAction,
  isMutationResultAction,
} from '../actions';

import {
  writeSelectionSetToStore,
} from './writeToStore';

import {
  assign,
} from 'lodash';

import {
  QueryStore,
} from '../queries/store';

import {
  MutationStore,
} from '../mutations/store';

export interface NormalizedCache {
  [dataId: string]: StoreObject;
}

export interface StoreObject {
  __typename?: string;
  [storeFieldKey: string]: StoreValue;
}

export type StoreValue = number | string | string[];

export function data(
  previousState: NormalizedCache = {},
  action: ApolloAction,
  queries: QueryStore,
  mutations: MutationStore
): NormalizedCache {
  if (isQueryResultAction(action)) {
    // XXX handle partial result due to errors
    if (!action.result.errors) {
      const queryStoreValue = queries[action.queryId];

      // XXX use immutablejs instead of cloning
      const clonedState = assign({}, previousState) as NormalizedCache;

      const newState = writeSelectionSetToStore({
        result: action.result.data,
        dataId: queryStoreValue.query.id,
        selectionSet: queryStoreValue.query.selectionSet,
        variables: queryStoreValue.variables,
        store: clonedState,
      });

      return newState;
    }
  } else if (isMutationResultAction(action)) {
    // Incorporate the result from this mutation into the store
    if (!action.result.errors) {
      const queryStoreValue = mutations[action.mutationId];

      // XXX use immutablejs instead of cloning
      const clonedState = assign({}, previousState) as NormalizedCache;

      const newState = writeSelectionSetToStore({
        result: action.result.data,
        dataId: queryStoreValue.mutation.id,
        selectionSet: queryStoreValue.mutation.selectionSet,
        variables: queryStoreValue.variables,
        store: clonedState,
      });

      return newState;
    }
  }

  return previousState;
}
