/**
 * Common type definitions for M31-Agents
 */

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type Result<T, E = Error> = Success<T> | Failure<E>;

export interface Success<T> {
  success: true;
  value: T;
}

export interface Failure<E> {
  success: false;
  error: E;
}

export interface Disposable {
  dispose(): void;
}

export type DeepPartial<T> = T extends object 
  ? { [P in keyof T]?: DeepPartial<T[P]> } 
  : T;

export type AsyncFunction<T = any, R = any> = (...args: T[]) => Promise<R>;

export type SyncFunction<T = any, R = any> = (...args: T[]) => R;

export interface KeyValuePair<K = string, V = any> {
  key: K;
  value: V;
}

export interface NameValuePair {
  name: string;
  value: any;
}

export interface LabelValuePair {
  label: string;
  value: any;
}

export type Dict<T = any> = { [key: string]: T };

export interface IdObject {
  id: string;
}

export type WithId<T> = T & IdObject;

export interface TimestampObject {
  createdAt: Date;
  updatedAt: Date;
}

export type WithTimestamp<T> = T & TimestampObject;

export type ID = string;

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info', 
  WARN = 'warn',
  ERROR = 'error'
}

export enum TaskStatus {
  IDLE = 'idle',
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error'
}

export interface RequestOptions {
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  totalCount?: number;
  totalPages?: number;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export type SortDirection = 'asc' | 'desc'; 