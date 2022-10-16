import { IsString, MinLength } from "class-validator";

export class MessageClient {
  @IsString()
  @MinLength(2)
  message: string;
}