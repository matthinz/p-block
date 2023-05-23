import { ParserMethods } from "../shared/types";

export interface FluentMeasurableParserMethods<
  T extends { length: number },
  ParserType
> extends ParserMethods<T> {
  /**
   * @returns A Parser that verifies its input has a length of exactly <length>.
   */
  length(length: number): ParserType;

  /**
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A Parser that verifies its input has a length of exactly <length>.
   */
  length(length: number, errorCode: string, errorMessage?: string): ParserType;

  /**
   * @param max
   * @returns A Parser that verifies its input has a length of no more than `max`
   */
  maxLength(max: number): ParserType;

  /**
   * @param max
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A Parser that verifies its input has a length of no more than `max`
   */
  maxLength(max: number, errorCode?: string, errorMessage?: string): ParserType;

  /**
   * @param min
   * @returns A Parser that verifies its input has a length greater than `min`
   */
  minLength(min: number): ParserType;

  /**
   * @param min
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A Parser that verifies its input has a length greater than `min`
   */
  minLength(min: number, errorCode?: string, errorMessage?: string): ParserType;

  /**
   * (This is an alias for .minLength(1).)
   */
  notEmpty(): ParserType;

  /**
   * (This is an alias for .minLength(1).)
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   */
  notEmpty(errorCode: string, errorMessage?: string): ParserType;
}
