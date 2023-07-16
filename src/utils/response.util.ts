import { Response } from "express";

interface IResponse {
  res: Response;
  status?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  message?: string;
}

export function successResponse({
  res,
  status = 200,
  data,
}: IResponse): Response {
  if (data) {
    return res.status(status).json({ success: true, ...data });
  } else {
    return failureResponse({ res, status, message: "NOT_FOUND_DATA" });
  }
}

export function failureResponse({
  res,
  status = 500,
  message = "INTERNAL_SERVER_ERROR",
}: IResponse): Response {
  return res.status(status).json({ success: false, message });
}
