import { ObjectID } from 'mongodb'
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
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

export type CreateOnegroupInput = {
  membersId?: Maybe<Array<Maybe<Scalars['MongoID']>>>;
  name: Scalars['String'];
};

export type CreateOnegroupPayload = {
  __typename?: 'CreateOnegroupPayload';
  /** Document ID */
  recordId?: Maybe<Scalars['MongoID']>;
  /** Created document */
  record?: Maybe<Group>;
  /** Error that may occur during operation. If you request this field in GraphQL query, you will receive typed error in payload; otherwise error will be provided in root `errors` field of GraphQL response. */
  error?: Maybe<ErrorInterface>;
};

export type CreateOneuserInput = {
  username: Scalars['String'];
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
  /** Create one document with mongoose defaults, setters, hooks and validation */
  user_createOne?: Maybe<CreateOneuserPayload>;
  user_login?: Maybe<Token>;
  /** Create one document with mongoose defaults, setters, hooks and validation */
  group_createOne?: Maybe<CreateOnegroupPayload>;
  /** Update one document: 1) Retrieve one document by findById. 2) Apply updates to mongoose document. 3) Mongoose applies defaults, setters, hooks and validation. 4) And save it. */
  group_joinById?: Maybe<UpdateByIdgroupPayload>;
};


export type MutationUser_CreateOneArgs = {
  record: CreateOneuserInput;
  confirmPassword: Scalars['String'];
  password: Scalars['String'];
};


export type MutationUser_LoginArgs = {
  password: Scalars['String'];
  username: Scalars['String'];
};


export type MutationGroup_CreateOneArgs = {
  record: CreateOnegroupInput;
};


export type MutationGroup_JoinByIdArgs = {
  _id: Scalars['MongoID'];
};

export type Query = {
  __typename?: 'Query';
  user_findMe?: Maybe<User>;
  group_findById?: Maybe<Group>;
};


export type QueryGroup_FindByIdArgs = {
  _id: Scalars['MongoID'];
};

export type RuntimeError = ErrorInterface & {
  __typename?: 'RuntimeError';
  /** Runtime error message */
  message?: Maybe<Scalars['String']>;
};

export type UpdateByIdgroupPayload = {
  __typename?: 'UpdateByIdgroupPayload';
  /** Document ID */
  recordId?: Maybe<Scalars['MongoID']>;
  /** Updated document */
  record?: Maybe<Group>;
  /** Error that may occur during operation. If you request this field in GraphQL query, you will receive typed error in payload; otherwise error will be provided in root `errors` field of GraphQL response. */
  error?: Maybe<ErrorInterface>;
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

export type Group = {
  __typename?: 'group';
  membersId?: Maybe<Array<Maybe<Scalars['MongoID']>>>;
  name: Scalars['String'];
  ownerId: Scalars['MongoID'];
  _id: Scalars['MongoID'];
  owner?: Maybe<User>;
  members: Array<Maybe<User>>;
};

export type Token = {
  __typename?: 'token';
  token: Scalars['String'];
};

export type User = {
  __typename?: 'user';
  username: Scalars['String'];
  _id: Scalars['MongoID'];
  groupsId: Array<Maybe<Scalars['MongoID']>>;
  groups: Array<Maybe<Group>>;
};
