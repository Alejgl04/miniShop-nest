import { Injectable, InternalServerErrorException, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

import { validate as isUUID } from 'uuid'; 
import { ProductImage,Product } from './entities';

@Injectable()
export class ProductsService {
  
  private readonly logger = new Logger('ProductsService')
  constructor(

    @InjectRepository(Product)
    private readonly productRespository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productRespositoryImage: Repository<ProductImage>,

    private readonly dataSource: DataSource
  
  ) {}

  async create(createProductDto: CreateProductDto) {

    try {
      const { images = [], ...productsDetail } = createProductDto;
      const product = this.productRespository.create({
        ...productsDetail,
        images: images.map( image => this.productRespositoryImage.create({ url: image }))
      });

      await this.productRespository.save( product );

      return { ...product, images};

    } catch (error) {
      this.handleDbExceptions( error );      
    }
  }

  async findAll( pagination: PaginationDto) {

    const { limit = 10, offset = 0} = pagination;

    const products = await this.productRespository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    });

    return products.map( product => ({
      ...product,
      images: product.images.map( img => img.url )
    }))
  }

  async findOne( term: string) {
    
    let product: Product;

    if ( isUUID(term) ) {
      product = await this.productRespository.findOneBy({ id: term });
    }
    else{
      const queryBuilder = this.productRespository.createQueryBuilder('prod');
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images','prodImages')
        .getOne();
    }

    if ( !product ) {
      throw new NotFoundException(`Product with id ${ term } not found`);
    }

    return product;
    
  }

  async findOnePlain( term: string ){
    const { images = [], ...rest } = await this.findOne( term );

    return {
      ...rest,
      images:images.map( image => image.url )
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRespository.preload({ id, ...toUpdate });

    if( !product ) throw new NotFoundException(`Product with id: ${id} not found`);

    /** create query runner */
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      if ( images ) {
        await queryRunner.manager.delete( ProductImage, { product: { id } } )
        product.images = images.map( img => this.productRespositoryImage.create({ url: img }));
      }

      await queryRunner.manager.save( product );
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain( id );
      
    } catch (error) {
      
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDbExceptions( error );
    
    }
  }

  async remove(id: string) {

    const product = await this.findOne( id );
    await this.productRespository.remove(product);
    
  }

  async deleteAllProducts() {
    const query = this.productRespository.createQueryBuilder('product');
    
    try {
      return await query
                   .delete()
                   .where({})
                   .execute();

    } catch (error) {
      this.handleDbExceptions( error );
    }
  }


  private handleDbExceptions( error: any ) {
    if ( error.code === '23505' )
      throw new BadRequestException(error.detail);
    
    this.logger.error( error );
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
