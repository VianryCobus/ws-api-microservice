import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { LoggerHelperService } from "../helper";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    private loggerHelperService: LoggerHelperService,
  ){}
  use(req: Request, res: Response, next: NextFunction) {
    this.loggerHelperService.debugLog(
      `Log from middleware`,
      {
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers,
        originalUrl: req.originalUrl,
        // response: res,
      }
    );
    // console.log(req.query);
    // console.log(req.originalUrl);
    next();
  }
}