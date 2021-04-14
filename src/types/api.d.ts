export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
import { ObjectID } from 'mongodb';
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any;
  /** The `ID` scalar type represents a unique MongoDB identifier in collection. MongoDB by default use 12-byte ObjectId value (https://docs.mongodb.com/manual/reference/bson-types/#objectid). But MongoDB also may accepts string or integer as correct values for _id field. */
  MongoID: ObjectID;
};









export type CreateOneuserInput = {
  username: Scalars['String'];
  password: Scalars['String'];
};

export type CreateOneuserPayload = {
  __typename?: 'CreateOneuserPayload';
  /** Document ID */
  recordId?: Maybe<Scalars['MongoID']>;
  /** Created document */
  record?: Maybe<User>;
  /** Error that may occur during operation. If you request this field in GraphQL query, you will receive typed error in payload; otherwise error will be provided in root `errors` field of GraphQL response. */
  error?: Maybe<ErrorInterface>;
};

export type ErrorInterface = {
  /** Generic error message */
  message?: Maybe<Scalars['String']>;
};


export type MongoError = ErrorInterface & {
  __typename?: 'MongoError';
  /** MongoDB error message */
  message?: Maybe<Scalars['String']>;
  /** MongoDB error code */
  code?: Maybe<Scalars['Int']>;
};


export type Mutation = {
  __typename?: 'Mutation';
  user_login?: Maybe<UserToken>;
  /** Create one document with mongoose defaults, setters, hooks and validation */
  user_register?: Maybe<CreateOneuserPayload>;
};


export type MutationUser_LoginArgs = {
  password: Scalars['String'];
  username: Scalars['String'];
};


export type MutationUser_RegisterArgs = {
  record: CreateOneuserInput;
};

export type Query = {
  __typename?: 'Query';
  user_findMe?: Maybe<User>;
};

export type RuntimeError = ErrorInterface & {
  __typename?: 'RuntimeError';
  /** Runtime error message */
  message?: Maybe<Scalars['String']>;
};

export type ValidationError = ErrorInterface & {
  __typename?: 'ValidationError';
  /** Combined error message from all validators */
  message?: Maybe<Scalars['String']>;
  /** List of validator errors */
  errors?: Maybe<Array<ValidatorError>>;
};

export type ValidatorError = {
  __typename?: 'ValidatorError';
  /** Validation error message */
  message?: Maybe<Scalars['String']>;
  /** Source of the validation error from the model path */
  path?: Maybe<Scalars['String']>;
  /** Field value which occurs the validation error */
  value?: Maybe<Scalars['JSON']>;
  /** Input record idx in array which occurs the validation error. This `idx` is useful for createMany operation. For singular operations it always be 0. For *Many operations `idx` represents record index in array received from user. */
  idx: Scalars['Int'];
};

export type User = {
  __typename?: 'user';
  username: Scalars['String'];
  _id: Scalars['MongoID'];
};

export type UserToken = {
  __typename?: 'userToken';
  token: Scalars['String'];
};

export type AdditionalEntityFields = {
  path?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
};
