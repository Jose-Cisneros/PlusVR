import { IsString, IsDate, IsNumber } from 'class-validator';

class PersonDto {
  @IsString()
  public firstName: String;
  @IsString()
  public lastName: String;
  @IsDate()
  public birthDate: Date;
  @IsNumber()
  public dni: Number;
  @IsNumber()
  public phone: Number;
}

export default PersonDto;
