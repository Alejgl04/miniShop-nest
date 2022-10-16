import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket,Server } from 'socket.io';
import { MessageWsService } from './message-ws.service';
import { MessageClient } from './dto/message-client.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces'

@WebSocketGateway({ cors: true })
export class MessageWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;

  constructor(
    private readonly messageWsService: MessageWsService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: Socket) {

    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload
    
    try {
      payload = this.jwtService.verify( token );
      await this.messageWsService.registerClient( client, payload.id );

    } catch (error) {
      client.disconnect();
      return; 
    }

    
    this.wss.emit('update-clients', this.messageWsService.getConnectedClients());

  }

  handleDisconnect(client: Socket) {

    this.messageWsService.removeClient( client.id );
    this.wss.emit('update-clients', this.messageWsService.getConnectedClients());
  
  }
  /** message-form-client */
  @SubscribeMessage('message-from-client')
  handleMessageFromClient( client: Socket, payload: MessageClient ){

    this.wss.emit('message-from-server', {

      fullName: this.messageWsService.getUserFullName(client.id),
      message: payload.message

    }); 
  }



}
