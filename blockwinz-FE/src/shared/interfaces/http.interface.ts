export interface HttpError{
    errorMessage: string;
    status: number;
    createdBy: string;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  statusText: string;
}