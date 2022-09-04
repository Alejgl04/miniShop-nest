import { Injectable, InternalServerErrorException, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

import { Product } from './entities/product.entity';
import { validate as isUUID } from 'uuid'; 

@Injectable()
export class ProductsService {
  
  private readonly logger = new Logger('ProductsService')
  constructor(

    @InjectRepository(Product)
    private readonly productRespository: Repository<Product>,
  
  ) {}

  async create(createProductDto: CreateProductDto) {

    try {

      const product = this.productRespository.create( createProductDto );
      await this.productRespository.save( product );

      return product;

    } catch (error) {
      this.handleDbExceptions( error );      
    }
  }

  findAll( pagination: PaginationDto) {

    const { limit = 10, offset = 0} = pagination;

    return this.productRespository.find({
      take: limit,
      skip: offset,
      //TODO: relations
    });
  }

  async findOne( term: string) {
    
    let product: Product;

    if ( isUUID(term) ) {
      product = await this.productRespository.findOneBy({ id: term });
    }
    else{
      const queryBuilder = this.productRespository.createQueryBuilder();
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        }).getOne();
    }

    if ( !product ) {
      throw new NotFoundException(`Product with id ${ term } not found`);
    }

    return product;
    
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {

    const product = await this.findOne( id );
    await this.productRespository.remove(product);
    
  }

  private handleDbExceptions( error: any ) {
    if ( error.code === '23505' )
      throw new BadRequestException(error.detail);
    
    this.logger.error( error );
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
