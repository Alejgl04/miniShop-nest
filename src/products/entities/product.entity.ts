import { User } from '../../auth/entities/user.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductImage } from './product-image.entity';
import { ApiProperty } from '@nestjs/swagger';


@Entity({ name: 'products' })
export class Product {
  @ApiProperty({
    example: '3294cfd1-27bd-4144-828d-b0a8e3c42beb',
    description: 'Product ID',
    uniqueItems: true
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**TITLE */
  @ApiProperty({
    example: 'T-Shirt Teslo',
    description: 'Title',
    uniqueItems: true
  })
  @Column('text', {
    unique: true
  })
  title: string;

  /**PRICE */
  @ApiProperty({
    example: 0,
    description: 'Product price',
  })
  @Column('float', {
    default: 0
  })
  price: number

  /**DESCRIPTION */
  @ApiProperty({
    example: 'Lorem ipsu text example string',
    description: 'Product description',
    default: null
  })
  @Column({
    type: 'text',
    nullable: true
  })
  description: string;
  
  /**SLUG */
  @ApiProperty({
    example: 't-shirt-teslo',
    description: 'Product SLUG',
    uniqueItems: true
  })
  @Column('text', {
    unique:true
  })
  slug: string;

  /**STOCK */
  @ApiProperty({
    example: 10,
    description: 'Product STOCK',
    default: 0
  })
  @Column('int', {
    default: 0
  })
  stock: number;
  
  /**SIZES */
  @ApiProperty({
    example: ["XS","S","M"],
    description: 'Product sizes',
  })
  @Column('text', {
    array: true
  })
  sizes: string[];

  /***GENDER*****/
  @ApiProperty({
    example: 'women',
    description: 'Product gender',
  })  
  @Column('text')
  gender: string;

  /**TAGS */
  @ApiProperty()
  @Column('text', {
    array: true,
    default: []
  })
  tags: string[];
  
  @ApiProperty()
  @OneToMany(
    () => ProductImage,
    (productImage) => productImage.product,
    { cascade: true, eager: true }
  )
  images?: ProductImage[];

  @ManyToOne(
    () => User,
    ( user ) => user.product,
    { eager : true }
  )
  user: User

  @BeforeInsert()
  checkSlugInsert(){
    
    if ( !this.slug ) {
      this.slug = this.title;  
    }

    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ','-')
      .replaceAll("'",'')
  }

  @BeforeUpdate()
  checkSlugUpdate(){
    this.slug = this.slug
    .toLowerCase()
    .replaceAll(' ','-')
    .replaceAll("'",'')
  }

}
