import { join } from 'path';
import { existsSync } from 'fs';

import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FilesService {

  getStaticProductImage( ImageName: string ) {

    const path = join(__dirname, `../../static/products`, ImageName );

    if( !existsSync(path) ){

      throw new BadRequestException(`No product found with image ${ImageName}`);
      
    }
    return path; 

  }

}
