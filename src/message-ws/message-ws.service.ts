import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';

interface connectedClientsIn {
  [id: string]: {
    socket:Socket,
    user: User
  }
}

@Injectable()
export class MessageWsService {
  
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ){}

  private connectedClients: connectedClientsIn = {};
  
  async registerClient( client: Socket, userId: string ) {
    
    const user = await this.userRepository.findOneBy({ id: userId })
    if ( !user ) throw new Error('User not found'); 
    if ( !user.isActive ) throw new Error('User not active'); 

    this.connectedClients[client.id] = {
      socket: client,
      user: user
    };
  }

  removeClient( clientId: string ) {
    console.log(clientId);
    delete this.connectedClients[clientId];
  }

  getConnectedClients(): string[] {
    return Object.keys( this.connectedClients );
  }

  getUserFullName( socketId: string ){

    return this.connectedClients[socketId].user.fullName;
  }

}