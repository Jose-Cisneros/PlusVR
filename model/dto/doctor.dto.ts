import { IsString } from 'class-validator';

class DoctorDto {
  @IsString()
  public speciality: String;
}

export default DoctorDto;
