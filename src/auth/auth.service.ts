import { Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { LoginDto,CreateUserDto } from './dto';
import { User } from './entities/user.entity';



@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}

  async create(CreateUserDto: CreateUserDto) {

    try {
      const {password, ...userData } = CreateUserDto 

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync( password, 10)
      });
      await this.userRepository.save( user );
      delete user.password;

      return user;

    } catch (error) {
      this.handleDBErros(error);
    }
  }

  async login(LoginUserDto: LoginDto) {
    const { email, password } = LoginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, email: true, password: true }
    });

    if ( !user ) {
      throw new UnauthorizedException('Credentials are not valid (email)');
    }

    if ( !bcrypt.compareSync( password, user.password ) )
      throw new UnauthorizedException('Credentials are not valid (password)');

    return user;
  }

  private handleDBErros( error: any ): never {
    if ( error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    console.log(error);
    throw new InternalServerErrorException("Checks server logs")
  }  
}
