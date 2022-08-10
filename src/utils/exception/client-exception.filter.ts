import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class ClientExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const message = typeof exception["response"]["message"] == "object" ? exception["response"]["message"][0] : exception["response"]["message"];

    response
      .status(status)
      .json({
        code: 1,
        message,
        // timestamp: new Date().toISOString(),
        // path: request.url,
      })
  }
}