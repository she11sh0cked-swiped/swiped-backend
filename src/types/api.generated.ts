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
  votes?: Maybe<Array<Maybe<UserVotesInput>>>;
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
  /** Update one document: 1) Retrieve one document by findById. 2) Apply updates to mongoose document. 3) Mongoose applies defaults, setters, hooks and validation. 4) And save it. */
  user_vote?: Maybe<UpdateByIduserPayload>;
  /** Create one document with mongoose defaults, setters, hooks and validation */
  group_createOne?: Maybe<CreateOnegroupPayload>;
  /** Update one document: 1) Retrieve one document by findById. 2) Apply updates to mongoose document. 3) Mongoose applies defaults, setters, hooks and validation. 4) And save it. */
  group_joinById?: Maybe<UpdateByIdgroupPayload>;
  /** Update one document: 1) Retrieve one document by findById. 2) Apply updates to mongoose document. 3) Mongoose applies defaults, setters, hooks and validation. 4) And save it. */
  group_leaveById?: Maybe<UpdateByIdgroupPayload>;
  /** Update one document: 1) Retrieve one document by findById. 2) Apply updates to mongoose document. 3) Mongoose applies defaults, setters, hooks and validation. 4) And save it. */
  group_updateById?: Maybe<UpdateByIdgroupPayload>;
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


export type MutationUser_VoteArgs = {
  votes: Array<UserVotesInput>;
};


export type MutationGroup_CreateOneArgs = {
  record: CreateOnegroupInput;
};


export type MutationGroup_JoinByIdArgs = {
  _id: Scalars['MongoID'];
};


export type MutationGroup_LeaveByIdArgs = {
  _id: Scalars['MongoID'];
};


export type MutationGroup_UpdateByIdArgs = {
  _id: Scalars['MongoID'];
  record: UpdateByIdgroupInput;
};

export type Query = {
  __typename?: 'Query';
  user_findMe?: Maybe<User>;
  group_findById?: Maybe<Group>;
  media_findById?: Maybe<Media>;
  media_findByIds?: Maybe<Array<Maybe<Media>>>;
  media_recommendations?: Maybe<Array<Maybe<Media>>>;
};


export type QueryGroup_FindByIdArgs = {
  _id: Scalars['MongoID'];
};


export type QueryMedia_FindByIdArgs = {
  media: MediaKeyInput;
};


export type QueryMedia_FindByIdsArgs = {
  media: Array<MediaKeyInput>;
};


export type QueryMedia_RecommendationsArgs = {
  count: Scalars['Int'];
};

export type RuntimeError = ErrorInterface & {
  __typename?: 'RuntimeError';
  /** Runtime error message */
  message?: Maybe<Scalars['String']>;
};

export type UpdateByIdgroupInput = {
  membersId?: Maybe<Array<Maybe<Scalars['MongoID']>>>;
  name?: Maybe<Scalars['String']>;
  ownerId?: Maybe<Scalars['MongoID']>;
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

export type UpdateByIduserPayload = {
  __typename?: 'UpdateByIduserPayload';
  /** Document ID */
  recordId?: Maybe<Scalars['MongoID']>;
  /** Updated document */
  record?: Maybe<User>;
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
  matches: Array<Match>;
};

export type Match = {
  __typename?: 'match';
  count?: Maybe<Scalars['Int']>;
  media: Media;
};

export type Media = {
  backdrop_path?: Maybe<Scalars['String']>;
  genre_ids?: Maybe<Array<Maybe<Scalars['Int']>>>;
  original_language?: Maybe<Scalars['String']>;
  overview?: Maybe<Scalars['String']>;
  popularity?: Maybe<Scalars['Float']>;
  poster_path?: Maybe<Scalars['String']>;
  vote_average?: Maybe<Scalars['Float']>;
  vote_count?: Maybe<Scalars['Int']>;
  id: Scalars['Int'];
  media_type: Media_Type;
};

export type MediaKey = {
  __typename?: 'mediaKey';
  id: Scalars['Int'];
  media_type: Media_Type;
};

export type MediaKeyInput = {
  id: Scalars['Int'];
  media_type: Media_Type;
};

export enum Media_Type {
  Movie = 'movie',
  Tv = 'tv'
}

export type Movie = Media & {
  __typename?: 'movie';
  adult?: Maybe<Scalars['Boolean']>;
  original_title?: Maybe<Scalars['String']>;
  release_date?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  video?: Maybe<Scalars['Boolean']>;
  backdrop_path?: Maybe<Scalars['String']>;
  genre_ids?: Maybe<Array<Maybe<Scalars['Int']>>>;
  original_language?: Maybe<Scalars['String']>;
  overview?: Maybe<Scalars['String']>;
  popularity?: Maybe<Scalars['Float']>;
  poster_path?: Maybe<Scalars['String']>;
  vote_average?: Maybe<Scalars['Float']>;
  vote_count?: Maybe<Scalars['Int']>;
  id: Scalars['Int'];
  media_type: Media_Type;
};

export type Token = {
  __typename?: 'token';
  token: Scalars['String'];
};

export type Tv = Media & {
  __typename?: 'tv';
  first_air_date?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  origin_country?: Maybe<Scalars['String']>;
  original_name?: Maybe<Scalars['String']>;
  backdrop_path?: Maybe<Scalars['String']>;
  genre_ids?: Maybe<Array<Maybe<Scalars['Int']>>>;
  original_language?: Maybe<Scalars['String']>;
  overview?: Maybe<Scalars['String']>;
  popularity?: Maybe<Scalars['Float']>;
  poster_path?: Maybe<Scalars['String']>;
  vote_average?: Maybe<Scalars['Float']>;
  vote_count?: Maybe<Scalars['Int']>;
  id: Scalars['Int'];
  media_type: Media_Type;
};

export type User = {
  __typename?: 'user';
  username: Scalars['String'];
  votes: Array<Vote>;
  _id: Scalars['MongoID'];
  groupsId: Array<Maybe<Scalars['MongoID']>>;
  groups: Array<Maybe<Group>>;
};

export type UserVotesInput = {
  like?: Maybe<Scalars['Boolean']>;
  mediaId?: Maybe<UserVotesMediaIdInput>;
};

export type UserVotesMediaIdInput = {
  id?: Maybe<Scalars['Float']>;
  media_type?: Maybe<Scalars['String']>;
};

export type Vote = {
  __typename?: 'vote';
  like: Scalars['Boolean'];
  mediaId: MediaKey;
  media?: Maybe<Media>;
};
