import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Auth, GetUser, RawHeaders } from './decorators/';
import { RoleProtected } from './decorators/role-protected.decorator';
import { LoginDto, CreateUserDto } from './dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces';



@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-auth-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ){
    return this.authService.checkAuthStatus( user )
  }
  

  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
    
    // @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: User,
    @RawHeaders() rawHeaders: string[]
    
  ){
    return {
      ok: true,
      user,
      userEmail,
      rawHeaders
    }
  }

  @Get('privateAuth')
  @RoleProtected( ValidRoles.superuser, ValidRoles.user )
  @UseGuards( AuthGuard(), UserRoleGuard )
  private_auth(
    @GetUser() user: User,
  ){
    return {
      ok:true,
      user
    }
  }

  @Get('privateAuth2')
  @Auth( ValidRoles.admin, ValidRoles.superuser )
  private_auth2(
    @GetUser() user: User,
  ){
    return {
      ok:true,
      user
    }
  }

}
