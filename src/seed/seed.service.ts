import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService
  ) {}

  async runSeed() {
    await this.insertManyProducts();

    return 'seed executed';
  }

  
  private async insertManyProducts() {

    await this.productService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach( product => {

      insertPromises.push( this.productService.create( product ) );

    });

    await Promise.all( insertPromises );

    return true;

  }  
}
