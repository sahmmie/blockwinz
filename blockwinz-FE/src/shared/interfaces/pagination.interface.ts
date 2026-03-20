export interface PaginatedDataI<T> {
  result: T[];
  total: number;
  page: number;
  pages: number[];
  sort?: string;
}
