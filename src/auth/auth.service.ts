import { Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { LoginDto,CreateUserDto } from './dto';
import { User } from './entities/user.entity';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';


@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService:JwtService
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

      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      };
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

    const { id, ...data } = user;
    return {
      ...data,
      token: this.getJwtToken({ id: user.id })
    };
  }

  
  async checkAuthStatus( user: User ) {

    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };    
  }

  private getJwtToken( payload: JwtPayload  ) {
    
    const token = this.jwtService.sign( payload );
    return token;

  }

  private handleDBErros( error: any ): never {
    if ( error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    console.log(error);
    throw new InternalServerErrorException("Checks server logs")
  }  
}
