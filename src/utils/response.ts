import { Response } from "express";

export function ok<T>(res: Response, data: T): void {
  res.json({ data });
}

export function created<T>(res: Response, data: T): void {
  res.status(201).json({ data });
}

export function noContent(res: Response): void {
  res.status(204).send();
}
